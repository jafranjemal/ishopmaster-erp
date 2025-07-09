import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { tenantDeductionRuleService, tenantAccountingService } from "../../../services/api";
import { Button, Modal, Card, CardContent } from "ui-library";
import { PlusCircle, ShieldAlert } from "lucide-react";
import DeductionRuleForm from "../../../components/hr/payroll/DeductionRuleForm";
import DeductionRuleList from "../../../components/hr/payroll/DeductionRuleList";

const DeductionRulesPage = () => {
  const [rules, setRules] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [rulesRes, accountsRes] = await Promise.all([tenantDeductionRuleService.getAll(), tenantAccountingService.getAllAccounts()]);
      setRules(rulesRes.data.data);
      setAccounts(accountsRes.data.data);
    } catch (error) {
      toast.error("Failed to load data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenModal = (rule = null) => {
    setEditingRule(rule);
    setIsModalOpen(true);
  };
  const handleCloseModals = () => {
    setIsModalOpen(false);
    setDeleteConfirm(null);
  };

  const handleSave = async (formData) => {
    setIsSaving(true);
    const apiCall = editingRule ? tenantDeductionRuleService.update(editingRule._id, formData) : tenantDeductionRuleService.create(formData);
    try {
      await toast.promise(apiCall, {
        loading: "Saving rule...",
        success: "Rule saved!",
        error: (err) => err.response?.data?.error || "Save failed.",
      });
      fetchData();
      handleCloseModals();
    } catch (err) {
      /* Handled by toast */
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await toast.promise(tenantDeductionRuleService.delete(deleteConfirm._id), {
        loading: `Deleting "${deleteConfirm.name}"...`,
        success: "Rule deleted.",
        error: (err) => err.response?.data?.error || "Delete failed.",
      });
      fetchData();
      handleCloseModals();
    } catch (err) {
      /* Handled by toast */
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Payroll Deduction Rules</h1>
          <p className="mt-1 text-slate-400">Configure statutory deductions like taxes and social security funds.</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <PlusCircle className="mr-2 h-4 w-4" /> New Deduction Rule
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="p-8 text-center">Loading...</p>
          ) : (
            <DeductionRuleList rules={rules} onEdit={handleOpenModal} onDelete={setDeleteConfirm} />
          )}
        </CardContent>
      </Card>
      <Modal isOpen={isModalOpen} onClose={handleCloseModals} title={editingRule ? "Edit Deduction Rule" : "Create New Rule"}>
        <DeductionRuleForm ruleToEdit={editingRule} accounts={accounts} onSave={handleSave} onCancel={handleCloseModals} isSaving={isSaving} />
      </Modal>
      <Modal isOpen={Boolean(deleteConfirm)} onClose={handleCloseModals} title="Confirm Deletion">
        <div className="text-center">
          <ShieldAlert className="mx-auto h-12 w-12 text-red-500" />
          <p className="mt-4">Are you sure you want to delete the rule "{deleteConfirm?.name}"?</p>
          <p className="text-sm text-slate-400 mt-2">This action cannot be undone.</p>
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <Button variant="outline" onClick={handleCloseModals}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
};
export default DeductionRulesPage;
