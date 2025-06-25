import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { tenantPaymentService } from "../../services/api";
import { ArrowLeft } from "lucide-react";
import PaymentDetailView from "../../components/payments/PaymentDetailView";

const PaymentDetailPage = () => {
  const { id: paymentId } = useParams();
  const [payment, setPayment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await tenantPaymentService.getById(paymentId);
      setPayment(response.data.data);
    } catch (error) {
      console.log(error);
      toast.error("Failed to load payment details.");
    } finally {
      setIsLoading(false);
    }
  }, [paymentId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading)
    return <div className="p-8 text-center">Loading Payment Details...</div>;
  if (!payment)
    return (
      <div className="p-8 text-center text-red-400">Payment not found.</div>
    );

  return (
    <div className="space-y-6">
      <Link
        to="/accounting/payments"
        className="flex items-center text-sm text-indigo-400 hover:underline"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to All Payments
      </Link>
      <PaymentDetailView payment={payment} />
    </div>
  );
};

export default PaymentDetailPage;
