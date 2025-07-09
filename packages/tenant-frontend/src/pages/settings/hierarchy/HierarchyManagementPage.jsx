import React, { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "react-hot-toast";
import { tenantCategoryService, tenantBrandService, tenantRepairTypeService } from "../../../services/api";
import { Button, Modal, Card, CardContent } from "ui-library";
import HierarchyColumn from "../../../components/settings/hierarchy/HierarchyColumn";
import CategoryForm from "../../../components/settings/hierarchy/CategoryForm";

import { ShieldAlert } from "lucide-react";
import CategoryDetailPanel from "../../../components/settings/CategoryDetailPanel";
import BrandForm from "../../../components/settings/inventory/BrandForm";
import RepairTypeForm from "../../../components/settings/hierarchy/RepairTypeForm";

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
      const [catRes, brandRes, repairRes] = await Promise.all([tenantCategoryService.getHierarchy(), tenantBrandService.getAll(), tenantRepairTypeService.getAll()]);
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

  const handleSelect = (item, columnIndex) => {
    setPath((prevPath) => {
      const newPath = [...prevPath.slice(0, columnIndex)];
      newPath[columnIndex] = item;
      return newPath;
    });
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
    const { data } = deleteConfirm;

    try {
      await tenantCategoryService.delete(data._id);
      toast.success(`Category "${data.name}" deleted successfully!`);
      handleCloseModals();
      setPath([]); // Reset path after deletion
      await fetchData();
    } catch (error) {
      toast.error(`Failed to delete category: ` + (error.response?.data?.error || error.message));
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

        {modalState.type === "brand" && <BrandForm itemToEdit={modalState.data} onSave={handleSave} onCancel={handleCloseModals} isSaving={isSaving} />}
        {modalState.type === "repairType" && <RepairTypeForm itemToEdit={modalState.data} onSave={handleSave} onCancel={handleCloseModals} isSaving={isSaving} />}
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
