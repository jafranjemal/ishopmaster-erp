import React, { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "react-hot-toast";
import { tenantCustomerService, tenantProductService } from "../../services/api";
import useAuth from "../../context/useAuth";
import CartView from "../../components/pos/CartView";
import TotalsPanel from "../../components/pos/TotalsPanel";
import ProductGrid from "../../components/pos/ProductGrid";

import { cn } from "ui-library/lib/utils"; // Assuming you have this utility
import ProductVariantSearch from "../../components/procurement/ProductVariantSearch";
import ProductSearchPanel from "../../components/pos/ProductSearchPanel";
import JobRecall from "../../components/pos/JobRecall";
import CustomerContext from "../../components/pos/CustomerContext";
import CustomerSearchModal from "../../components/pos/CustomerSearchModal";
import QuickCustomerCreateForm from "../../components/pos/QuickCustomerCreateForm";
import { Modal } from "ui-library";
import JobSheet from "../../components/pos/JobSheet";
import WorkspaceTabs from "../../components/pos/WorkspaceTabs";
import RepairWizard from "../../components/pos/wizard/RepairWizard";
import UniversalSearch from "../../components/pos/UniversalSearch";
import DiscoveryPanel from "../../components/pos/DiscoveryPanel";

/**
 * The definitive "smart" page orchestrator for the Point of Sale terminal.
 * This version implements the professional layout switcher you designed.
 * @param {object} props
 * @param {'default' | 'cartFocus'} props.layout - The current layout mode, passed from App.jsx.
 */
const PosPage = ({ layout }) => {
  const [cartItems, setCartItems] = useState([]);
  const [popularItems, setPopularItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [defaultCustomer, setDefaultCustomer] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [jobItems, setJobItems] = useState([]);
  const [activeWorkspace, setActiveWorkspace] = useState("REPAIRS"); // Default to repairs

  // Modal States
  const [isCustomerSearchOpen, setIsCustomerSearchOpen] = useState(false);
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);

  const canEditPrice = user?.permissions?.includes("sales:pos:override");

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      // Fetch popular/recent items for the grid
      const productsRes = await tenantProductService.getAllVariants({ limit: 20, sort: "-createdAt" });
      setPopularItems(productsRes.data.data);

      const customerRes = await tenantCustomerService.getByName("Walking Customer");
      const customer = customerRes.data.data[0];
      if (customer) {
        setDefaultCustomer(customer);
        setSelectedCustomer(customer);
      }
    } catch (error) {
      toast.error("Failed to load POS data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddItemToCart = useCallback((variant) => {
    setCartItems((prev) => {
      // Logic to handle adding items, including checking for existing non-serialized items
      const existingItem = prev.find((item) => item.productVariantId === variant._id && !item.isSerialized);
      if (existingItem) {
        return prev.map((item) => (item.cartId === existingItem.cartId ? { ...item, quantity: item.quantity + 1 } : item));
      }
      return [
        ...prev,
        {
          productVariantId: variant._id,
          variantName: variant.variantName,
          quantity: 1,
          unitPrice: variant.sellingPrice || 0,
          finalPrice: variant.sellingPrice || 0,
          cartId: Date.now(),
          isSerialized: variant.templateId?.type === "serialized",
        },
      ];
    });
  }, []);

  const handleAddItemToJob = useCallback((variant, lineType = "sale_item") => {
    setJobItems((prev) => {
      // Logic to handle adding items, including checking for existing non-serialized items
      const existingItem = prev.find((item) => item.productVariantId === variant._id && item.lineType === "sale_item" && !variant.isSerialized);
      if (existingItem) {
        return prev.map((item) => (item.cartId === existingItem.cartId ? { ...item, quantity: item.quantity + 1 } : item));
      }
      return [
        ...prev,
        {
          productVariantId: variant._id,
          description: variant.variantName,
          quantity: 1,
          unitPrice: variant.sellingPrice || 0,
          finalPrice: variant.sellingPrice || 0,
          cartId: Date.now(),
          isSerialized: variant.templateId?.type === "serialized",
          lineType: lineType, // Add the line type
        },
      ];
    });
  }, []);

  const handleAddItemsToJob = useCallback((itemsToAdd) => {
    setJobItems((prev) => {
      const newItems = itemsToAdd.filter((newItem) => !prev.some((existing) => existing.productVariantId === newItem.productVariantId));
      return [...prev, ...newItems];
    });
  }, []);

  const handleRemoveItem = useCallback((cartId) => setJobItems((prev) => prev.filter((item) => item.cartId !== cartId)), []);
  const handleQuantityChange = useCallback(
    (cartId, newQuantity) =>
      setJobItems((prev) => prev.map((item) => (item.cartId === cartId ? { ...item, quantity: Math.max(1, Number(newQuantity)) } : item))),
    []
  );

  const totals = useMemo(() => {
    const subTotal = jobItems.reduce((sum, item) => sum + item.finalPrice * item.quantity, 0);
    const totalTax = subTotal * 0.15;
    const totalAmount = subTotal + totalTax;
    return { subTotal, totalTax, totalAmount };
  }, [jobItems]);

  const handleJobFound = (foundJob) => {
    // Logic to load the found ticket/invoice into the cart/job sheet
    console.log("Found job:", foundJob);
  };

  const handleCreateCustomer = async (formData) => {
    setIsSaving(true);
    try {
      const res = await toast.promise(tenantCustomerService.create(formData), {
        loading: "Creating customer...",
        success: "Customer created!",
        error: "Failed to create customer.",
      });
      setSelectedCustomer(res.data.data);
      setIsQuickCreateOpen(false);
    } catch (err) {
      /* handled by toast */
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading Point of Sale...</div>;
  }

  const renderWorkspace = () => {
    switch (activeWorkspace) {
      case "ACCESSORIES":
        return <ProductSearchPanel onAddItem={handleAddItemToJob} />;
      //return <ProductSearchPanel onAddItem={(item) => handleAddItemsToJob([item])} />;
      case "REPAIRS":
        return <RepairWizard onJobCreated={handleAddItemsToJob} />;
      case "UNLOCKING":
        return <div className="p-4 text-center text-slate-400">The "Unlocking" workflow UI will go here.</div>;
      case "TRADE_IN":
        return <div className="p-4 text-center text-slate-400">The "Trade In" workflow UI will go here.</div>;
      default:
        return <div className="p-4 text-center text-slate-400">Workspace for {activeWorkspace}</div>;
    }
  };

  // --- THE DEFINITIVE FIX: IMPLEMENTING YOUR SUPERIOR LAYOUT LOGIC ---
  if (layout === "cartFocus") {
    // --- CART FOCUS MODE: STACKED VIEW ---
    return (
      <div className="flex flex-col h-full gap-4">
        {/* Top Section: Cart and Totals take up available space */}
        <div className="flex-1 bg-slate-800 rounded-lg p-4 flex flex-col gap-4 overflow-hidden">
          <div className="flex-shrink-0 space-y-4">
            <JobRecall onJobFound={handleJobFound} />
            <CustomerContext customer={selectedCustomer} onNew={() => setIsQuickCreateOpen(true)} onEdit={() => setIsCustomerSearchOpen(true)} />
            <UniversalSearch onAddItem={handleAddItemToJob} />
          </div>

          <div className="flex-grow overflow-y-auto pr-2">
            <JobSheet items={jobItems} onRemoveItem={handleRemoveItem} onQuantityChange={handleQuantityChange} />
          </div>
          <div className="flex-shrink-0">
            <TotalsPanel totals={totals} onPay={() => alert("Payment modal will open here.")} cartItemCount={cartItems.length} />
          </div>
        </div>
        {/* Bottom Section: Product Search and Grid has a fixed height */}
        <div className="flex-shrink-0 h-[40%] bg-slate-800 rounded-lg p-4 flex flex-col">
          {/* <WorkspaceTabs activeTab={activeWorkspace} onTabChange={setActiveWorkspace} />
          <div className="flex-grow overflow-y-auto">{renderWorkspace()}</div> */}
          {/* <ProductVariantSearch onProductSelect={handleAddItemToCart} />
          <div className="flex-grow overflow-y-auto pt-4 pr-2">
            <ProductGrid items={popularItems} onAddItem={handleAddItemToCart} />
          </div> */}
          <DiscoveryPanel onAddItem={handleAddItemToJob} onItemsSelected={handleAddItemsToJob} />
        </div>

        <CustomerSearchModal isOpen={isCustomerSearchOpen} onClose={() => setIsCustomerSearchOpen(false)} onSelectCustomer={setSelectedCustomer} />
        <Modal isOpen={isQuickCreateOpen} onClose={() => setIsQuickCreateOpen(false)} title="Create New Customer">
          <QuickCustomerCreateForm onSave={handleCreateCustomer} onCancel={() => setIsQuickCreateOpen(false)} isSaving={isSaving} />
        </Modal>
      </div>
    );
  }

  return (
    <div className="grid h-full gap-4 grid-cols-1 sm:grid-cols-12">
      <div className="sm:col-span-7 lg:col-span-8 flex flex-col min-h-[85vh] bg-slate-800 rounded-lg p-4 gap-4">
        <div className="flex-shrink-0 space-y-4">
          <JobRecall onJobFound={handleJobFound} />
          <CustomerContext customer={selectedCustomer} onNew={() => setIsQuickCreateOpen(true)} onEdit={() => setIsCustomerSearchOpen(true)} />
          <UniversalSearch onAddItem={handleAddItemToJob} />
        </div>
        <div className="flex-grow overflow-y-auto pr-2">
          <JobSheet items={jobItems} onRemoveItem={handleRemoveItem} onQuantityChange={handleQuantityChange} />
        </div>
        <div className="flex-shrink-0">
          <TotalsPanel totals={totals} onPay={() => alert("Payment modal will open here.")} cartItemCount={cartItems.length} />
        </div>
      </div>
      <div className="sm:col-span-5 lg:col-span-4 flex flex-col min-h-[85vh] bg-slate-800 rounded-lg p-4">
        {/* <ProductVariantSearch onProductSelect={handleAddItemToCart} />
        <div style={{ maxWidth: "100vw" }} className="flex-grow overflow-y-auto pt-4 pr-2">
          <ProductGrid cartFocus={true} items={popularItems} onAddItem={handleAddItemToCart} />
        </div> */}

        {/* <WorkspaceTabs activeTab={activeWorkspace} onTabChange={setActiveWorkspace} />
        <div className="flex-grow overflow-y-auto">{renderWorkspace()}</div> */}

        <DiscoveryPanel onAddItem={handleAddItemToJob} onItemsSelected={handleAddItemsToJob} />

        {/* <ProductSearchPanel onAddItem={handleAddItemToCart} cartFocus={layout !== "cartFocus"} /> */}
        {canEditPrice && <div className="mt-4 p-2 bg-indigo-900/50 rounded-md text-center text-xs text-indigo-300">Manager Tools Unlocked</div>}
      </div>

      <CustomerSearchModal isOpen={isCustomerSearchOpen} onClose={() => setIsCustomerSearchOpen(false)} onSelectCustomer={setSelectedCustomer} />
      <Modal isOpen={isQuickCreateOpen} onClose={() => setIsQuickCreateOpen(false)} title="Create New Customer">
        <QuickCustomerCreateForm onSave={handleCreateCustomer} onCancel={() => setIsQuickCreateOpen(false)} isSaving={isSaving} />
      </Modal>
    </div>
  );
};

export default PosPage;
