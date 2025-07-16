const { v4: uuidv4 } = require("uuid");
const exchangeRateService = require("./exchangeRate.service");
const { default: mongoose } = require("mongoose");

/**
 * The AccountingService handles all core financial logic. It is the only
 * service allowed to write directly to the Ledger, ensuring financial integrity.
 */
class AccountingService {
  /**
   * Creates a balanced, double-entry journal entry, converting all amounts
   * to the tenant's base currency before saving.
   * @param {object} models - The tenant's compiled models (Account, LedgerEntry).
   * @param {object} journalData - The details of the transaction.
   * @param {string} journalData.description - A human-readable description.
   * @param {Date} [journalData.date] - The date of the transaction.
   * @param {Array<object>} journalData.entries - An array of objects, e.g., [{ accountId, debit, credit }].
   * @param {string} journalData.currency - The currency of the original transaction (e.g., 'USD').
   * @param {number} journalData.exchangeRateToBase - The exchange rate to the tenant's base currency.
   * @param {object} [journalData.refs={}] - Optional references like { saleId, purchaseId }.
   * @param {mongoose.ClientSession} session - The Mongoose session for database transaction.
   */
  async createJournalEntry(
    models,
    { description, date, entries, currency, refs = {} },
    session,
    tenant = { settings: { localization: { baseCurrency: "LKR" } } }
  ) {
    const { Account, LedgerEntry } = models;

    const baseCurrency = tenant.settings.localization.baseCurrency;

    const exchangeRateToBase = await exchangeRateService.getRate(models, {
      fromCurrency: currency,
      toCurrency: baseCurrency,
      date: date || new Date(),
    });

    entries = entries.map((e) => ({
      ...e,
      debit: Number(e.debit || 0),
      credit: Number(e.credit || 0),
    }));

    console.log(entries);
    // 1. Validate that the entries are balanced
    const totalDebits = entries.reduce((sum, entry) => sum + (entry.debit || 0), 0);
    const totalCredits = entries.reduce((sum, entry) => sum + (entry.credit || 0), 0);
    console.log("Total Debits:", totalDebits);
    console.log("Total Credits:", totalCredits);
    if (Math.abs(totalDebits - totalCredits) > 1e-9 || totalDebits === 0) {
      throw new Error("Journal entry is unbalanced. Debits must equal credits.");
    }
    if (!currency || !exchangeRateToBase) {
      throw new Error("Currency and exchange rate are required for journal entries.");
    }

    const transactionId = uuidv4();
    const ledgerDocs = [];
    const accountUpdates = new Map();
    // // 2. Create the individual ledger entry documents
    // for (const entry of entries) {
    //   // Determine the debit and credit accounts for this specific transaction line
    //   let debitAccountId, creditAccountId, amount;

    //   if (entry.debit > 0) {
    //     const creditEntry = entries.find(
    //       (e) => e.credit > 0 && Math.abs(e.credit - entry.debit) < 1e-9
    //     );
    //     if (!creditEntry) continue; // This pair will be handled when we process the credit side

    //     debitAccountId = entry.accountId;
    //     creditAccountId = creditEntry.accountId;
    //     amount = entry.debit;
    //   } else {
    //     continue; // Skip credit entries directly, as they are paired with debits
    //   }

    //   // 3. CRITICAL: Convert the transaction amount to the base currency
    //   const amountInBaseCurrency = amount * exchangeRateToBase;

    //   ledgerDocs.push({
    //     transactionId,
    //     description,
    //     date: date || new Date(),
    //     debitAccountId,
    //     creditAccountId,
    //     amount: amountInBaseCurrency, // <-- Always store the base currency amount
    //     originalAmount: amount, // Store original amount for reference
    //     originalCurrency: currency, // Store original currency for reference
    //     exchangeRate: exchangeRateToBase,
    //     ...refs,
    //   });
    // }

    const debitEntries = entries.filter((e) => e.debit > 0);
    const creditEntries = entries.filter((e) => e.credit > 0);

    for (const debit of debitEntries) {
      for (const credit of creditEntries) {
        const amount = Math.min(debit.debit, credit.credit);
        if (amount <= 0) continue;

        const amountInBaseCurrency = amount * exchangeRateToBase;

        ledgerDocs.push({
          transactionId,
          description,
          date: date || new Date(),
          debitAccountId: debit.accountId,
          creditAccountId: credit.accountId,
          amount: amountInBaseCurrency,
          originalAmount: amount,
          originalCurrency: currency,
          exchangeRate: exchangeRateToBase,
          ...refs,
        });

        // ✅ Track account balance changes
        accountUpdates.set(
          debit.accountId,
          (accountUpdates.get(debit.accountId) || 0) + amountInBaseCurrency
        );
        accountUpdates.set(
          credit.accountId,
          (accountUpdates.get(credit.accountId) || 0) - amountInBaseCurrency
        );

        // Reduce matched amounts
        debit.debit -= amount;
        credit.credit -= amount;

        // Stop if this debit is fully consumed
        if (debit.debit < 1e-6) break;
      }
    }

    if (ledgerDocs.length === 0) {
      throw new Error("No valid debit/credit pairs found in journal entry.");
    }

    // 4. Create all entries within the provided transaction session
    await LedgerEntry.create(ledgerDocs, { session });

    // --- THE DEFINITIVE FIX: UPDATE ACCOUNT BALANCES ---
    const bulkOps = [];
    for (const [accountId, change] of accountUpdates.entries()) {
      const update = { $inc: { [`balance.${baseCurrency}`]: change } };
      bulkOps.push({
        updateOne: { filter: { _id: new mongoose.Types.ObjectId(accountId) }, update },
      });
    }
    if (bulkOps.length > 0) {
      await Account.bulkWrite(bulkOps, { session });
    }

    return true;
  }

