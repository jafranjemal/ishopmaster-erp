import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { PlusCircle } from "lucide-react";

// Import all necessary services
import {
  tenantPurchaseOrderService,
  tenantSupplierService,
  tenantLocationService,
} from "../../services/api";

// Import UI library and local components
import {
  Button,
  Modal,
  Card,
  CardContent,
  FilterBar,
  Pagination,
} from "ui-library";
import PurchaseOrderList from "../../components/procurement/PurchaseOrderList";
import PurchaseOrderForm from "../../components/procurement/PurchaseOrderForm";

const PO_STATUSES = [
  "draft",
  "ordered",
  "partially_received",
  "fully_received",
  "cancelled",
];

const PurchaseOrdersPage = () => {
  // State for data
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [branches, setBranches] = useState([]);

  // State for UI control
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [paginationData, setPaginationData] = useState(null);
  const [filters, setFilters] = useState({ searchTerm: "", status: "" });
  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = { page: currentPage, limit: 15, ...filters };
      if (!params.status) delete params.status;
      if (!params.searchTerm) delete params.searchTerm;

      // Fetch all necessary data in parallel
      const [poRes, supRes, braRes] = await Promise.all([
        tenantPurchaseOrderService.getAll(params),
        tenantSupplierService.getAll(),
        tenantLocationService.getAllBranches(),
      ]);

      setPurchaseOrders(poRes.data.data);
      setPaginationData(poRes.data.pagination);
      setSuppliers(supRes.data.data);
      setBranches(braRes.data.data);
    } catch (error) {
      toast.error("Failed to load procurement data.");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCloseModal = () => setIsModalOpen(false);

  const handleSave = async (formData) => {
    setIsSaving(true);
    // For this page, we are only handling creation. Edit will be on a detail page.
    const apiCall = tenantPurchaseOrderService.create(formData);
    try {
      await toast.promise(apiCall, {
        loading: "Creating Purchase Order...",
        success: "Purchase Order created successfully!",
        error: (err) => err.response?.data?.error || "Failed to create PO.",
      });
      fetchData(); // Refetch the list to show the new PO
      handleCloseModal();
      return null;
    } catch (err) {
      return err.response?.data?.error; // Return error message to the form
    } finally {
      setIsSaving(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    if (currentPage !== 1) setCurrentPage(1);
    else fetchData();
  };

  const handleClearFilters = () => {
    const clearedFilters = { searchTerm: "", status: "" };
    if (JSON.stringify(filters) !== JSON.stringify(clearedFilters)) {
      setFilters(clearedFilters);
      if (currentPage !== 1) setCurrentPage(1);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Purchase Orders</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> New Purchase Order
        </Button>
      </div>

      <FilterBar
        filterValues={filters}
        onFilterChange={handleFilterChange}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
      >
        <select
          name="status"
          value={filters.status}
          onChange={(e) => handleFilterChange("status", e.target.value)}
          className="h-10 rounded-md border border-slate-700 bg-slate-800 px-3 text-sm"
        >
          <option value="">All Statuses</option>
          {PO_STATUSES.map((s) => (
            <option key={s} value={s} className="capitalize">
              {s.replace("_", " ")}
            </option>
          ))}
        </select>
      </FilterBar>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="p-8 text-center">Loading Purchase Orders...</p>
          ) : (
            <PurchaseOrderList purchaseOrders={purchaseOrders} />
          )}
          {paginationData && (
            <Pagination
              paginationData={paginationData}
              onPageChange={setCurrentPage}
            />
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Create New Purchase Order"
      >
        <PurchaseOrderForm
          suppliers={suppliers}
          branches={branches}
          onSave={handleSave}
          onCancel={handleCloseModal}
          isSaving={isSaving}
        />
      </Modal>
    </div>
  );
};

export default PurchaseOrdersPage;
