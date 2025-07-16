import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import {
  tenantTaxRuleService,
  tenantAccountingService,
  tenantLocationService,
  tenantTaxCategoryService,
} from '../../services/api';
import { Button, Modal, Card, CardContent, CardHeader, CardTitle } from 'ui-library';
import { PlusCircle, Percent, ShieldAlert } from 'lucide-react';
import TaxRuleList from '../../components/settings/tax/TaxRuleList';
import TaxRuleForm from '../../components/settings/tax/TaxRuleForm';

const TaxRulePage = () => {
  const [rules, setRules] = useState([]);
  const [prereqData, setPrereqData] = useState({ accounts: [], branches: [], taxCategories: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [rulesRes, accRes, branchRes, taxCatRes] = await Promise.all([
        tenantTaxRuleService.getAll(),
        tenantAccountingService.getAllAccounts(),
        tenantLocationService.getAllBranches(),
        tenantTaxCategoryService.getAll(),
      ]);
      setRules(rulesRes.data.data);
      setPrereqData({ accounts: accRes.data.data, branches: branchRes.data.data, taxCategories: taxCatRes.data.data });
    } catch (error) {
      toast.error('Failed to load tax rule data.' + JSON.stringify(error));
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
    // --- THE DEFINITIVE FIX: EDIT vs CREATE LOGIC ---
    const apiCall = editingRule
      ? tenantTaxRuleService.update(editingRule._id, formData)
      : tenantTaxRuleService.create(formData);

    try {
      await toast.promise(apiCall, {
        loading: 'Saving rule...',
        success: 'Rule saved successfully!',
        error: (err) => err.response?.data?.error || 'Save failed.',
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
    setIsSaving(true);
    try {
      await toast.promise(tenantTaxRuleService.delete(deleteConfirm._id), {
        loading: `Deleting "${deleteConfirm.name}"...`,
        success: 'Rule deleted.',
        error: (err) => err.response?.data?.error || 'Delete failed.',
      });
      fetchData();
      handleCloseModals();
    } catch (err) {
      /* Handled by toast */
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-3xl font-bold flex items-center gap-2'>
          <Percent className='h-8 w-8 text-indigo-400' /> Tax Rules
        </h1>
        <Button onClick={() => handleOpenModal()}>
          <PlusCircle className='mr-2 h-4 w-4' />
          New Tax Rule
        </Button>
      </div>
      <Card>
        <CardContent className='p-0'>
          {isLoading ? (
            <p className='p-8 text-center'>Loading...</p>
          ) : (
            <TaxRuleList rules={rules} onEdit={handleOpenModal} onDelete={setDeleteConfirm} />
          )}
        </CardContent>
      </Card>
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModals}
        title={editingRule ? 'Edit Tax Rule' : 'Create New Tax Rule'}
      >
        <TaxRuleForm
          isOpen={isModalOpen}
          ruleToEdit={editingRule}
          {...prereqData}
          onSave={handleSave}
          onCancel={handleCloseModals}
          isSaving={isSaving}
        />
      </Modal>
      <Modal isOpen={Boolean(deleteConfirm)} onClose={handleCloseModals} title='Confirm Deletion'>
        <div className='text-center'>
          <ShieldAlert className='mx-auto h-12 w-12 text-red-500' />
          <p className='mt-4'>Are you sure you want to delete the rule "{deleteConfirm?.name}"?</p>
        </div>
        <div className='mt-6 flex justify-end space-x-4'>
          <Button variant='outline' onClick={handleCloseModals}>
            Cancel
          </Button>
          <Button variant='destructive' onClick={handleDelete} disabled={isSaving}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
};
export default TaxRulePage;
