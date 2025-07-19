import toast from 'react-hot-toast';
import { tenantSalesService } from '../services/api';
import { useCallback, useEffect, useState } from 'react';
import { useDebounce } from './useDebounce';

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

  // Create debounced values
  const debouncedItems = useDebounce(jobItems, 400);
  const debouncedDiscount = useDebounce(globalDiscount, 400);
  const debouncedCharges = useDebounce(additionalCharges, 400);

  const recalculate = useCallback(async () => {
    // FIX 1: Don't spread stale calculatedCart state
    const cartData = {
      items: debouncedItems,
      globalDiscount: debouncedDiscount,
      additionalCharges: debouncedCharges,
    };

    // FIX 2: Add empty state reset
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
      const payload = {
        cartData,
        customerId: customer?._id,
        branchId,
      };

      const res = await tenantSalesService.calculateTotals(payload);

      // FIX 3: Ensure totalAmount exists for backend
      const data = res.data.data;
      setCalculatedCart({
        ...data,
        totalAmount: data.totalAmount || data.grandTotal,
      });
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
