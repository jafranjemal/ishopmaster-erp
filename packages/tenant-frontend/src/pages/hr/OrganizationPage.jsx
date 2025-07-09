import React, { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "react-hot-toast";
import { tenantDepartmentService, tenantJobPositionService } from "../../services/api";
import { Button, Modal, Card, CardContent, CardHeader, CardTitle } from "ui-library";
import { PlusCircle, FilePenLine, Trash2, ChevronRight, Building2, ShieldAlert } from "lucide-react";
import { cn } from "ui-library";
import DepartmentForm from "../../components/hr/department/DepartmentForm";
import JobPositionForm from "../../components/hr/jobPosition/JobPositionForm";

// --- Reusable Column Component ---
const HierarchyColumn = ({ title, items = [], selectedId, onSelect, onAdd, onEdit, onDelete }) => (
  <div className="flex-shrink-0 w-1/2 border-r border-slate-700 flex flex-col h-full">
    <div className="p-3 border-b border-slate-700 flex justify-between items-center flex-shrink-0">
      <h4 className="font-semibold text-base uppercase tracking-wider text-slate-300">{title}</h4>
      {onAdd && (
        <Button variant="ghost" size="sm" onClick={onAdd}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add New
        </Button>
      )}
    </div>
    <div className="overflow-y-auto">
      {items.length === 0 ? (
        <p className="text-sm text-center text-slate-500 p-4">No items yet.</p>
      ) : (
        items.map((item) => (
          <div
            key={item._id}
            onClick={() => onSelect(item)}
            className={cn(
              "group flex justify-between items-center p-3 text-sm cursor-pointer hover:bg-slate-700/50",
              selectedId === item._id && "bg-indigo-600/30 text-white font-semibold"
            )}
          >
            <span className="truncate" title={item.name || item.title}>
              {item.name || item.title}
            </span>
            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(item);
                }}
              >
                <FilePenLine className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item);
                }}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
              <ChevronRight className="h-4 w-4 text-slate-500 flex-shrink-0" />
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

// --- Reusable Form Components ---
const DepartmentForm1 = ({ itemToEdit, onSave, onCancel, isSaving }) => {
  const [name, setName] = useState("");
  useEffect(() => {
    setName(itemToEdit?.name || "");
  }, [itemToEdit]);
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ name });
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Department Name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="pt-4 flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
};

const JobPositionForm1 = ({ itemToEdit, onSave, onCancel, isSaving }) => {
  const [title, setTitle] = useState("");
  useEffect(() => {
    setTitle(itemToEdit?.title || "");
  }, [itemToEdit]);
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ title });
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Job Title (e.g., Senior Technician)</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div className="pt-4 flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
};

// --- Main Page Orchestrator ---
const OrganizationPage = () => {
  const [departments, setDepartments] = useState([]);
  const [jobPositions, setJobPositions] = useState([]);
  const [selectedDept, setSelectedDept] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [modalState, setModalState] = useState({ isOpen: false, type: "", data: null });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [deptRes, posRes] = await Promise.all([tenantDepartmentService.getAll(), tenantJobPositionService.getAll()]);
      setDepartments(deptRes.data.data);
      setJobPositions(posRes.data.data);
    } catch (error) {
      toast.error("Failed to load organization data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenModal = (type, itemToEdit = null) => {
    setModalState({ isOpen: true, type, data: itemToEdit });
  };

  const handleCloseModals = () => {
    setModalState({ isOpen: false, type: "", data: null });
    setDeleteConfirm(null);
  };

  const handleSave = async (formData) => {
    setIsSaving(true);
    const { type, data: editingData } = modalState;
    const isEditMode = Boolean(editingData);
    let apiCall;

    if (type === "department") {
      apiCall = isEditMode ? tenantDepartmentService.update(editingData._id, formData) : tenantDepartmentService.create(formData);
    } else if (type === "position") {
      const payload = { ...formData, departmentId: selectedDept._id };
      apiCall = isEditMode ? tenantJobPositionService.update(editingData._id, payload) : tenantJobPositionService.create(payload);
    }

    try {
      await toast.promise(apiCall, { loading: "Saving...", success: "Changes saved!", error: (err) => err.response?.data?.error || "Save failed." });
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
    if (type === "department") apiCall = tenantDepartmentService.delete(data._id);
    if (type === "position") apiCall = tenantJobPositionService.delete(data._id);

    try {
      await toast.promise(apiCall, {
        loading: `Deleting ${data.name || data.title}...`,
        success: "Item deleted.",
        error: (err) => err.response?.data?.error || "Delete failed.",
      });
      if (type === "department" && selectedDept?._id === data._id) {
        setSelectedDept(null); // Deselect if the active department was deleted
      }
      fetchData();
      handleCloseModals();
    } catch (err) {
      /* handled by toast */
    }
  };

  const positionsForSelectedDept = useMemo(() => {
    return selectedDept ? jobPositions.filter((p) => p.departmentId?._id === selectedDept._id) : [];
  }, [selectedDept, jobPositions]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-slate-800 rounded-lg">
          <Building2 className="h-8 w-8 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Organization Setup</h1>
          <p className="mt-1 text-slate-400">Define your company's departments and the job positions within them.</p>
        </div>
      </div>
      <Card className="h-[65vh]">
        <CardContent className="p-0 h-full flex overflow-hidden">
          {isLoading ? (
            <p className="p-4 w-full text-center">Loading Organization Structure...</p>
          ) : (
            <>
              <HierarchyColumn
                title="Departments"
                items={departments}
                selectedId={selectedDept?._id}
                onSelect={setSelectedDept}
                onAdd={() => handleOpenModal("department")}
                onEdit={(item) => handleOpenModal("department", item)}
                onDelete={(item) => setDeleteConfirm({ type: "department", data: item })}
              />
              <HierarchyColumn
                title={selectedDept ? `Job Positions in ${selectedDept.name}` : "Job Positions"}
                items={positionsForSelectedDept}
                selectedId={null}
                onSelect={() => {}} // No selection action needed for positions
                onAdd={selectedDept ? () => handleOpenModal("position") : null}
                onEdit={(item) => handleOpenModal("position", item)}
                onDelete={(item) => setDeleteConfirm({ type: "position", data: item })}
              />
            </>
          )}
        </CardContent>
      </Card>

      <Modal isOpen={modalState.isOpen} onClose={handleCloseModals} title={`${modalState.data ? "Edit" : "Create"} ${modalState.type}`}>
        {modalState.type === "department" && (
          <DepartmentForm itemToEdit={modalState.data} onSave={handleSave} onCancel={handleCloseModals} isSaving={isSaving} />
        )}
        {modalState.type === "position" && (
          <JobPositionForm itemToEdit={modalState.data} onSave={handleSave} onCancel={handleCloseModals} isSaving={isSaving} />
        )}
      </Modal>

      <Modal isOpen={Boolean(deleteConfirm)} onClose={handleCloseModals} title="Confirm Deletion">
        <div className="text-center">
          <ShieldAlert className="mx-auto h-12 w-12 text-red-500" />
          <p className="mt-4">Are you sure you want to delete "{deleteConfirm?.data.name || deleteConfirm?.data.title}"?</p>
          <p className="text-sm text-slate-400 mt-2">This action cannot be undone and may affect assigned employees.</p>
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

export default OrganizationPage;
