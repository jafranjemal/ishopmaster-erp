import React, { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "react-hot-toast";
import { tenantPaymentMethodService, tenantCustomerService } from "../../services/api";
import useAuth from "../../context/useAuth";
// We will build these components in the next steps
// import CartView from '../../components/pos/CartView';
// import TotalsPanel from '../../components/pos/TotalsPanel';
// import ProductSearchPanel from '../../components/pos/ProductSearchPanel';
// import CustomerPanel from '../../components/pos/CustomerPanel';

const PosPage = () => {
  const { user, branch } = useAuth(); // Assuming branch info is in auth context

  // Data state
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [defaultCustomer, setDefaultCustomer] = useState(null);

  // Sale state
  const [cartItems, setCartItems] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [methodsRes, customerRes] = await Promise.all([tenantPaymentMethodService.getAll(), tenantCustomerService.getByName("Walking Customer")]);

      setPaymentMethods(methodsRes.data.data);
      const customer = customerRes.data.data[0];
      setDefaultCustomer(customer);
      setSelectedCustomer(customer);
    } catch (error) {
      toast.error("Failed to load initial POS data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- CART & SALE LOGIC ---
  const handleAddItemToCart = (item) => {
    // Logic to add an item, or increment quantity if it already exists
    setCartItems((prev) => [...prev, { ...item, cartId: Date.now() }]);
  };

  // ... other handlers: handleRemoveItem, handleQuantityChange, etc.

  const totals = useMemo(() => {
    const subTotal = cartItems.reduce((sum, item) => sum + item.finalPrice * item.quantity, 0);
    // Add tax calculation logic here later
    const totalAmount = subTotal;
    return { subTotal, totalAmount };
  }, [cartItems]);

  const handleFinalizeSale = async (paymentData) => {
    setIsSaving(true);
    const payload = {
      cart: { items: cartItems, ...totals },
      payment: paymentData,
      customerId: selectedCustomer._id,
    };
    // This will call the SalesService we built in the previous chapter
    // await tenantSalesService.create(payload);
    toast.success("Sale Finalized (mocked)!");
    setIsSaving(false);
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading Point of Sale...</div>;
  }

  return (
    <div className="grid grid-cols-12 gap-6 h-full max-h-screen overflow-hidden">
      {/* --- Left Side: Cart & Totals --- */}
      <div className="col-span-7 flex flex-col h-full bg-slate-800 rounded-lg">
        <div className="p-4 border-b border-slate-700">
          <h2 className="font-bold text-lg">Current Sale</h2>
          {/* Placeholder for CustomerPanel */}
          <div className="p-4 mt-2 bg-slate-900/50 rounded-lg">Customer Panel Placeholder</div>
        </div>
        <div className="flex-grow overflow-y-auto p-4">
          {/* Placeholder for CartView */}
          <div className="p-4 bg-slate-900/50 rounded-lg">Cart View Placeholder</div>
        </div>
        <div className="p-4 border-t border-slate-700">
          {/* Placeholder for TotalsPanel */}
          <div className="p-4 bg-slate-900/50 rounded-lg">Totals Panel & Pay Button Placeholder</div>
        </div>
      </div>

      {/* --- Right Side: Product Search --- */}
      <div className="col-span-5 bg-slate-800 rounded-lg h-full flex flex-col">
        <div className="flex-grow p-4 overflow-y-auto">
          {/* Placeholder for ProductSearchPanel */}
          <div className="p-4 bg-slate-900/50 rounded-lg">Product Search Panel Placeholder</div>
        </div>
      </div>
    </div>
  );
};

export default PosPage;
