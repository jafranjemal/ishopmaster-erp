import { ListChecks, PlusCircle, ShieldAlert } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Button, Card, CardContent, Modal } from 'ui-library';
import QcTemplateForm from '../../components/settings/qc/QcTemplateForm';
import QcTemplateList from '../../components/settings/qc/QcTemplateList';
import { tenantQcTemplateService } from '../../services/api';

const QcTemplatesPage = () => {
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await tenantQcTemplateService.getAll();
      setTemplates(res.data.data);
    } catch (error) {
      toast.error('Failed to load QC templates.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenModal = (item = null) => {
    setEditingTemplate(item);
    setIsModalOpen(true);
  };
  const handleCloseModals = () => {
    setIsModalOpen(false);
    setDeleteConfirm(null);
  };

  const handleSave = async (formData) => {
    setIsSaving(true);
    const apiCall = editingTemplate
      ? tenantQcTemplateService.update(editingTemplate._id, formData)
      : tenantQcTemplateService.create(formData);
    try {
      await toast.promise(apiCall, { loading: 'Saving...', success: 'Template saved!', error: 'Save failed.' });
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
      await toast.promise(tenantQcTemplateService.delete(deleteConfirm._id), {
        loading: `Deleting...`,
        success: 'Template deleted.',
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
          <ListChecks className='h-8 w-8 text-indigo-400' /> Quality Control Templates
        </h1>
        <Button onClick={() => handleOpenModal()}>
          <PlusCircle className='mr-2 h-4 w-4' />
          New Template
        </Button>
      </div>
      <Card>
        <CardContent className='p-0'>
          {isLoading ? (
            <p className='p-8 text-center'>Loading...</p>
          ) : (
            <QcTemplateList templates={templates} onEdit={handleOpenModal} onDelete={setDeleteConfirm} />
          )}
        </CardContent>
      </Card>
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModals}
        title={editingTemplate ? 'Edit QC Template' : 'Create New QC Template'}
      >
        <QcTemplateForm
          templateToEdit={editingTemplate}
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
export default QcTemplatesPage;
