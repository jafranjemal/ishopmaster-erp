const Decimal = require("decimal.js");
const accountingService = require("./accounting.service");
const { recalculateInvoicePayments } = require("./utils/paymentUtils");
const { PaymentError } = require("../errors/paymentErrors");
const logger = require("../config/logger");
const metrics = require("../config/metrics");

// Status rules configuration
const STATUS_RULES = {
  cheque: "pending_clearance",
  card: "completed",
  cash: "completed",
  credit: "pending_clearance",
  default: "completed",
};

// Reference number validation patterns
const REFERENCE_PATTERNS = {
  cheque: /^[0-9]{6,12}$/,
  card: /^(tx|ch)_[a-zA-Z0-9]{24}$/,
  default: /^[a-zA-Z0-9\-_]{1,50}$/,
};

class PaymentsService {
  constructor() {
    this.methodCache = new Map();
  }

  async recordPayment(
    models,
    {
      sourceDocumentObject,
      paymentSourceId,
      paymentSourceType,
      paymentLines,
      ...restOfPaymentData
    },
    userId,
    baseCurrency,
    tenant,
    session = null
  ) {
    const startTime = Date.now();
    let payment;
    const auditTrail = [];

    try {
      // 1. Validate core parameters
      this._validateCoreParameters(paymentSourceId, paymentSourceType, paymentLines);

      // 2. Initialize models with session
      const { Supplier, Customer, Payment, PaymentMethod, Cheque, SupplierInvoice, SalesInvoice } =
        this._initModels(models, session);

      // 3. Process payment methods
      const { methodMap, methodIds } = await this._processPaymentMethods(
        PaymentMethod,
        paymentLines,
        session
      );

      // 4. Handle source document
      const { sourceDocument, sourceLedgerAccountId } = await this._handleSourceDocument(
        sourceDocumentObject,
        paymentSourceId,
        paymentSourceType,
        SupplierInvoice,
        SalesInvoice,
        Supplier,
        Customer,
        session
      );

      // 5. Validate payment amounts
      this._validatePaymentAmounts(paymentLines, sourceDocument);

      // 6. Create enriched payment lines
      const enrichedPaymentLines = this._createEnrichedPaymentLines(paymentLines, methodMap);

      const existingPayment = await Payment.findOne({
        "paymentLines.referenceNumber": { $in: enrichedPaymentLines.map((l) => l.referenceNumber) },
        paymentSourceId, // ✅ Also check same invoice
        paymentSourceType,
        status: { $ne: "voided" }, // Ignore voided payments
      }).session(session);

      if (existingPayment) throw new PaymentError("DUPLICATE_PAYMENT");

      // 7. Create payment record
      payment = await this._createPaymentRecord(
        Payment,
        {
          ...restOfPaymentData,
          paymentSourceId,
          paymentSourceType,
          paymentLines: enrichedPaymentLines,
          processedBy: userId,
        },
        methodMap,
        session
      );

      // 8. Process cheques if any
      await this._processCheques(
        Cheque,
        paymentLines,
        methodMap,
        payment._id,
        restOfPaymentData.direction,
        session
      );

      // 9. Create journal entries
      const journalEntries = this._buildJournalEntries(
        sourceLedgerAccountId,
        paymentLines,
        methodMap,
        restOfPaymentData.direction
      );

      // 10. Post accounting entries
      await this._postAccountingEntries(
        accountingService,
        models,
        journalEntries,
        sourceDocument,
        paymentSourceType,
        payment._id,
        paymentSourceId,
        baseCurrency,
        session,
        tenant
      );

      // 11. Update source document
      await this._updateSourceDocument(sourceDocument, session);

      // 12. Recalculate invoice payments
      await recalculateInvoicePayments(
        models,
        { sourceId: paymentSourceId, sourceType: paymentSourceType },
        session
      );

      // 13. Log successful processing
      metrics.timing("payment.processing.time", Date.now() - startTime);
      logger.info("Payment processed successfully", {
        paymentId: payment._id,
        amount: payment.totalAmount,
        methods: methodIds,
      });

      return payment;
    } catch (error) {
      // Enhanced error handling
      logger.error("Payment processing failed", {
        error: error.message,
        stack: error.stack,
        auditTrail,
      });

      metrics.increment("payment.processing.failure");
      throw this._normalizeError(error);
    }
  }

