import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { PlusCircle, ShieldAlert } from "lucide-react";
import { tenantCategoryService } from "../../../services/api";
import { Button, Modal, Card, CardContent } from "ui-library";
import CategoryList from "../../../components/settings/inventory/CategoryList";
import CategoryForm from "../../../components/settings/hierarchy/CategoryForm";

const CategoriesPage = () => {
  const [categoryTree, setCategoryTree] = useState([]); // Holds the nested tree
  const [flatCategories, setFlatCategories] = useState([]); // A flat list for the dropdown
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // A more robust state to handle the modal's context
  const [modalState, setModalState] = useState({ isOpen: false, data: null, parentId: null });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      // The API now returns the nested tree structure directly
      const response = await tenantCategoryService.getHierarchy();
      setCategoryTree(response.data.data);

      // We also need a flat version for the parent selector dropdown
      const flatten = (nodes) => {
        let list = [];
        for (const node of nodes) {
          const { children, ...rest } = node;
          list.push(rest);
          if (children && children.length > 0) {
            list = list.concat(flatten(children));
          }
        }
        return list;
      };
      setFlatCategories(flatten(response.data.data));
    } catch (error) {
      toast.error("Failed to fetch categories.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenModal = (parentId = null, data = null) => {
    setModalState({ isOpen: true, data, parentId });
  };

  const handleCloseModal = () => {
    setModalState({ isOpen: false, data: null, parentId: null });
    setDeleteConfirm(null);
  };

  const handleSave = async (formData) => {
    setIsSaving(true);
    const { data: itemToEdit, parentId } = modalState;
    const dataToSave = { ...formData, parent: parentId };

    const apiCall = itemToEdit ? tenantCategoryService.update(itemToEdit._id, dataToSave) : tenantCategoryService.create(dataToSave);

    try {
      await toast.promise(apiCall, {
        loading: "Saving category...",
        success: `Category "${dataToSave.name}" saved!`,
        error: (err) => err.response?.data?.error || "Failed to save category.",
      });
      fetchData();
      handleCloseModal();
    } catch (error) {
      // Error is handled by react-hot-toast
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
        error: (err) => err.response?.data?.error || "Failed to delete category.",
      });
      fetchData();
      handleCloseModal();
    } catch (error) {
      // Error is handled by react-hot-toast
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manage Categories</h1>
        {/* This button now correctly creates a ROOT category */}
        <Button onClick={() => handleOpenModal(null, null)}>
          <PlusCircle className="mr-2 h-4 w-4" /> New Root Category
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="p-4 text-center">Loading categories...</p>
          ) : (
            <CategoryList
              categories={categoryTree}
              onEdit={(category) => handleOpenModal(category.parent, category)}
              onDelete={setDeleteConfirm}
              // This new prop handles adding children directly from the list
              onAddChild={(parentId) => handleOpenModal(parentId, null)}
            />
          )}
        </CardContent>
      </Card>

      <Modal isOpen={modalState.isOpen} onClose={handleCloseModal} title={modalState.data ? "Edit Category" : "Create New Category"}>
        <CategoryForm
          itemToEdit={modalState.data}
          parentId={modalState.parentId}
          allCategories={flatCategories} // Pass the flat list to the "intelligent" form
          onSave={handleSave}
          onCancel={handleCloseModal}
          isSaving={isSaving}
        />
      </Modal>

      <Modal isOpen={Boolean(deleteConfirm)} onClose={handleCloseModal} title="Confirm Deletion">
        <div className="text-center">
          <ShieldAlert className="mx-auto h-12 w-12 text-red-500" />
          <p className="mt-4">Are you sure you want to delete category "{deleteConfirm?.name}"?</p>
          <p className="text-sm text-slate-400 mt-2">This is only possible if the category has no sub-categories and is not assigned to any products.</p>
        </div>
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
