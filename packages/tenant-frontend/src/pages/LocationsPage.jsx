import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import {
  Building,
  Warehouse as WarehouseIcon,
  ShieldAlert,
} from "lucide-react";
import { tenantLocationService } from "../services/api";
import { Button, Modal } from "ui-library";
import LocationList from "../components/locations/LocationList";
import BranchForm from "../components/locations/BranchForm";
import WarehouseForm from "../components/locations/WarehouseForm";

const LocationsPage = () => {
  const [branches, setBranches] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: null,
    data: null,
  }); // type: 'branch' or 'warehouse'
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    type: null,
    data: null,
  });

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [branchesRes, warehousesRes] = await Promise.all([
        tenantLocationService.getAllBranches(),
        tenantLocationService.getAllWarehouses(),
      ]);
      setBranches(branchesRes.data.data);
      setWarehouses(warehousesRes.data.data);
    } catch (error) {
      console.error("Failed to load locations:", error);
      toast.error("Failed to load locations.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async (type, formData) => {
    const isEditMode = Boolean(modalState.data);
    const apiCall = isEditMode
      ? type === "branch"
        ? tenantLocationService.updateBranch(modalState.data._id, formData)
        : tenantLocationService.updateWarehouse(modalState.data._id, formData)
      : type === "branch"
      ? tenantLocationService.createBranch(formData)
      : tenantLocationService.createWarehouse(formData);

    try {
      await toast.promise(apiCall, {
        loading: "Saving...",
        success: `${
          type.charAt(0).toUpperCase() + type.slice(1)
        } saved successfully!`,
        error: (err) => err.response?.data?.error || "An error occurred.",
      });
      fetchData();
      setModalState({ isOpen: false, type: null, data: null });
    } catch (err) {
      return err.response?.data?.error;
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.data) return;
    const { type, data } = deleteConfirm;
    const apiCall =
      type === "branch"
        ? tenantLocationService.deleteBranch(data._id)
        : tenantLocationService.deleteWarehouse(data._id);

    await toast.promise(apiCall, {
      loading: "Deleting...",
      success: `${type} "${data.name}" deleted.`,
      error: (err) => err.response?.data?.error || "Failed to delete.",
    });
    fetchData();
    setDeleteConfirm({ isOpen: false, type: null, data: null });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Locations Management</h1>
          <p className="mt-1 text-slate-400">
            Manage all your physical branches and warehouses.
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() =>
              setModalState({ isOpen: true, type: "warehouse", data: null })
            }
          >
            <WarehouseIcon className="mr-2 h-4 w-4" /> New Warehouse
          </Button>
          <Button
            onClick={() =>
              setModalState({ isOpen: true, type: "branch", data: null })
            }
          >
            <Building className="mr-2 h-4 w-4" /> New Branch
          </Button>
        </div>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <LocationList
          branches={branches}
          warehouses={warehouses}
          onEdit={(type, data) => setModalState({ isOpen: true, type, data })}
          onDelete={(type, data) =>
            setDeleteConfirm({ isOpen: true, type, data })
          }
        />
      )}

      <Modal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, type: null, data: null })}
        title={
          modalState.data
            ? `Edit ${modalState.type}`
            : `Create New ${modalState.type}`
        }
      >
        {modalState.type === "branch" && (
          <BranchForm
            branchToEdit={modalState.data}
            warehouses={warehouses}
            onSave={handleSave}
            onCancel={() =>
              setModalState({ isOpen: false, type: null, data: null })
            }
          />
        )}
        {modalState.type === "warehouse" && (
          <WarehouseForm
            warehouseToEdit={modalState.data}
            onSave={handleSave}
            onCancel={() =>
              setModalState({ isOpen: false, type: null, data: null })
            }
          />
        )}
      </Modal>

      <Modal
        isOpen={deleteConfirm.isOpen}
        onClose={() =>
          setDeleteConfirm({ isOpen: false, type: null, data: null })
        }
        title="Confirm Deletion"
      >
        <div className="text-center">
          <ShieldAlert className="mx-auto h-12 w-12 text-red-500" />
          <p className="mt-4">
            Are you sure you want to delete the {deleteConfirm.type}?
          </p>
          <p className="mt-2 font-semibold text-amber-300 bg-slate-900 p-2 rounded-md">
            {deleteConfirm.data?.name}
          </p>
        </div>
        <div className="mt-6 flex justify-center space-x-4">
          <Button
            variant="outline"
            onClick={() =>
              setDeleteConfirm({ isOpen: false, type: null, data: null })
            }
          >
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

export default LocationsPage;