  /**
   * Seeds a new tenant's database with a standard Chart of Accounts.
   * @param {object} models - The tenant's compiled models, including Account.
   * @param {mongoose.ClientSession} session - The Mongoose session for transaction.
   */
  async seedDefaultAccounts(models, session) {
    const { Account } = models;
    const defaultAccounts = [
      {
        name: "Cash In Hand",
        type: "Asset",
        subType: "Cash",
        isSystemAccount: true,
      },
      {
        name: "Bank Account",
        type: "Asset",
        subType: "Bank",
        isSystemAccount: true,
      },
      {
        name: "Accounts Receivable",
        type: "Asset",
        subType: "Current Asset",
        isSystemAccount: true,
      },
      {
        name: "Inventory Asset",
        type: "Asset",
        subType: "Current Asset",
        isSystemAccount: true,
      },
      {
        name: "Accounts Payable",
        type: "Liability",
        subType: "Current Liability",
        isSystemAccount: true,
      },
      {
        name: "Sales Revenue",
        type: "Revenue",
        subType: "Sales",
        isSystemAccount: true,
      },
      {
        name: "Service Revenue",
        type: "Revenue",
        subType: "Service",
        isSystemAccount: true,
      },
      {
        name: "Cost of Goods Sold",
        type: "Expense",
        subType: "COGS",
        isSystemAccount: true,
      },
      {
        name: "Salaries Expense",
        type: "Expense",
        subType: "Operating Expense",
        isSystemAccount: true,
      },
      {
        name: "Owner's Equity",
        type: "Equity",
        subType: "Capital",
        isSystemAccount: true,
      },
    ];

    await Account.insertMany(defaultAccounts, { session });
    console.log("Default chart of accounts seeded.");
  }

  async createAccount(models, accountData, session) {
    const { Account } = models;
    const newAccounts = await Account.create([accountData], { session });
    return newAccounts[0];
  }
}

// Export a singleton instance so the same service is used across the app
module.exports = new AccountingService();
