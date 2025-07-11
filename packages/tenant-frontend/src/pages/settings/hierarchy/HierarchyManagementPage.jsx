import React, { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "react-hot-toast";
import { tenantCategoryService, tenantBrandService, tenantRepairTypeService, tenantDeviceService } from "../../../services/api";
import { Button, Modal, Card, CardContent } from "ui-library";
import HierarchyColumn from "../../../components/settings/hierarchy/HierarchyColumn";
import CategoryForm from "../../../components/settings/hierarchy/CategoryForm";

import { ShieldAlert } from "lucide-react";
import CategoryDetailPanel from "../../../components/settings/CategoryDetailPanel";
import BrandForm from "../../../components/settings/inventory/BrandForm";
import RepairTypeForm from "../../../components/settings/hierarchy/RepairTypeForm";
import DeviceForm from "../../../components/settings/hierarchy/DeviceForm";

/**
 * The definitive, professional page for managing the entire Product & Service Hierarchy.
 * Uses a Miller Column UI for the category tree and a separate detail panel for linking entities.
 */
const HierarchyManagementPage = () => {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [repairTypes, setRepairTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [data, setData] = useState({ categories: [], brands: [], devices: [], repairTypes: [] });

  // The path now stores the full selected category objects, which is more robust.
  const [path, setPath] = useState([]);

  // The definitive modal state management
  const [modalState, setModalState] = useState({ isOpen: false, type: null, parentId: null, data: null });

  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Helper function to convert the nested tree from the API into a flat list for easier lookups.
  const flattenCategories = useCallback((nodes, parent = null) => {
    let list = [];
    if (!nodes) return list;
    for (const node of nodes) {
      const { children, ...rest } = node;
      list.push({ ...rest, parent });
      if (children && children.length > 0) {
        list = list.concat(flattenCategories(children, node._id));
      }
    }
    return list;
  }, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [catRes, brandRes, repairRes] = await Promise.all([
        tenantCategoryService.getHierarchy(),
        tenantBrandService.getAll(),
        tenantRepairTypeService.getAll(),
      ]);
      setData({
        categories: catRes.data.data.map((c) => ({ ...c, type: "category" })),
        brands: brandRes.data.data.map((b) => ({ ...b, type: "brand" })),
        devices: [],
        repairTypes: [],
      });

      setCategories(flattenCategories(catRes.data.data));
      setBrands(brandRes.data.data);
      setRepairTypes(repairRes.data.data);
    } catch (error) {
      toast.error("Failed to fetch hierarchy data.");
    } finally {
      setIsLoading(false);
    }
  }, [flattenCategories]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSelect = async (item, level) => {
    const newPath = [...path.slice(0, level), item];
    setPath(newPath);
    console.log("item ", item);
    if (item.type === "brand") {
      const res = await tenantDeviceService.getAll({ brandId: item._id });
      setData((prev) => ({ ...prev, devices: res.data.data.map((d) => ({ ...d, type: "device" })) }));
    } else if (item.type === "device") {
      const res = await tenantRepairTypeService.getAll({ deviceId: item._id });
      const repairTypeRes = res.data.data.filter((rt) => rt.deviceId === item._id).map((rt) => ({ ...rt, type: "repairType" }));

      setData((prev) => ({ ...prev, repairTypes: repairTypeRes }));
    }
  };

  const handleOpenModal = (type, parentId = null, data = null) => {
    // This single function now opens the modal for any entity type

    setModalState({ isOpen: true, type, parentId, data });
  };

  const handleCloseModals = () => {
    setModalState({ isOpen: false, data: null, parentId: null });
    setDeleteConfirm(null);
  };

  const handleSaveCategory = async (formData) => {
    setIsSaving(true);
    const { data: itemToEdit, parentId } = modalState;
    const dataToSave = { ...formData, parent: parentId };

    try {
      if (itemToEdit?._id) {
        await tenantCategoryService.update(itemToEdit._id, dataToSave);
        toast.success(`Category "${dataToSave.name}" updated successfully!`);
      } else {
        await tenantCategoryService.create(dataToSave);
        toast.success(`Category "${dataToSave.name}" created successfully!`);
      }
      handleCloseModals();
      await fetchData(); // Await the refresh to ensure data is current
    } catch (error) {
      toast.error(`Failed to save category: ` + (error.response?.data?.error || error.message));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async (formData) => {
    setIsSaving(true);
    const { type, data: editingData, parentId } = modalState;
    const isEditMode = Boolean(editingData);
    let apiCall;

    const payload = { ...formData };
    if (!isEditMode && parentId) {
      if (type.toLowerCase().includes("category")) payload.parent = parentId;
      if (type === "device") {
        payload.brandId = parentId;
        payload.categoryId = path.find((p) => p.type === "category" || p.type === "subCategory")?._id;
      }
      if (type === "repairType") payload.deviceId = parentId;
    }

    const serviceMap = {
      category: tenantCategoryService,
      subCategory: tenantCategoryService,
      device: tenantDeviceService,
      repairType: tenantRepairTypeService,
    };
    const service = serviceMap[type];
    apiCall = isEditMode ? service.update(editingData._id, payload) : service.create(payload);

    try {
      await toast.promise(apiCall, { loading: "Saving...", success: "Item saved!", error: (err) => err.response?.data?.error || "Save failed." });
      fetchData();
      handleCloseModals();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveOld = async (formData) => {
    setIsSaving(true);
    const { type, data: itemToEdit, parentId } = modalState;

    // Determine the correct service and data structure
    let service;
    let dataToSave = formData;
    if (type === "category") {
      service = tenantCategoryService;
      dataToSave = { ...formData, parent: parentId };
    } else if (type === "brand") {
      service = tenantBrandService;
    } else if (type === "repairType") {
      service = tenantRepairTypeService;
    } else {
      toast.error("Unknown entity type to save.");
      setIsSaving(false);
      return;
    }

    try {
      if (itemToEdit?._id) {
        await service.update(itemToEdit._id, dataToSave);
        toast.success(`${type} updated successfully!`);
      } else {
        await service.create(dataToSave);
        toast.success(`${type} created successfully!`);
      }
      handleCloseModals();
      await fetchData();
    } catch (error) {
      toast.error(`Failed to save ${type}: ` + (error.response?.data?.error || error.message));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveLinks = async (categoryId, links) => {
    setIsSaving(true);
    try {
      await tenantCategoryService.update(categoryId, links);
      toast.success("Links updated successfully!");
      await fetchData();
    } catch (error) {
      toast.error("Failed to save links: " + (error.response?.data?.error || error.message));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    const { type, data } = deleteConfirm;
    const serviceMap = {
      category: tenantCategoryService,
      subCategory: tenantCategoryService,
      device: tenantDeviceService,
      repairType: tenantRepairTypeService,
    };
    const service = serviceMap[type];
    try {
      await toast.promise(service.delete(data._id), {
        loading: `Deleting...`,
        success: "Item deleted.",
        error: (err) => err.response?.data?.error || "Delete failed.",
      });
      setPath([]);
      fetchData();
      handleCloseModals();
    } catch (err) {
      console.error(err);
    }
  };

  // --- DEFINITIVE, CORRECTED COLUMN GENERATION LOGIC ---
  const columns = useMemo(() => {
    if (isLoading) return [];

    const getChildren = (parentId) => categories.filter((c) => String(c.parent) === String(parentId));

    const cols = [];

    // 1. Always start with the root categories column.
    cols.push({
      title: "Root Categories",
      items: getChildren(null),
      parentId: null,
    });

    // 2. For each selected item in the path, generate the next column of its children.
    // This correctly creates a new column for sub-categories even if it's currently empty,
    // allowing the user to add the first child.
    path.forEach((selectedItem) => {
      const children = getChildren(selectedItem._id);
      cols.push({
        title: `Sub-categories in ${selectedItem.name}`,
        items: children,
        parentId: selectedItem._id,
      });
    });

    return cols;
  }, [categories, path, isLoading]);

  const selectedCategory = path.length > 0 ? path[path.length - 1] : null;

  const columnsToRender = useMemo(() => {
    const cols = [{ title: "Categories", items: data.categories, type: "category", level: 0, parentId: null }];
    let currentItems = data.categories;

    path.forEach((selectedItem, index) => {
      let nextLevelItems = [];
      let nextColTitle = "";
      let nextColType = "";
      let nextParentId = selectedItem._id;
      let hasChildren = (item) => item.children?.length > 0;

      const children = selectedItem.children || [];
      if (children.length > 0) {
        nextLevelItems = children.map((c) => ({ ...c, type: "subCategory" }));
        nextColTitle = "Sub-Categories";
        nextColType = "subCategory";
      } else if (selectedItem.type === "category" || selectedItem.type === "subCategory") {
        nextLevelItems = data.brands;
        nextColTitle = "Brands";
        nextColType = "brand";
        hasChildren = () => true;
      } else if (selectedItem.type === "brand") {
        nextLevelItems = data.devices.filter((d) => d.brandId._id === selectedItem._id);
        nextColTitle = "Devices";
        nextColType = "device";
        hasChildren = () => true;
      } else if (selectedItem.type === "device") {
        nextLevelItems = data.repairTypes.filter((rt) => rt.deviceId === selectedItem._id);
        nextColTitle = "Repair Types";
        nextColType = "repairType";
      }

      if (nextColTitle) {
        cols.push({ title: nextColTitle, items: nextLevelItems, type: nextColType, level: index + 1, parentId: nextParentId, hasChildren });
      }
    });
    return cols;
  }, [path, data]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Product & Service Hierarchy</h1>
      <p className="text-slate-400">Manage the relationships between categories, brands, devices, and repair types.</p>
      <Card className="h-[60vh]">
        <CardContent className="p-0 h-full flex overflow-x-auto">
          {isLoading ? (
            <p className="p-4 w-full text-center">Loading...</p>
          ) : (
            columnsToRender.map((col, index) => (
              <HierarchyColumn
                key={index}
                title={col.title}
                items={col.items}
                selectedId={path[index]?._id}
                onSelect={(item) => handleSelect(item, index)}
                onAdd={() => handleOpenModal(col.type, col.parentId)}
                onEdit={(item) => handleOpenModal(col.type, item.parent || col.parentId, item)}
                onDelete={(item) => setDeleteConfirm({ type: col.type, data: item })}
                itemHasChildren={col.hasChildren}
              />
            ))
          )}
        </CardContent>
      </Card>

      <Modal isOpen={modalState.isOpen} onClose={handleCloseModals} title={`${modalState.data ? "Edit" : "Create"} ${modalState.type}`}>
        {modalState.type?.toLowerCase().includes("category") && (
          <CategoryForm
            allCategories={categories}
            parentId={modalState.parentId}
            itemToEdit={modalState.data}
            onSave={handleSave}
            onCancel={handleCloseModals}
            isSaving={isSaving}
          />
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
          <p className="mt-4">Are you sure you want to delete "{deleteConfirm?.data.name || deleteConfirm?.data.title}"?</p>
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

  return (
    <div className="page-container p-6">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Product & Service Hierarchy</h1>
        <p className="text-slate-400">Manage category relationships below. Use the panel on the right to link Brands to a selected category.</p>

        <div className="flex h-[calc(100vh-250px)] gap-x-4">
          <Card className="flex-1">
            <CardContent className="p-0 h-full flex overflow-x-auto">
              {isLoading ? (
                <div className="p-4 w-full text-center text-slate-400">Loading Hierarchy...</div>
              ) : (
                columns.map((col, index) => (
                  <HierarchyColumn
                    key={index}
                    title={col.title}
                    items={col.items}
                    parentId={col.parentId}
                    selectedId={path[index]?._id}
                    onSelect={(item) => handleSelect(item, index)}
                    onAdd={(parentId) => handleOpenModal(parentId, null)}
                    onEdit={(item) => handleOpenModal(item.parent, item)}
                    onDelete={(item) => setDeleteConfirm({ data: item })}
                    itemHasChildren={(item) => categories.some((c) => String(c.parent) === String(item._id))}
                  />
                ))
              )}
            </CardContent>
          </Card>

          <div className="w-96 flex-shrink-0">
            <CategoryDetailPanel
              category={selectedCategory}
              allBrands={brands}
              allRepairTypes={repairTypes}
              onSaveLinks={handleSaveLinks}
              onAddNewEntity={(type) => handleOpenModal(type, null, null)} // Pass the type to the modal handler
              isSaving={isSaving}
            />
          </div>
        </div>
      </div>

      <Modal isOpen={modalState.isOpen} onClose={handleCloseModals} title={`${modalState.data ? "Edit" : "Create"} ${modalState.type}`}>
        {/* <CategoryForm itemToEdit={modalState.data} onSave={handleSaveCategory} onCancel={handleCloseModals} isSaving={isSaving} /> */}
        {modalState.type === "category" && (
          <CategoryForm
            // For editing an existing category
            itemToEdit={modalState.data}
            // For creating a new category under a specific parent
            parentId={modalState.parentId}
            // The complete list of categories for the dropdown
            allCategories={categories}
            onSave={handleSaveCategory}
            onCancel={handleCloseModals}
            isSaving={isSaving}
          />
        )}

        {modalState.type === "brand" && (
          <BrandForm itemToEdit={modalState.data} onSave={handleSave} onCancel={handleCloseModals} isSaving={isSaving} />
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
