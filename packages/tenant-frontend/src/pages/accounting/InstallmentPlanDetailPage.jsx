import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  tenantInstallmentService,
  tenantPaymentMethodService,
} from "../../services/api";
import { ArrowLeft } from "lucide-react";
import { Button, Modal } from "ui-library";
import PaymentPlanDetailView from "../../components/payments/PaymentPlanDetailView";
import PaymentForm from "../../components/procurement/PaymentForm";
import useAuth from "../../context/useAuth";

const InstallmentPlanDetailPage = () => {
  const { id: planId } = useParams();
  const navigate = useNavigate();
  const { formatCurrency } = useAuth();

  const [plan, setPlan] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // State to manage the payment modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [payingInstallment, setPayingInstallment] = useState(null);

  const fetchData = useCallback(async () => {
    if (!planId) return;
    try {
      setIsLoading(true);
      const [planRes, methodsRes] = await Promise.all([
        tenantInstallmentService.getById(planId),
        tenantPaymentMethodService.getAll(),
      ]);
      setPlan(planRes.data.data);
      setPaymentMethods(methodsRes.data.data);
    } catch (error) {
      toast.error("Failed to load installment plan details.");
      navigate(-1); // Go back if plan not found
    } finally {
      setIsLoading(false);
    }
  }, [planId, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Triggered when a "Pay Now" button is clicked
  const handlePayInstallmentClick = (installment) => {
    setPayingInstallment(installment);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setPayingInstallment(null);
  };

  // Called by the PaymentForm on submission
  const handleSavePayment = async (paymentData) => {
    if (!payingInstallment) return;
    setIsSaving(true);
    try {
      await toast.promise(
        tenantInstallmentService.applyPayment(
          plan._id,
          payingInstallment._id,
          paymentData
        ),
        {
          loading: "Recording payment...",
          success: "Installment paid successfully!",
          error: (err) =>
            err.response?.data?.error || "Failed to record payment.",
        }
      );
      fetchData(); // Refresh the plan details to show the updated status
      handleCloseModal();
    } catch (error) {
      // Error is handled by toast
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading)
    return <div className="p-8 text-center">Loading Installment Plan...</div>;
  if (!plan)
    return (
      <div className="p-8 text-center text-red-400">
        Installment Plan not found.
      </div>
    );

  return (
    <div className="space-y-6">
      <Link
        to={`/crm/customers/${plan.paymentSourceId}`}
        className="flex items-center text-sm text-indigo-400 hover:underline"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Customer Profile
      </Link>

      <PaymentPlanDetailView
        paymentPlan={plan}
        onPayInstallment={handlePayInstallmentClick}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={`Pay Installment for Plan #${plan.planId}`}
        description={`Amount Due: ${formatCurrency(
          payingInstallment?.amountDue || 0
        )}`}
      >
        {payingInstallment && (
          <PaymentForm
            amountDue={payingInstallment.amountDue}
            paymentMethods={paymentMethods}
            onSave={handleSavePayment}
            onCancel={handleCloseModal}
            isSaving={isSaving}
            paymentDirection="inflow" // A customer payment is an inflow
          />
        )}
      </Modal>
    </div>
  );
};

export default InstallmentPlanDetailPage;
