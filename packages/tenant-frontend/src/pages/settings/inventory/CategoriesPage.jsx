import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { PlusCircle, ShieldAlert } from "lucide-react";
import { tenantCategoryService } from "../../../services/api";
import { Button, Modal, Card, CardContent } from "ui-library";
import CategoryList from "../../../components/settings/inventory/CategoryList";
import CategoryForm from "../../../components/settings/inventory/CategoryForm";

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await tenantCategoryService.getAll();
      setCategories(response.data.data);
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch categories.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenCreateModal = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setDeleteConfirm(null);
  };

  const handleSave = async (formData) => {
    setIsSaving(true);
    const apiCall = editingCategory
      ? tenantCategoryService.update(editingCategory._id, formData)
      : tenantCategoryService.create(formData);
    try {
      await toast.promise(apiCall, {
        loading: "Saving category...",
        success: `Category "${formData.name}" saved!`,
        error: (err) => err.response?.data?.error || "Failed to save category.",
      });
      fetchData();
      handleCloseModal();
    } catch (error) {
      console.log(error);
      /* error is handled by toast */
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await toast.promise(tenantCategoryService.delete(deleteConfirm._id), {
        loading: `Deleting ${deleteConfirm.name}...`,
        success: "Category deleted successfully.",
        error: (err) =>
          err.response?.data?.error || "Failed to delete category.",
      });
      fetchData();
      handleCloseModal();
    } catch (error) {
      console.log(error);
      /* error handled by toast */
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manage Categories</h1>
        <Button onClick={handleOpenCreateModal}>
          <PlusCircle className="mr-2 h-4 w-4" /> New Category
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="p-4 text-center">Loading categories...</p>
          ) : (
            <CategoryList
              categories={categories}
              onEdit={handleOpenEditModal}
              onDelete={setDeleteConfirm}
            />
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingCategory ? "Edit Category" : "Create New Category"}
      >
        <CategoryForm
          categoryToEdit={editingCategory}
          onSave={handleSave}
          onCancel={handleCloseModal}
          isSaving={isSaving}
        />
      </Modal>

      <Modal
        isOpen={Boolean(deleteConfirm)}
        onClose={handleCloseModal}
        title="Confirm Deletion"
      >
        <p>Are you sure you want to delete category "{deleteConfirm?.name}"?</p>
        <p className="text-sm text-slate-400 mt-2">
          This is only possible if the category is not assigned to any products.
        </p>
        <div className="mt-6 flex justify-end space-x-4">
          <Button variant="outline" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete Category
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default CategoriesPage;
