import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { tenantLeadService } from "../../services/api";
import { Button, Modal, Card, CardContent, CardHeader, CardTitle } from "ui-library";
import { PlusCircle } from "lucide-react";
import LeadList from "../../components/crm/leads/LeadList";
import LeadForm from "../../components/crm/leads/LeadForm";

const LeadManagementPage = () => {
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  // We can use the same modal for create/edit, but for now it's just create
  const [editingLead, setEditingLead] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await tenantLeadService.getAll({ status: "new" });
      setLeads(res.data.data);
    } catch (error) {
      toast.error("Failed to load new leads.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveLead = async (formData) => {
    setIsSaving(true);
    try {
      await toast.promise(tenantLeadService.create(formData), {
        loading: "Saving new lead...",
        success: "Lead created successfully!",
        error: "Failed to create lead.",
      });
      fetchData();
      setIsModalOpen(false);
    } catch (err) {
      /* handled by toast */
    } finally {
      setIsSaving(false);
    }
  };

  const handleConvertLead = async (leadId) => {
    try {
      await toast.promise(tenantLeadService.convert(leadId), {
        loading: "Converting lead...",
        success: "Lead converted to Customer & Opportunity!",
        error: "Conversion failed.",
      });
      fetchData(); // Refresh the list of new leads
    } catch (err) {
      /* handled by toast */
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">New Leads Inbox</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <PlusCircle className="h-4 w-4 mr-2" /> Create New Lead
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Leads to be Contacted</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? <p className="p-8 text-center">Loading...</p> : <LeadList leads={leads} onConvert={handleConvertLead} />}
        </CardContent>
      </Card>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Lead">
        <LeadForm onSave={handleSaveLead} onCancel={() => setIsModalOpen(false)} isSaving={isSaving} />
      </Modal>
    </div>
  );
};
export default LeadManagementPage;
