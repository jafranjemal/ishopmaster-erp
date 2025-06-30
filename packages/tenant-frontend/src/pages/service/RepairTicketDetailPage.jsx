import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { tenantRepairService } from "../../services/api";
import { ArrowLeft } from "lucide-react";
import { Button, Modal, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "ui-library";
import RepairTicketDetailView from "../../components/service/RepairTicketDetailView";
import JobSheetEditor from "../../components/service/JobSheetEditor";
import AddJobSheetItemForm from "../../components/service/AddJobSheetItemForm";

const STATUS_OPTIONS = [
  "diagnosing",
  "awaiting_customer_approval",
  "awaiting_parts",
  "in_progress",
  "completed_pending_pickup",
  "closed",
  "cancelled",
];

const RepairTicketDetailPage = () => {
  const { id: ticketId } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await tenantRepairService.getById(ticketId);
      setTicket(res.data.data);
    } catch (error) {
      toast.error("Failed to load repair ticket.");
      navigate("/service/dashboard");
    } finally {
      setIsLoading(false);
    }
  }, [ticketId, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateStatus = async (newStatus) => {
    try {
      await toast.promise(tenantRepairService.updateTicketStatus(ticketId, { status: newStatus }), {
        loading: "Updating status...",
        success: "Status updated!",
        error: "Failed to update status.",
      });
      fetchData();
    } catch (err) {
      /* handled by toast */
    }
  };

  const handleAddItem = async (itemData) => {
    setIsSaving(true);
    try {
      await toast.promise(tenantRepairService.addItemToJobSheet(ticketId, itemData), {
        loading: "Adding item...",
        success: "Item added to job sheet!",
        error: "Failed to add item.",
      });
      fetchData();
      setIsModalOpen(false);
    } catch (err) {
      /* handled by toast */
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveItem = async (itemId) => {
    if (!window.confirm("Are you sure? This will add the part back to inventory.")) return;
    try {
      await toast.promise(tenantRepairService.removeJobSheetItem(ticketId, itemId), {
        loading: "Removing item...",
        success: "Item removed!",
        error: "Failed to remove item.",
      });
      fetchData();
    } catch (err) {
      /* handled by toast */
    }
  };

  if (isLoading) return <div className="p-8 text-center">Loading Repair Ticket...</div>;
  if (!ticket) return <div className="p-8 text-center text-red-400">Repair Ticket not found.</div>;

  return (
    <div className="space-y-6">
      <Link to="/service/dashboard" className="flex items-center text-sm text-indigo-400 hover:underline">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Service Dashboard
      </Link>
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Repair Ticket #{ticket.ticketNumber}</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">Status:</span>
          <Select value={ticket.status} onValueChange={handleUpdateStatus}>
            <SelectTrigger className="w-[220px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s} className="capitalize">
                  {s.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1 space-y-6">
          <RepairTicketDetailView ticket={ticket} />
        </div>
        <div className="lg:col-span-2 space-y-6">
          <JobSheetEditor items={ticket.jobSheet} onAddItem={() => setIsModalOpen(true)} onRemoveItem={handleRemoveItem} />
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Item to Job Sheet">
        <AddJobSheetItemForm onSave={handleAddItem} onCancel={() => setIsModalOpen(false)} isSaving={isSaving} />
      </Modal>
    </div>
  );
};
export default RepairTicketDetailPage;