  // --- Private Methods --- //

  _initModels(models, session) {
    return {
      Supplier: models.Supplier,
      Customer: models.Customer,
      Payment: models.Payment,
      PaymentMethod: models.PaymentMethod,
      Cheque: models.Cheque,
      Account: models.Account,
      SupplierInvoice: models.SupplierInvoice,
      SalesInvoice: models.SalesInvoice,
      session,
    };
  }

  async _processPaymentMethods(PaymentMethod, paymentLines, session) {
    const methodIds = [...new Set(paymentLines.map((line) => line.paymentMethodId))];

    const paymentMethods = await PaymentMethod.find({ _id: { $in: methodIds } }).session(session);

    if (paymentMethods.length !== methodIds.length) {
      const missingIds = methodIds.filter((id) => !paymentMethods.some((m) => m._id.equals(id)));
      throw new PaymentError({
        code: "INVALID_PAYMENT_METHODS",
        details: { missingIds },
        message: "One or more payment methods are invalid",
      });
    }

    const methodMap = new Map(paymentMethods.map((m) => [m._id.toString(), m]));
    return { methodMap, methodIds };
  }

  async _handleSourceDocument(
    sourceDocumentObject,
    paymentSourceId,
    paymentSourceType,
    SupplierInvoice,
    SalesInvoice,
    Supplier,
    Customer,
    session
  ) {
    let sourceDocument = sourceDocumentObject;
    let sourceLedgerAccountId = null;

    if (!sourceDocument) {
      const SourceModel = paymentSourceType === "SupplierInvoice" ? SupplierInvoice : SalesInvoice;
      sourceDocument = await SourceModel.findById(paymentSourceId).session(session);
    }

    if (!sourceDocument) {
      throw new PaymentError({
        code: "SOURCE_DOCUMENT_NOT_FOUND",
        details: { paymentSourceId, paymentSourceType },
        message: "The source document could not be found",
      });
    }

    // Get ledger account based on document type
    if (paymentSourceType === "SupplierInvoice" && sourceDocument.supplierId) {
      const supplier = await Supplier.findById(sourceDocument.supplierId)
        .select("ledgerAccountId name")
        .session(session);
      sourceLedgerAccountId = supplier?.ledgerAccountId;
    } else if (paymentSourceType === "SalesInvoice" && sourceDocument.customerId) {
      const customer = await Customer.findById(sourceDocument.customerId)
        .select("ledgerAccountId name")
        .session(session);
      sourceLedgerAccountId = customer?.ledgerAccountId;
    }

    if (!sourceLedgerAccountId) {
      throw new PaymentError({
        code: "MISSING_LEDGER_ACCOUNT",
        details: {
          documentType: paymentSourceType,
          documentId: paymentSourceId,
        },
        message: "The source document is not linked to a financial account",
      });
    }

    return { sourceDocument, sourceLedgerAccountId };
  }

  _validatePaymentAmounts(paymentLines, sourceDocument) {
    const totalPayment = paymentLines.reduce(
      (sum, line) => sum.plus(new Decimal(line.amount)),
      new Decimal(0)
    );

    const amountDue = new Decimal(sourceDocument.totalAmount).minus(sourceDocument.amountPaid || 0);

    if (totalPayment.gt(amountDue)) {
      throw new PaymentError({
        code: "PAYMENT_AMOUNT_EXCEEDED",
        details: {
          totalPayment: totalPayment.toNumber(),
          amountDue: amountDue.toNumber(),
          maxAllowed: amountDue.toNumber(),
        },
        message: `Payment amount exceeds amount due by ${totalPayment.minus(amountDue).toNumber()}`,
      });
    }
  }

