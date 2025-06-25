import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  tenantInvoiceService,
  tenantPaymentMethodService,
} from "../../services/api";
import { ArrowLeft, CreditCard } from "lucide-react";
import { Button, Modal } from "ui-library";
import SupplierInvoiceDetailView from "../../components/procurement/SupplierInvoiceDetailView";
import PaymentForm from "../../components/procurement/PaymentForm";

const SupplierInvoiceDetailPage = () => {
  const { id: invoiceId } = useParams();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    if (!invoiceId) return;
    try {
      setIsLoading(true);
      const [invoiceRes, methodsRes] = await Promise.all([
        tenantInvoiceService.getById(invoiceId),
        tenantPaymentMethodService.getAll(),
      ]);
      setInvoice(invoiceRes.data.data);
      setPaymentMethods(methodsRes.data.data);
    } catch (error) {
      console.log(error);
      toast.error("Failed to load invoice details.");
      navigate("/procurement/invoices"); // Redirect if invoice not found
    } finally {
      setIsLoading(false);
    }
  }, [invoiceId, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSavePayment = async (paymentData) => {
    setIsSaving(true);
    try {
      await toast.promise(
        tenantInvoiceService.recordPayment(invoiceId, paymentData),
        {
          loading: "Recording payment...",
          success: "Payment recorded successfully!",
          error: (err) =>
            err.response?.data?.error || "Failed to record payment.",
        }
      );
      fetchData(); // Refresh invoice data to show new payment
      setIsModalOpen(false);
    } catch (error) {
      console.error("Payment failed:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading)
    return <div className="p-8 text-center">Loading Invoice...</div>;
  if (!invoice)
    return <div className="p-8 text-center">Invoice not found.</div>;

  const amountDue = invoice.totalAmount - (invoice.amountPaid || 0);
  const isFullyPaid = amountDue < 0.01;

  return (
    <div className="space-y-6">
      <div className="flex gap-3">
        <Link
          to="/procurement/invoices"
          className="flex items-center text-sm text-indigo-400 hover:underline"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Invoice List
        </Link>
        <Link
          to="/accounting/payables"
          className="flex items-center text-sm text-indigo-400 hover:underline"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Accounts Payable
        </Link>
      </div>

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Supplier Invoice</h1>
        {!isFullyPaid && (
          <Button onClick={() => setIsModalOpen(true)}>
            <CreditCard className="mr-2 h-4 w-4" />
            Record Payment
          </Button>
        )}
      </div>

      <SupplierInvoiceDetailView invoice={invoice} />

      {/* We would add a list of payments made here in a future step */}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Record Payment for Invoice #${invoice.supplierInvoiceNumber}`}
        description={`Amount Due: ${amountDue}`}
      >
        <PaymentForm
          amountDue={amountDue}
          paymentMethods={paymentMethods}
          onSave={handleSavePayment}
          onCancel={() => setIsModalOpen(false)}
          isSaving={isSaving}
          paymentDirection="outflow" // This is for paying a supplier
        />
      </Modal>
    </div>
  );
};

export default SupplierInvoiceDetailPage;
