import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { PlusCircle, ShieldAlert } from "lucide-react";
import { tenantBrandService } from "../../../services/api";
import { Button, Modal, Card, CardContent } from "ui-library";
import BrandList from "../../../components/settings/inventory/BrandList";
import BrandForm from "../../../components/settings/inventory/BrandForm";

const BrandsPage = () => {
  const [brands, setBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await tenantBrandService.getAll();
      setBrands(response.data.data);
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch brands.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenCreateModal = () => {
    setEditingBrand(null);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => setIsModalOpen(false);

  const handleSave = async (formData) => {
    setIsSaving(true);
    const apiCall = editingBrand
      ? tenantBrandService.update(editingBrand._id, formData)
      : tenantBrandService.create(formData);
    try {
      await toast.promise(apiCall, {
        loading: "Saving brand...",
        success: `Brand "${formData.name}" saved!`,
        error: (err) => err.response?.data?.error || "Failed to save brand.",
      });
      fetchData();
      handleCloseModal();
    } catch (error) {
      console.log(error); /* error is handled by toast */
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await toast.promise(tenantBrandService.delete(deleteConfirm._id), {
        loading: `Deleting ${deleteConfirm.name}...`,
        success: "Brand deleted successfully.",
        error: (err) => err.response?.data?.error || "Failed to delete brand.",
      });
      fetchData();
      setDeleteConfirm(null);
    } catch (error) {
      console.log(error);
      /* error handled by toast */
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manage Brands</h1>
        <Button onClick={handleOpenCreateModal}>
          <PlusCircle className="mr-2 h-4 w-4" /> New Brand
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="p-4 text-center">Loading brands...</p>
          ) : (
            <BrandList
              brands={brands}
              onEdit={(brand) => {
                setEditingBrand(brand);
                setIsModalOpen(true);
              }}
              onDelete={setDeleteConfirm}
            />
          )}
        </CardContent>
      </Card>
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingBrand ? "Edit Brand" : "Create New Brand"}
      >
        <BrandForm
          brandToEdit={editingBrand}
          onSave={handleSave}
          onCancel={handleCloseModal}
          isSaving={isSaving}
        />
      </Modal>
      <Modal
        isOpen={Boolean(deleteConfirm)}
        onClose={() => setDeleteConfirm(null)}
        title="Confirm Deletion"
      >
        <p>Are you sure you want to delete brand "{deleteConfirm?.name}"?</p>
        <div className="mt-6 flex justify-end space-x-4">
          <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
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

export default BrandsPage;