  _createEnrichedPaymentLines(paymentLines, methodMap) {
    return paymentLines.map((line) => {
      const method = methodMap.get(line.paymentMethodId.toString());

      const amount =
        typeof line.amount === "string" ? parseFloat(line.amount.replace(/,/g, "")) : line.amount;

      // Validate reference number format
      if (line.referenceNumber) {
        const pattern = REFERENCE_PATTERNS[method.type] || REFERENCE_PATTERNS.default;
        if (!pattern.test(line.referenceNumber)) {
          throw new PaymentError({
            code: "INVALID_REFERENCE_FORMAT",
            details: {
              methodType: method.type,
              reference: line.referenceNumber,
              expectedPattern: pattern.toString(),
            },
            message: `Invalid reference number format for ${method.type} payment`,
          });
        }
      }

      return {
        ...line,
        amount,
        status: line.status || STATUS_RULES[method.type] || STATUS_RULES.default, // ✅ Preserves existing status
        processedAt: new Date(),
      };
    });
  }

  async _createPaymentRecord(Payment, paymentData, methodMap, session) {
    const hasCheque = paymentData.paymentLines.some(
      (line) => methodMap.get(line.paymentMethodId.toString())?.type === "cheque"
    );

    const [payment] = await Payment.create(
      [
        {
          ...paymentData,
          totalAmount: paymentData.paymentLines.reduce(
            (sum, line) => sum + parseFloat(line.amount),
            0
          ),
          // status: hasCheque ? STATUS_RULES.cheque : "pending",
        },
      ],
      { session }
    );

    // Then update to completed AFTER successful processing
    if (!hasCheque) {
      payment.status = "completed";
      await payment.save({ session });
    }

    return payment;
  }

  async _processCheques(Cheque, paymentLines, methodMap, paymentId, direction, session) {
    const chequesToCreate = paymentLines
      .filter((line) => methodMap.get(line.paymentMethodId.toString())?.type === "cheque")
      .map((line) => ({
        paymentId,
        chequeNumber: line.referenceNumber,
        bankName: line.bankName,
        chequeDate: line.chequeDate,
        amount: line.amount,
        status: "pending_clearance",
        direction,
        metadata: {
          payer: line.payerDetails,
          processedAt: new Date(),
        },
      }));

    if (chequesToCreate.length > 0) {
      await Cheque.create(chequesToCreate, { session });
    }
  }

  _buildJournalEntriesOld(sourceLedgerAccountId, paymentLines, methodMap) {
    const journalEntries = [
      { accountId: sourceLedgerAccountId, debit: 0 }, // Initialize debit
    ];

    const totalAmount = paymentLines.reduce((sum, line) => {
      const amount = new Decimal(line.amount);
      const method = methodMap.get(line.paymentMethodId.toString());

      // Credit line for each payment method
      journalEntries.push({
        accountId: method.type === "cheque" ? method.holdingAccountId : method.linkedAccountId,
        credit: amount.toNumber(),
        metadata: {
          paymentMethod: method.name,
          reference: line.referenceNumber,
          paymentLineStatus: line.status, // ✅ Track status
          timestamp: new Date().toISOString(),
        },
      });

      return sum.plus(amount);
    }, new Decimal(0));

    // Set the debit amount
    journalEntries[0].debit = totalAmount.toNumber();

    return journalEntries;
  }

