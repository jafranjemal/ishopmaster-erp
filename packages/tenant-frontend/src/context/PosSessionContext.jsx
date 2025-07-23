import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useCartCalculator } from '../hooks/useCartCalculator';
import { tenantCustomerService } from '../services/api';
import useAuth from './useAuth';

const PosSessionContext = createContext(null);

export const PosSessionProvider = ({ children }) => {
  const { user } = useAuth();
  const [jobItems, setJobItems] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [defaultCustomer, setDefaultCustomer] = useState(null);
  const [activeSaleId, setActiveSaleId] = useState(null);

  // --- THE DEFINITIVE FIX: State for global adjustments lives here ---
  const [globalDiscount, setGlobalDiscount] = useState(null);
  const [additionalCharges, setAdditionalCharges] = useState([]);
  const [recalledCart, setRecalledCart] = useState(null);
  const [creditSummary, setCreditSummary] = useState({ limit: 0, balance: 0 });
  const [isCreditLoading, setIsCreditLoading] = useState(false);
  const [completedSale, setCompletedSale] = useState(null);

  const { calculatedCart, isLoading: isCalculating } = useCartCalculator(
    jobItems,
    selectedCustomer,
    user.branchId,
    globalDiscount,
    additionalCharges,
    recalledCart,
  );

  const removeGlobalDiscount = useCallback(() => setGlobalDiscount(null), []);
  const removeAdditionalCharge = useCallback((indexToRemove) => {
    setAdditionalCharges((prev) => prev.filter((_, index) => index !== indexToRemove));
  }, []);

  useEffect(() => {
    if (selectedCustomer && selectedCustomer._id) {
      setIsCreditLoading(true);
      tenantCustomerService
        .getCreditSummary(selectedCustomer._id)
        .then((res) => {
          setCreditSummary({
            limit: res.data.data.creditLimit,
            balance: res.data.data.currentBalance,
          });
        })
        .catch(() => toast.error('Could not fetch customer credit info.'))
        .finally(() => setIsCreditLoading(false));
    } else {
      setCreditSummary({ limit: 0, balance: 0 }); // Reset for walk-in customer
    }
  }, [selectedCustomer]);

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
    setCompletedSale(null);
  }, [defaultCustomer]);

  // --- Definitive Fix #1: Add the function to load a finalized invoice ---
  const loadInvoiceForPayment = useCallback((invoice) => {
    toast.success(`Loading Invoice #${invoice.invoiceId} for payment.`);
    const itemsWithCartId = invoice.items.map((item) => ({ ...item, cartId: Math.random() }));
    setJobItems(itemsWithCartId);
    setGlobalDiscount(invoice.globalDiscount);
    setAdditionalCharges(invoice.additionalCharges || []);
    setRecalledCart({
      items: itemsWithCartId,
      subTotal: invoice.subTotal,
      totalLineDiscount: invoice.totalLineDiscount,
      totalGlobalDiscount: invoice.totalGlobalDiscount,
      totalCharges: invoice.totalCharges,
      totalTax: invoice.totalTax,
      grandTotal: invoice.totalAmount,
      taxBreakdown: invoice.taxBreakdown || [],
    });
    setSelectedCustomer(invoice.customerId);
    setActiveSaleId(invoice._id);
  }, []);

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
    removeGlobalDiscount,
    removeAdditionalCharge,
    creditSummary,
    isCreditLoading,
    loadInvoiceForPayment,
    completedSale,
    setCompletedSale,
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
