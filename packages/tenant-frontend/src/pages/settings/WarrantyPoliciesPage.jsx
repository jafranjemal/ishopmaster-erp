import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { tenantWarrantyPolicyService } from '../../services/api';
import { Button, Modal, Card, CardContent, CardHeader, CardTitle } from 'ui-library';
import { PlusCircle, ShieldCheck, ShieldAlert } from 'lucide-react';
import WarrantyPolicyList from '../../components/settings/warranties/WarrantyPolicyList';
import WarrantyPolicyForm from '../../components/settings/warranties/WarrantyPolicyForm';

const WarrantyPoliciesPage = () => {
  const [policies, setPolicies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await tenantWarrantyPolicyService.getAll();
      setPolicies(res.data.data);
    } catch (error) {
      toast.error('Failed to load warranty policies.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenModal = (policy = null) => {
    setEditingPolicy(policy);
    setIsModalOpen(true);
  };
  const handleCloseModals = () => {
    setIsModalOpen(false);
    setDeleteConfirm(null);
  };

  const handleSave = async (formData) => {
    setIsSaving(true);
    const apiCall = editingPolicy
      ? tenantWarrantyPolicyService.update(editingPolicy._id, formData)
      : tenantWarrantyPolicyService.create(formData);
    try {
      await toast.promise(apiCall, {
        loading: 'Saving policy...',
        success: 'Policy saved!',
        error: (err) => err.response?.data?.error || 'Save failed.',
      });
      fetchData();
      handleCloseModals();
    } catch (err) {
      /* handled by toast */
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await toast.promise(tenantWarrantyPolicyService.delete(deleteConfirm._id), {
        loading: `Deleting "${deleteConfirm.name}"...`,
        success: 'Policy deleted.',
        error: (err) => err.response?.data?.error || 'Delete failed.',
      });
      fetchData();
      handleCloseModals();
    } catch (err) {
      /* handled by toast */
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold flex items-center gap-2'>
            <ShieldCheck className='h-8 w-8 text-indigo-400' /> Warranty Policies
          </h1>
          <p className='mt-1 text-slate-400'>Create and manage the standard warranty plans offered by your business.</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <PlusCircle className='mr-2 h-4 w-4' /> New Warranty Policy
        </Button>
      </div>
      <Card>
        <CardContent className='p-0'>
          {isLoading ? (
            <p className='p-8 text-center'>Loading policies...</p>
          ) : (
            <WarrantyPolicyList policies={policies} onEdit={handleOpenModal} onDelete={setDeleteConfirm} />
          )}
        </CardContent>
      </Card>
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModals}
        title={editingPolicy ? 'Edit Warranty Policy' : 'Create New Policy'}
      >
        <WarrantyPolicyForm
          policyToEdit={editingPolicy}
          onSave={handleSave}
          onCancel={handleCloseModals}
          isSaving={isSaving}
        />
      </Modal>
      <Modal isOpen={Boolean(deleteConfirm)} onClose={handleCloseModals} title='Confirm Deletion'>
        <div className='text-center'>
          <ShieldAlert className='mx-auto h-12 w-12 text-red-500' />
          <p className='mt-4'>Are you sure you want to delete the policy "{deleteConfirm?.name}"?</p>
        </div>
        <div className='mt-6 flex justify-end space-x-4'>
          <Button variant='outline' onClick={handleCloseModals}>
            Cancel
          </Button>
          <Button variant='destructive' onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
};
export default WarrantyPoliciesPage;
