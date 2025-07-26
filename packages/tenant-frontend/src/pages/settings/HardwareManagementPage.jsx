import { HardDrive, PlusCircle, ShieldAlert } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Button, Card, CardContent, Modal } from 'ui-library';
import HardwareDeviceForm from '../../components/settings/hardware/HardwareDeviceForm';
import HardwareDeviceList from '../../components/settings/hardware/HardwareDeviceList';
import { tenantHardwareService, tenantLocationService } from '../../services/api';

const HardwareManagementPage = () => {
  const [devices, setDevices] = useState([]);
  const [branches, setBranches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [devicesRes, branchesRes] = await Promise.all([
        tenantHardwareService.getAll(),
        tenantLocationService.getAllBranches(),
      ]);
      setDevices(devicesRes.data.data);
      setBranches(branchesRes.data.data);
    } catch (error) {
      toast.error('Failed to load hardware devices.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenModal = (item = null) => {
    setEditingDevice(item);
    setIsModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsModalOpen(false);
    setDeleteConfirm(null);
  };

  const handleSave = async (formData) => {
    setIsSaving(true);
    const apiCall = editingDevice
      ? tenantHardwareService.update(editingDevice._id, formData)
      : tenantHardwareService.create(formData);
    try {
      await toast.promise(apiCall, {
        loading: 'Saving device...',
        success: 'Device saved successfully!',
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
      await toast.promise(tenantHardwareService.delete(deleteConfirm._id), {
        loading: `Deleting "${deleteConfirm.name}"...`,
        success: 'Device deleted.',
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
          <HardDrive className='h-8 w-8 text-indigo-400' /> Hardware Devices
        </h1>
        <Button onClick={() => handleOpenModal()}>
          <PlusCircle className='mr-2 h-4 w-4' />
          New Device
        </Button>
      </div>
      <Card>
        <CardContent className='p-0'>
          {isLoading ? (
            <p className='p-8 text-center'>Loading devices...</p>
          ) : (
            <HardwareDeviceList devices={devices} onEdit={handleOpenModal} onDelete={setDeleteConfirm} />
          )}
        </CardContent>
      </Card>
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModals}
        title={editingDevice ? 'Edit Hardware Device' : 'Register New Hardware Device'}
      >
        <HardwareDeviceForm
          deviceToEdit={editingDevice}
          onSave={handleSave}
          onCancel={handleCloseModals}
          isSaving={isSaving}
          branches={branches}
        />
      </Modal>
      <Modal isOpen={Boolean(deleteConfirm)} onClose={handleCloseModals} title='Confirm Deletion'>
        <div className='text-center'>
          <ShieldAlert className='mx-auto h-12 w-12 text-red-500' />
          <p className='mt-4'>Are you sure you want to delete the device "{deleteConfirm?.name}"?</p>
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
export default HardwareManagementPage;