  _buildJournalEntries(sourceLedgerAccountId, paymentLines, methodMap, direction) {
    const journalEntries = [];
    const totalAmount = paymentLines.reduce(
      (sum, line) => sum.plus(new Decimal(line.amount)),
      new Decimal(0)
    );

    if (!direction) {
      throw new PaymentError("MISSING_DIRECTION", "Payment direction is required");
    }

    if (direction === "inflow") {
      // CUSTOMER PAYMENT (RECEIVING MONEY)
      // 1. Debit cash/bank accounts (increase assets)
      paymentLines.forEach((line) => {
        const amount = new Decimal(line.amount);
        const method = methodMap.get(line.paymentMethodId.toString());

        journalEntries.push({
          accountId: method.type === "cheque" ? method.holdingAccountId : method.linkedAccountId,
          debit: amount.toNumber(), // DEBIT cash/bank
          metadata: {
            paymentMethod: method.name,
            reference: line.referenceNumber,
            paymentLineStatus: line.status,
            timestamp: new Date().toISOString(),
          },
        });
      });

      // 2. Credit accounts receivable (decrease assets)
      journalEntries.push({
        accountId: sourceLedgerAccountId,
        credit: totalAmount.toNumber(), // CREDIT AR
        metadata: {
          description: "Payment received",
          isReconciliationEntry: true,
        },
      });
    } else {
      // SUPPLIER PAYMENT (PAYING MONEY) - unchanged
      journalEntries.push({ accountId: sourceLedgerAccountId, debit: totalAmount.toNumber() });

      paymentLines.forEach((line) => {
        const amount = new Decimal(line.amount);
        const method = methodMap.get(line.paymentMethodId.toString());

        journalEntries.push({
          accountId: method.type === "cheque" ? method.holdingAccountId : method.linkedAccountId,
          credit: amount.toNumber(),
          metadata: {
            paymentMethod: method.name,
            reference: line.referenceNumber,
            paymentLineStatus: line.status,
            timestamp: new Date().toISOString(),
          },
        });
      });
    }

    return journalEntries;
  }

  async _postAccountingEntries(
    accountingService,
    models,
    journalEntries,
    sourceDocument,
    paymentSourceType,
    paymentId,
    paymentSourceId,
    baseCurrency,
    session,
    tenant
  ) {
    await accountingService.createJournalEntry(
      models,
      {
        description: `Payment for ${paymentSourceType} #${
          sourceDocument.invoiceId || sourceDocument.poNumber || paymentSourceId
        }`,
        entries: journalEntries,
        currency: baseCurrency,
        exchangeRateToBase: 1,
        refs: {
          paymentId,
          [`${paymentSourceType.toLowerCase()}Id`]: paymentSourceId,
        },
        auditTrail: {
          userId: session?.user?._id,
          tenantId: tenant,
        },
      },
      session,
      tenant
    );
  }

  async _updateSourceDocument(sourceDocument, session) {
    await sourceDocument.save({ session });
  }

  _normalizeError(error) {
    if (error instanceof PaymentError) return error;

    return new PaymentError({
      code: "PROCESSING_FAILURE",
      details: {
        originalError: error.message,
        stack: error.stack,
      },
      message: "Payment processing failed",
    });
  }

  _validateCoreParameters(paymentSourceId, paymentSourceType, paymentLines) {
    if (!paymentSourceId || !paymentSourceType) {
      throw new PaymentError({
        code: "MISSING_REQUIRED_FIELD",
        details: { paymentSourceId, paymentSourceType },
        message: "Payment source ID and type are required",
      });
    }

    paymentLines.forEach((line, index) => {
      if (isNaN(parseFloat(line.amount))) {
        throw new PaymentError({
          code: "INVALID_AMOUNT",
          details: { index, amount: line.amount },
          message: `Payment line ${index} has invalid amount`,
        });
      }
    });
    paymentLines.forEach((line, index) => {
      if (!line.paymentMethodId) {
        throw new PaymentError({
          code: "MISSING_PAYMENT_METHOD",
          details: { index },
          message: `Payment line ${index} is missing paymentMethodId`,
        });
      }
    });

    if (!paymentLines || !Array.isArray(paymentLines)) {
      throw new PaymentError({
        code: "INVALID_PAYMENT_LINES",
        details: { paymentLines },
        message: "Payment lines must be a non-empty array",
      });
    }
  }
}

module.exports = new PaymentsService();
