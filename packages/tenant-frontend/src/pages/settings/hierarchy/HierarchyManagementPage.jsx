import React, { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "react-hot-toast";
import { tenantCategoryService, tenantBrandService, tenantDeviceService, tenantRepairTypeService } from "../../../services/api";
import { Button, Modal, Card, CardContent } from "ui-library";
import HierarchyColumn from "../../../components/settings/hierarchy/HierarchyColumn";
import CategoryForm from "../../../components/settings/hierarchy/CategoryForm";
import DeviceForm from "../../../components/settings/hierarchy/DeviceForm";
import RepairTypeForm from "../../../components/settings/hierarchy/RepairTypeForm";
import { ShieldAlert } from "lucide-react";

const HierarchyManagementPage = () => {
  const [data, setData] = useState({ categories: [], brands: [], devices: [], repairTypes: [] });
  const [selections, setSelections] = useState({ category: null, brand: null, device: null });
  const [isLoading, setIsLoading] = useState(true);
  const [modalState, setModalState] = useState({ isOpen: false, type: "", data: null, parentId: null });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [catRes, brandRes] = await Promise.all([tenantCategoryService.getAll(), tenantBrandService.getAll()]);
      setData((prev) => ({ ...prev, categories: catRes.data.data, brands: brandRes.data.data }));
    } catch (error) {
      toast.error("Failed to load hierarchy data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSelect = async (level, item) => {
    if (level === "category") setSelections({ category: item._id, brand: null, device: null });
    if (level === "brand") {
      setSelections((prev) => ({ ...prev, brand: item._id, device: null }));
      const res = await tenantDeviceService.getAll({ brandId: item._id });
      setData((prev) => ({ ...prev, devices: res.data.data }));
    }
    if (level === "device") {
      setSelections((prev) => ({ ...prev, device: item._id }));
      const res = await tenantRepairTypeService.getAll({ deviceId: item._id });
      setData((prev) => ({ ...prev, repairTypes: res.data.data }));
    }
  };

  const handleOpenModal = (type, parentId = null, itemToEdit = null) => setModalState({ isOpen: true, type, data: itemToEdit, parentId });
  const handleCloseModals = () => {
    setModalState({ isOpen: false });
    setDeleteConfirm(null);
  };

  const handleSave = async (formData) => {
    setIsSaving(true);
    const { type, data: editingData, parentId } = modalState;
    const isEditMode = Boolean(editingData);
    let apiCall;

    const payload = { ...formData };
    if (!isEditMode) {
      // Add parent IDs only on create
      if (type === "subCategory") payload.parentCategory = parentId;
      if (type === "device") {
        payload.brandId = parentId;
        payload.categoryId = selections.category;
      }
      if (type === "repairType") payload.deviceId = parentId;
    }

    if (isEditMode) {
      if (type.includes("Category")) apiCall = tenantCategoryService.update(editingData._id, payload);
      else if (type === "device") apiCall = tenantDeviceService.update(editingData._id, payload);
      else if (type === "repairType") apiCall = tenantRepairTypeService.update(editingData._id, payload);
    } else {
      if (type.includes("Category")) apiCall = tenantCategoryService.create(payload);
      else if (type === "device") apiCall = tenantDeviceService.create(payload);
      else if (type === "repairType") apiCall = tenantRepairTypeService.create(payload);
    }

    try {
      await toast.promise(apiCall, { loading: "Saving...", success: "Item saved!", error: (err) => err.response?.data?.error || "Save failed." });
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
    const { type, data } = deleteConfirm;
    let apiCall;
    if (type.includes("Category")) apiCall = tenantCategoryService.delete(data._id);
    else if (type === "device") apiCall = tenantDeviceService.delete(data._id);
    else if (type === "repairType") apiCall = tenantRepairTypeService.delete(data._id);

    try {
      await toast.promise(apiCall, {
        loading: `Deleting ${data.name}...`,
        success: "Item deleted.",
        error: (err) => err.response?.data?.error || "Delete failed.",
      });
      fetchData();
      handleCloseModals();
    } catch (err) {
      /* handled by toast */
    }
  };

  const topLevelCategories = data.categories.filter((c) => !c.parentCategory);

  const findNode = (nodes, id) => {
    for (const node of nodes) {
      if (node._id === id) return node;
      if (node.children) {
        const found = findNode(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const subCategories = useMemo(() => {
    if (!selections.category) return [];
    const selectedNode = findNode(data.categories, selections.category);
    return selectedNode?.children || [];
  }, [selections.category, data.categories]);

  const secondColumnItems = subCategories.length > 0 ? subCategories : data.brands;
  const secondColumnTitle = subCategories.length > 0 ? "Sub-Categories" : "Brands";
  const secondColumnType = subCategories.length > 0 ? "subCategory" : "brand";

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Product & Service Hierarchy</h1>
      <p className="text-slate-400">Manage the relationships between categories, brands, devices, and repair types.</p>
      <Card className="h-[60vh]">
        <CardContent className="p-0 h-full flex overflow-x-auto">
          {isLoading ? (
            <p className="p-4">Loading...</p>
          ) : (
            <>
              <HierarchyColumn
                title="Categories"
                items={data.categories.filter((c) => !c.parentCategory)}
                selectedId={selections.category}
                onSelect={(item) => handleSelect("category", item)}
                onAdd={() => handleOpenModal("category")}
                onEdit={(item) => handleOpenModal("category", null, item)}
                onDelete={(item) => setDeleteConfirm({ type: "category", data: item })}
                itemHasChildren={(item) => item.children?.length > 0}
              />
              {selections.category && (
                <HierarchyColumn
                  title={secondColumnTitle}
                  items={secondColumnItems}
                  selectedId={selections.brand}
                  onSelect={(item) => handleSelect(secondColumnType, item)}
                  onAdd={() => handleOpenModal("subCategory", selections.category)}
                  onEdit={(item) => handleOpenModal("subCategory", selections.category, item)}
                  onDelete={(item) => setDeleteConfirm({ type: "subCategory", data: item })}
                />
              )}
              {selections.brand && (
                <HierarchyColumn
                  title="Devices"
                  items={data.devices}
                  selectedId={selections.device}
                  onSelect={(item) => handleSelect("device", item)}
                  onAdd={() => handleOpenModal("device", selections.brand)}
                  onEdit={(item) => handleOpenModal("device", selections.brand, item)}
                  onDelete={(item) => setDeleteConfirm({ type: "device", data: item })}
                />
              )}
              {selections.device && (
                <HierarchyColumn
                  title="Repair Types"
                  items={data.repairTypes}
                  selectedId={null}
                  onSelect={() => {}}
                  onAdd={() => handleOpenModal("repairType", selections.device)}
                  onEdit={(item) => handleOpenModal("repairType", selections.device, item)}
                  onDelete={(item) => setDeleteConfirm({ type: "repairType", data: item })}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
      <Modal isOpen={modalState.isOpen} onClose={handleCloseModals} title={`${modalState.data ? "Edit" : "Create"} ${modalState.type}`}>
        {(modalState.type === "category" || modalState.type === "subCategory") && (
          <CategoryForm itemToEdit={modalState.data} onSave={handleSave} onCancel={handleCloseModals} isSaving={isSaving} />
        )}
        {modalState.type === "device" && (
          <DeviceForm itemToEdit={modalState.data} onSave={handleSave} onCancel={handleCloseModals} isSaving={isSaving} />
        )}
        {modalState.type === "repairType" && (
          <RepairTypeForm itemToEdit={modalState.data} onSave={handleSave} onCancel={handleCloseModals} isSaving={isSaving} />
        )}
      </Modal>
      <Modal isOpen={Boolean(deleteConfirm)} onClose={handleCloseModals} title="Confirm Deletion">
        <div className="text-center">
          <ShieldAlert className="mx-auto h-12 w-12 text-red-500" />
          <p className="mt-4">Are you sure you want to delete "{deleteConfirm?.data.name}"?</p>
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
export default HierarchyManagementPage;
