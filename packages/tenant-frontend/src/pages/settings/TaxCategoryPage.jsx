import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { tenantTaxCategoryService } from '../../services/api';
import { Button, Modal, Card, CardContent } from 'ui-library';
import { PlusCircle, ShieldAlert } from 'lucide-react';
import TaxCategoryList from '../../components/settings/tax/TaxCategoryList';
import TaxCategoryForm from '../../components/settings/tax/TaxCategoryForm';

const TaxCategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await tenantTaxCategoryService.getAll();
      setCategories(res.data.data);
    } catch (error) {
      toast.error('Failed to load tax categories.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async (formData) => {
    const apiCall = editingCategory
      ? tenantTaxCategoryService.update(editingCategory._id, formData)
      : tenantTaxCategoryService.create(formData);
    try {
      await toast.promise(apiCall, { loading: 'Saving...', success: 'Category saved!', error: 'Save failed.' });
      fetchData();
      setIsModalOpen(false);
    } catch (err) {}
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await toast.promise(tenantTaxCategoryService.delete(deleteConfirm._id), {
        loading: `Deleting...`,
        success: 'Category deleted.',
        error: (err) => err.response?.data?.error || 'Delete failed.',
      });
      fetchData();
      setDeleteConfirm(null);
    } catch (err) {}
  };

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-3xl font-bold'>Tax Categories</h1>
        <Button
          onClick={() => {
            setEditingCategory(null);
            setIsModalOpen(true);
          }}
        >
          <PlusCircle className='mr-2 h-4 w-4' />
          New Tax Category
        </Button>
      </div>
      <Card>
        <CardContent className='p-0'>
          {isLoading ? (
            <p className='p-8 text-center'>Loading...</p>
          ) : (
            <TaxCategoryList
              categories={categories}
              onEdit={(cat) => {
                setEditingCategory(cat);
                setIsModalOpen(true);
              }}
              onDelete={setDeleteConfirm}
            />
          )}
        </CardContent>
      </Card>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit Tax Category' : 'Create New Tax Category'}
      >
        <TaxCategoryForm categoryToEdit={editingCategory} onSave={handleSave} onCancel={() => setIsModalOpen(false)} />
      </Modal>
      <Modal isOpen={Boolean(deleteConfirm)} onClose={() => setDeleteConfirm(null)} title='Confirm Deletion'>
        <div className='text-center'>
          <ShieldAlert className='mx-auto h-12 w-12 text-red-500' />
          <p className='mt-4'>Are you sure you want to delete "{deleteConfirm?.name}"?</p>
        </div>
        <div className='mt-6 flex justify-end space-x-4'>
          <Button variant='outline' onClick={() => setDeleteConfirm(null)}>
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
export default TaxCategoryPage;
