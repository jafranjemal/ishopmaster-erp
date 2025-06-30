import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { tenantRepairService, tenantCustomerService } from "../../services/api";
import RepairIntakeForm from "../../components/service/RepairIntakeForm";

const RepairTicketIntakePage = () => {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      // In a real app with many customers, this should be a searchable dropdown.
      // For now, we fetch a reasonable limit.
      const customerRes = await tenantCustomerService.getAll({ limit: 1000 });

      // --- THE DEFINITIVE FIX ---
      // Our API returns a paginated object: { success, data: [...] }.
      // We must extract the array from the `data` property.
      if (customerRes.data.success) {
        setCustomers(customerRes.data.data);
      } else {
        setCustomers([]);
      }
      // --- END OF FIX ---
    } catch (error) {
      toast.error("Failed to load customer data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveTicket = async (formData) => {
    setIsSaving(true);
    try {
      const response = await toast.promise(tenantRepairService.createTicket(formData), {
        loading: "Creating repair ticket...",
        success: "New ticket created successfully!",
        error: (err) => err.response?.data?.error || "Failed to create ticket.",
      });
      // On success, navigate to the new ticket's detail page or the Kanban board
      if (response.data.success) {
        navigate(`/service/dashboard`); // Redirect to the main dashboard
      }
    } catch (error) {
      // Error is handled by the toast promise
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-400">Loading Intake Form...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">New Repair Intake</h1>
        <p className="mt-1 text-slate-400">Log a new device for service or repair.</p>
      </div>
      <div className="max-w-4xl mx-auto">
        <RepairIntakeForm customers={customers} onSave={handleSaveTicket} onCancel={() => navigate("/service/dashboard")} isSaving={isSaving} />
      </div>
    </div>
  );
};

export default RepairTicketIntakePage;
