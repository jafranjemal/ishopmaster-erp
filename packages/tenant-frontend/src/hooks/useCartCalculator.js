// import { useState, useEffect } from 'react';
// import { useDebounce } from './useDebounce';
// import { tenantSalesService } from '../services/api';

// export const useCartCalculator = (items, customer, branchId) => {
//   const [calculatedCart, setCalculatedCart] = useState({
//     items: [],
//     subTotal: 0,
//     totalDiscount: 0,
//     totalTax: 0,
//     grandTotal: 0,
//     taxBreakdown: [],
//   });
//   const [isLoading, setIsLoading] = useState(false);
//   const debouncedItems = useDebounce(items, 400); // Recalculate 400ms after user stops changing cart

//   useEffect(() => {
//     const recalculate = async () => {
//       if (debouncedItems.length === 0) {
//         setCalculatedCart({ items: [], subTotal: 0, totalDiscount: 0, totalTax: 0, grandTotal: 0, taxBreakdown: [] });
//         return;
//       }

//       setIsLoading(true);
//       try {
//         const payload = {
//           cartData: { items: debouncedItems },
//           customerId: customer?._id,
//           branchId,
//         };
//         // --- THE DEFINITIVE FIX: ONE SINGLE API CALL ---
//         const res = await tenantSalesService.calculateTotals(payload);

//         setCalculatedCart(res.data.data);
//         // --- END OF FIX ---
//       } catch (error) {
//         console.error('Cart calculation failed', error);
//         // Optionally set an error state
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     recalculate();
//   }, [debouncedItems, customer, branchId]);

//   return { calculatedCart, isLoading };
// };

// import { useState, useEffect } from 'react';
// import { useDebounce } from './useDebounce';
// import { tenantSalesService } from '../services/api';

// export const useCartCalculator = (jobItems, customer, branchId, globalDiscount, additionalCharges, recalledCart) => {
//   const [calculatedCart, setCalculatedCart] = useState({
//     items: [],
//     subTotal: 0,
//     totalLineDiscount: 0,
//     totalGlobalDiscount: 0,
//     totalCharges: 0,
//     totalTax: 0,
//     grandTotal: 0,
//     taxBreakdown: [],
//     additionalCharges: [],
//   });
//   const [isLoading, setIsLoading] = useState(false);

//   const debouncedItems = useDebounce(jobItems, 400);
//   const debouncedDiscount = useDebounce(globalDiscount, 400);
//   const debouncedCharges = useDebounce(additionalCharges, 400);

//   useEffect(() => {
//     // --- THE DEFINITIVE FIX: Handle Recalled Sales ---
//     if (recalledCart) {
//       setCalculatedCart(recalledCart);
//       return;
//     }
//     // --- END OF FIX ---

//     const recalculate = async () => {
//       const cartData = {
//         items: debouncedItems,
//         globalDiscount: debouncedDiscount,
//         additionalCharges: debouncedCharges,
//       };
//       if (debouncedItems.length === 0 && !debouncedDiscount && debouncedCharges.length === 0) {
//         setCalculatedCart({
//           items: [],
//           subTotal: 0,
//           totalLineDiscount: 0,
//           totalGlobalDiscount: 0,
//           totalCharges: 0,
//           totalTax: 0,
//           grandTotal: 0,
//           taxBreakdown: [],
//         });
//         return;
//       }
//       setIsLoading(true);
//       try {
//         const payload = { cartData, customerId: customer?._id, branchId };
//         const res = await tenantSalesService.calculateTotals(payload);
//         setCalculatedCart(res.data.data);
//       } catch (error) {
//         console.error('Cart calculation failed', error);
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     recalculate();
//   }, [debouncedItems, debouncedDiscount, debouncedCharges, customer, branchId, recalledCart]);

//   return { calculatedCart, isLoading };
// };

import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from './useDebounce';
import { tenantSalesService } from '../services/api';
import { toast } from 'react-hot-toast';

export const useCartCalculator = (jobItems, customer, branchId, globalDiscount, additionalCharges) => {
  const [calculatedCart, setCalculatedCart] = useState({
    items: [],
    subTotal: 0,
    totalLineDiscount: 0,
    totalGlobalDiscount: 0,
    totalCharges: 0,
    totalTax: 0,
    grandTotal: 0,
    taxBreakdown: [],
    globalDiscount: null,
    additionalCharges: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  const debouncedItems = useDebounce(jobItems, 400);
  const debouncedDiscount = useDebounce(globalDiscount, 400);
  const debouncedCharges = useDebounce(additionalCharges, 400);

  const recalculate = useCallback(async () => {
    const cartData = {
      ...calculatedCart,
      items: debouncedItems,
      globalDiscount: debouncedDiscount,
      additionalCharges: debouncedCharges,
    };

    if (debouncedItems.length === 0 && !debouncedDiscount && debouncedCharges.length === 0) {
      setCalculatedCart({
        items: [],
        subTotal: 0,
        totalLineDiscount: 0,
        totalGlobalDiscount: 0,
        totalCharges: 0,
        totalTax: 0,
        grandTotal: 0,
        taxBreakdown: [],
        globalDiscount: null,
        additionalCharges: [],
      });
      return;
    }

    setIsLoading(true);
    try {
      const payload = { cartData, customerId: customer?._id, branchId };
      const res = await tenantSalesService.calculateTotals(payload);
      console.log('recived clculated cart', res.data.data);
      setCalculatedCart(res.data.data);
    } catch (error) {
      console.error('Cart calculation failed', error);
      toast.error('Could not calculate totals.');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedItems, debouncedDiscount, debouncedCharges, customer, branchId]);

  useEffect(() => {
    recalculate();
  }, [recalculate]);

  return { calculatedCart, isLoading };
};
