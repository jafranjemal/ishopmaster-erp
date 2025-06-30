import React, { useState } from "react";
import { Modal, Button } from "ui-library";
import { tenantInstallmentService } from "../../services/api";
import { toast } from "react-hot-toast";
import PaymentPlanForm from "../payments/PaymentPlanForm"; // Our existing, reusable form

/**
 * A modal component that wraps the PaymentPlanForm for use in the POS workflow.
 * @param {object} props
 * @param {boolean} props.isOpen - Controls the visibility of the modal.
 * @param {Function} props.onClose - Function to call to close the modal.
 * @param {number} props.totalAmount - The total amount of the sale to be put on a plan.
 * @param {Function} props.onPlanCreated - Callback function that receives the newly created plan object on success.
 */
const InstallmentPlanModal = ({ isOpen, onClose, totalAmount, onPlanCreated }) => {
  const [isSaving, setIsSaving] = useState(false);

  const handleSavePlan = async (planConfig) => {
    setIsSaving(true);
    try {
      const payload = {
        totalAmount,
        ...planConfig,
        // In a real app, the `paymentSourceId` (the SalesInvoice) would be passed in or created here.
        // For now, we'll mock it. This will be connected in the main SalesService chapter.
        paymentSourceId: "686d4b9b9a6b2c2445b23d9b", // Placeholder
        paymentSourceType: "SalesInvoice",
      };

      const response = await toast.promise(tenantInstallmentService.create(payload), {
        loading: "Creating installment plan...",
        success: "Installment plan created successfully!",
        error: (err) => err.response?.data?.error || "Failed to create plan.",
      });

      if (response.data.success) {
        onPlanCreated(response.data.data); // Notify the parent POS screen
        onClose(); // Close this modal
      }
    } catch (error) {
      // The toast promise already displays the error to the user
      console.error("Failed to save installment plan:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Installment Plan">
      <PaymentPlanForm totalAmount={totalAmount} onSave={handleSavePlan} onCancel={onClose} isSaving={isSaving} />
    </Modal>
  );
};

export default InstallmentPlanModal;
