import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { tenantSettingsService } from '../../services/api';
import { Button, Modal, Card, CardContent } from 'ui-library';
import { PlusCircle, ShieldAlert, Coins } from 'lucide-react';
import DenominationList from '../../components/settings/cash-drawer/DenominationList';
import DenominationForm from '../../components/settings/cash-drawer/DenominationForm';

const DrawerConfigurationPage = () => {
  const [denominations, setDenominations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await tenantSettingsService.getDenominations();
      setDenominations(res.data.data);
    } catch (error) {
      toast.error('Failed to load denominations.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };
  const handleCloseModals = () => {
    setIsModalOpen(false);
    setDeleteConfirm(null);
  };

  const handleSave = async (formData) => {
    setIsSaving(true);
    const apiCall = editingItem
      ? tenantSettingsService.updateDenomination(editingItem._id, formData)
      : tenantSettingsService.createDenomination(formData);
    try {
      await toast.promise(apiCall, { loading: 'Saving...', success: 'Denomination saved!', error: 'Save failed.' });
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
    setIsSaving(true);
    try {
      await toast.promise(tenantSettingsService.deleteDenomination(deleteConfirm._id), {
        loading: `Deleting...`,
        success: 'Denomination deleted.',
        error: (err) => err.response?.data?.error || 'Delete failed.',
      });
      fetchData();
      handleCloseModals();
    } catch (err) {
      /* handled by toast */
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-3xl font-bold flex items-center gap-2'>
          <Coins className='h-8 w-8 text-indigo-400' /> Cash Drawer Denominations
        </h1>
        <Button onClick={() => handleOpenModal()}>
          <PlusCircle className='mr-2 h-4 w-4' />
          New Denomination
        </Button>
      </div>
      <Card>
        <CardContent className='p-0'>
          {isLoading ? (
            <p className='p-8 text-center'>Loading...</p>
          ) : (
            <DenominationList denominations={denominations} onEdit={handleOpenModal} onDelete={setDeleteConfirm} />
          )}
        </CardContent>
      </Card>
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModals}
        title={editingItem ? 'Edit Denomination' : 'Create New Denomination'}
      >
        <DenominationForm
          itemToEdit={editingItem}
          onSave={handleSave}
          onCancel={handleCloseModals}
          isSaving={isSaving}
        />
      </Modal>
      <Modal isOpen={Boolean(deleteConfirm)} onClose={handleCloseModals} title='Confirm Deletion'>
        <div className='text-center'>
          <ShieldAlert className='mx-auto h-12 w-12 text-red-500' />
          <p className='mt-4'>Are you sure you want to delete "{deleteConfirm?.name}"?</p>
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
export default DrawerConfigurationPage;
