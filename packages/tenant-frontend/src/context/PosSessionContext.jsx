// import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
// import { toast } from 'react-hot-toast';
// import { tenantSalesService } from '../services/api';
// import { useDebounce } from '../hooks/useDebounce';
// import useAuth from './useAuth';
// import { useCartCalculator } from '../hooks/useCartCalculator';

// const PosSessionContext = createContext(null);

// export const PosSessionProvider = ({ children }) => {
//   const { user } = useAuth();
//   const [jobItems, setJobItems] = useState([]);
//   const [selectedCustomer, setSelectedCustomer] = useState(null);
//   const [defaultCustomer, setDefaultCustomer] = useState(null);
//   const [activeSaleId, setActiveSaleId] = useState(null);
//   const { calculatedCart, isLoading: isCalculating } = useCartCalculator(jobItems, selectedCustomer, user.branchId);

//   // const [calculatedCart, setCalculatedCart] = useState({ items: [], subTotal: 0, totalDiscount: 0, totalTax: 0, grandTotal: 0, taxBreakdown: [] });
//   // const [isCalculating, setIsLoading] = useState(false);

//   const handleRecallSale = useCallback((sale) => {
//     const itemsWithCartId = sale.items.map((item) => ({ ...item, cartId: Math.random() }));
//     setJobItems(itemsWithCartId);
//     setSelectedCustomer(sale.customerId);
//     setActiveSaleId(sale._id);
//     toast.success(`Recalled sale #${sale.invoiceNumber || sale.draftId}`);
//   }, []);

//   const resetPos = useCallback(() => {
//     setJobItems([]);
//     setSelectedCustomer(defaultCustomer);
//     setActiveSaleId(null);
//     // setCalculatedCart({ items: [], subTotal: 0, totalDiscount: 0, totalTax: 0, grandTotal: 0, taxBreakdown: [] });
//   }, [defaultCustomer]);

//   // useEffect(() => {
//   //     // Only run automatic recalculation for new sales (when no activeSaleId is set).
//   //     if (activeSaleId) return;

//   //     const recalculate = async () => {
//   //         if (debouncedItems.length === 0) {
//   //             setCalculatedCart({ items: [], subTotal: 0, totalDiscount: 0, totalTax: 0, grandTotal: 0, taxBreakdown: [] });
//   //             return;
//   //         }
//   //         setIsLoading(true);
//   //         try {
//   //             const payload = { cartData: { items: debouncedItems }, customerId: selectedCustomer?._id, branchId: user.assignedBranchId };
//   //             const res = await tenantSalesService.calculateTotals(payload);
//   //             setCalculatedCart(res.data.data);
//   //         } catch (error) {
//   //             toast.error("Could not calculate totals.");
//   //         } finally {
//   //             setIsLoading(false);
//   //         }
//   //     };
//   //     recalculate();
//   // }, [debouncedItems, selectedCustomer, activeSaleId, user.assignedBranchId]);

//   const value = {
//     jobItems,
//     setJobItems,
//     selectedCustomer,
//     setSelectedCustomer,
//     defaultCustomer,
//     setDefaultCustomer,
//     activeSaleId,
//     setActiveSaleId,
//     calculatedCart,
//     isCalculating,
//     handleRecallSale,
//     resetPos,
//   };

//   return <PosSessionContext.Provider value={value}>{children}</PosSessionContext.Provider>;
// };

//

import React, { createContext, useState, useContext, useCallback } from 'react';
import { toast } from 'react-hot-toast';

const PosSessionContext = createContext(null);

export const PosSessionProvider = ({ children }) => {
  const [jobItems, setJobItems] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [defaultCustomer, setDefaultCustomer] = useState(null);
  const [activeSaleId, setActiveSaleId] = useState(null);

  // --- THE DEFINITIVE FIX: State for global adjustments lives here ---
  const [globalDiscount, setGlobalDiscount] = useState(null);
  const [additionalCharges, setAdditionalCharges] = useState([]);

  const handleRecallSale = useCallback((sale) => {
    const itemsWithCartId = sale.items.map((item) => ({ ...item, cartId: Math.random() }));
    setJobItems(itemsWithCartId);
    setGlobalDiscount(sale.globalDiscount);
    setAdditionalCharges(sale.additionalCharges || []);
    setSelectedCustomer(sale.customerId);
    setActiveSaleId(sale._id);
    toast.success(`Recalled sale #${sale.invoiceNumber || sale.draftId}`);
  }, []);

  const resetPos = useCallback(() => {
    setJobItems([]);
    setSelectedCustomer(defaultCustomer);
    setActiveSaleId(null);
    setGlobalDiscount(null);
    setAdditionalCharges([]);
  }, [defaultCustomer]);

  const value = {
    jobItems,
    setJobItems,
    selectedCustomer,
    setSelectedCustomer,
    defaultCustomer,
    setDefaultCustomer,
    activeSaleId,
    setActiveSaleId,
    globalDiscount,
    setGlobalDiscount,
    additionalCharges,
    setAdditionalCharges,
    handleRecallSale,
    resetPos,
  };

  return <PosSessionContext.Provider value={value}>{children}</PosSessionContext.Provider>;
};

export const usePosSession = () => {
  const context = useContext(PosSessionContext);
  if (!context) {
    throw new Error('usePosSession must be used within a PosSessionProvider');
  }
  return context;
};
export default PosSessionContext;
