import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import TotalsPanel from '../../components/pos/TotalsPanel';
import useAuth from '../../context/useAuth';
import {
  tenantCustomerService,
  tenantPaymentMethodService,
  tenantProductService,
  tenantSalesService,
  tenantSettingsService,
} from '../../services/api';

import { FileText, Hand, Plus, Tag, XCircle } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Button, Modal } from 'ui-library';
import AdditionalChargeForm from '../../components/pos/AdditionalChargeForm';
import CustomerContext from '../../components/pos/CustomerContext';
import CustomerSearchModal from '../../components/pos/CustomerSearchModal';
import DiscoveryPanel from '../../components/pos/DiscoveryPanel';
import GlobalDiscountForm from '../../components/pos/GlobalDiscountForm';
import JobRecall from '../../components/pos/JobRecall';
import JobSheet from '../../components/pos/JobSheet';
import JobSheetEditorModal from '../../components/pos/JobSheetEditorModal';
import PaymentModal from '../../components/pos/payments/PaymentModal';
import QuickCustomerCreateForm from '../../components/pos/QuickCustomerCreateForm';
import StockBreakdownModal from '../../components/pos/StockBreakdownModal';
import UniversalSearch from '../../components/pos/UniversalSearch';
import ConfirmationModal from '../../components/shared/ConfirmationModal';
import { usePosSession } from '../../context/PosSessionContext';
import { useCartCalculator } from '../../hooks/useCartCalculator';

/**
 * The definitive "smart" page orchestrator for the Point of Sale terminal.
 * This version implements the professional layout switcher you designed.
 * @param {object} props
 * @param {'default' | 'cartFocus'} props.layout - The current layout mode, passed from App.jsx.
 */
const PosPage = ({ layout }) => {
  const { user } = useAuth();
  const {
    jobItems,
    setJobItems,
    setDefaultCustomer,
    setSelectedCustomer,
    selectedCustomer,
    setGlobalDiscount,
    setAdditionalCharges,
    removeGlobalDiscount,
    removeAdditionalCharge,
    creditSummary,
    loadInvoiceForPayment,
    ...posSession
  } = usePosSession();

  const { calculatedCart, isLoading: isCalculating } = useCartCalculator(
    jobItems,
    selectedCustomer,
    user.branchId,
    posSession.globalDiscount,
    posSession.additionalCharges,
  );

  const [cartItems, setCartItems] = useState([]);
  const [popularItems, setPopularItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  //const [defaultCustomer, setDefaultCustomer] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  // const [jobItems, setJobItems] = useState([]);
  const [activeWorkspace, setActiveWorkspace] = useState('REPAIRS'); // Default to repairs
  const [paymentMethods, setPaymentMethods] = useState([]);
  // Modal States
  const [isCustomerSearchOpen, setIsCustomerSearchOpen] = useState(false);
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [modalState, setModalState] = useState({ isOpen: false, variant: null, unavailableSerials: [] });
  //const { calculatedCart, isLoading: isCalculating } = useCartCalculator(jobItems, selectedCustomer, user.branchId);
  // const [activeSaleId, setActiveSaleId] = useState(null);
  const canEditPrice = user?.permissions?.includes('sales:pos:override');

  // Modal States
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [editingJobItem, setEditingJobItem] = useState(null);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [isChargeModalOpen, setIsChargeModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [pendingSaleData, setPendingSaleData] = useState(null);
  const canSellOnCredit = useMemo(() => (selectedCustomer?.creditLimit || 0) > 0, [selectedCustomer]);
  const [denominations, setDenominations] = useState([]);

  useEffect(() => {
    tenantSettingsService.getDenominations().then((res) => setDenominations(res.data.data));
  }, []);

  const handleFinalizeOnCredit = async () => {
    if (!canSellOnCredit) return toast.error('This customer is not eligible for credit sales.');
    if (!window.confirm("This will add the full amount to the customer's account. Proceed?")) return;

    const availableCredit = (selectedCustomer?.creditLimit || 0) - (creditSummary.balance || 0);

    if (calculatedCart.grandTotal > availableCredit) {
      return toast.error('Credit limit exceeded');
    }
    const saleData = {
      cart: calculatedCart,
      paymentData: { paymentLines: [] }, // Pass empty payment data
      customerId: selectedCustomer._id,
      // couponId can be handled here as well
    };
    try {
      await toast.promise(tenantSalesService.finalizeSale(saleData), {
        loading: 'Finalizing sale...',
        success: 'Sale completed on credit!',
        error: 'Sale failed.',
      });
      posSession.resetPos();
    } catch (err) {
      /* handled by toast */
    }
  };

  const handleHoldSale = useCallback(
    async (e) => {
      if (e) e.preventDefault();
      if (isSaving) return;

      setIsSaving(true);
      try {
        if (!posSession.activeSaleId) {
          // Create draft payload

          if (!calculatedCart || !Array.isArray(calculatedCart.items) || calculatedCart.items.length === 0) {
            return toast.error('Cart is empty or invalid. Please review your selection.');
          }

          const draftPayload = {
            cartData: {
              ...calculatedCart,
              totalTax: calculatedCart.taxBreakdown?.reduce((sum, t) => sum + t.amount, 0) || 0,
              totalDiscount: calculatedCart.totalGlobalDiscount || 0,
              totalAmount: calculatedCart.grandTotal,
            },
            customerId: selectedCustomer._id,
          };

          // Only call createDraft ONCE with the payload
          const draftResponse = await tenantSalesService.createDraft(draftPayload);
          const draft = draftResponse.data.data;

          await tenantSalesService.updateStatus(draft._id, { status: 'on_hold' });
        } else {
          await tenantSalesService.updateStatus(posSession.activeSaleId, { status: 'on_hold' });
        }
        toast.success('Sale put on hold.');
        posSession.resetPos();
      } catch (error) {
        console.error('Hold sale error:', error);
        toast.error('Failed to hold sale');
      } finally {
        setIsSaving(false);
      }
    },
    [posSession.activeSaleId, calculatedCart, selectedCustomer?._id, isSaving],
  );
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      // Fetch popular/recent items for the grid
      const productsRes = await tenantProductService.getAllVariants({ limit: 20, sort: '-createdAt' });
      setPopularItems(productsRes.data.data);

      const customerRes = await tenantCustomerService.getByName('Walking Customer');
      const customer = customerRes.data.data[0];
      if (customer) {
        setDefaultCustomer(customer);
        setSelectedCustomer(customer);
      }

      const pmRes = await tenantPaymentMethodService.getAll();
      setPaymentMethods(pmRes.data.data);
    } catch (error) {
      console.log(error);
      toast.error('Failed to load POS data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const serialsInCart = useMemo(
    () => jobItems.filter((item) => item.isSerialized && item.serialNumber).map((item) => item.serialNumber),
    [jobItems],
  );

  useEffect(() => {
    const invoiceIdToLoad = searchParams.get('loadInvoice');
    if (invoiceIdToLoad) {
      const loadInvoice = async () => {
        try {
          const res = await tenantSalesService.getInvoiceById(invoiceIdToLoad);
          loadInvoiceForPayment(res.data.data);
          // Clean the URL after loading
          setSearchParams({}, { replace: true });
        } catch (error) {
          toast.error('Failed to load the specified invoice for payment.');
        }
      };
      loadInvoice();
    }
  }, [searchParams, loadInvoiceForPayment, setSearchParams]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddItemToJob = useCallback((itemData, lineType = 'sale_item') => {
    // This function now receives an array from the modal or a single item from search/grid
    const itemsToAdd = Array.isArray(itemData) ? itemData : [itemData];

    console.log('itemsToAdd ', itemsToAdd[0]);
    setJobItems((prev) => {
      const updatedItems = [...prev];

      itemsToAdd.forEach((item) => {
        // Prevent adding the same serialized item twice
        if (item.serialNumber && updatedItems.some((i) => i.serialNumber === item.serialNumber)) {
          toast.error(`Serial #${item.serialNumber} is already in the cart.`);
          return;
        }

        const newItem = {
          productVariantId: item._id || item.productVariantId,
          description: item.variantName,
          taxCategoryId: item.templateId?.taxCategoryId || null,
          quantity: item.quantity || 1,
          unitPrice: item.sellingPrice || item.unitPrice,
          finalPrice: item.sellingPrice || item.finalPrice,
          cartId: Date.now() + Math.random(),
          isSerialized: item.templateId?.type === 'serialized',
          serialNumber: item.serialNumber, // From modal
          batchNumber: item?.batchInfo?.batchNumber || null,

          batchInfo: item.batchInfo, // From modal
          lineType: item.templateId?.type === 'bundle' ? 'bundle' : lineType,
          bundleItems: item.templateId?.bundleItems || [],
          warrantyInfo: item?.defaultWarrantyPolicyId || item.templateId?.defaultWarrantyPolicyId || null,
        };
        updatedItems.push(newItem);
      });
      return updatedItems;
    });
  }, []);

  const handleAddItemsToJob = useCallback((itemsToAdd) => {
    setJobItems((prev) => {
      const newItems = itemsToAdd.filter(
        (newItem) => !prev.some((existing) => existing.productVariantId === newItem.productVariantId),
      );
      return [...prev, ...newItems];
    });
  }, []);

  const handleRemoveItem = useCallback(
    (cartId) => setJobItems((prev) => prev.filter((item) => item.cartId !== cartId)),
    [],
  );
  const handleQuantityChange = useCallback(
    (cartId, newQuantity) =>
      setJobItems((prev) =>
        prev.map((item) => (item.cartId === cartId ? { ...item, quantity: Math.max(1, Number(newQuantity)) } : item)),
      ),
    [],
  );

  const handleProductSelectO = (variant) => {
    console.log('Selected variant:', variant);
    const isTracked = variant.templateId?.type === 'serialized' || variant?.hasBatches;
    const itemType = variant.type || variant.variant?.templateId?.type || 'product';

    if (isTracked) {
      setModalState({ isOpen: true, variant: variant, unavailableSerials: serialsInCart });
    } else {
      handleAddItemToJob(variant);
    }
  };

  const handleProductSelect = (item) => {
    console.log('Selected item:', item);

    // Determine item type from the item object
    const itemType = item.type || item?.template?.type || item?.templateId?.type || 'product';
    console.log('itemType', itemType);

    if (itemType === 'service' || itemType === 'bundle') {
      // Services and bundles don't need tracking
      handleAddItemToJob({
        ...item,
        itemType: itemType, // Add explicit type
      });
    } else {
      // Handle products
      const isTracked = itemType === 'serialized' || item?.hasBatches;
      console.log('isTracked', isTracked);
      if (isTracked) {
        setModalState({
          isOpen: true,
          item: item,
          itemType: itemType,
          variant: item,
          unavailableSerials: serialsInCart,
        });
      } else {
        handleAddItemToJob({
          ...item,
          itemType: itemType, // Add explicit type
        });
      }
    }
  };

  const totals = useMemo(() => {
    const subTotal = jobItems.reduce((sum, item) => sum + item.finalPrice * item.quantity, 0);
    const totalTax = subTotal * 0.15;
    const totalAmount = subTotal + totalTax;
    return { subTotal, totalTax, totalAmount };
  }, [jobItems]);

  const handleJobFound = (foundJob) => {
    // Logic to load the found ticket/invoice into the cart/job sheet
    console.log('Found job:', foundJob);
  };

  const handleCreateCustomer = async (formData) => {
    setIsSaving(true);
    try {
      const res = await toast.promise(tenantCustomerService.create(formData), {
        loading: 'Creating customer...',
        success: 'Customer created!',
        error: 'Failed to create customer.',
      });
      setSelectedCustomer(res.data.data);
      setIsQuickCreateOpen(false);
    } catch (err) {
      /* handled by toast */
    } finally {
      setIsSaving(false);
    }
  };

  const finalizeSale = async (paymentData, couponId) => {
    setIsSaving(true);
    const saleData = {
      cartData: calculatedCart,
      paymentData,
      customerId: selectedCustomer._id,
      branchId: user.assignedBranchId,
      couponId,
      userId: user._id,
    };
    try {
      await toast.promise(tenantSalesService.finalizeSale(saleData), {
        loading: 'Finalizing sale...',
        success: 'Sale completed successfully!',
        error: 'Sale failed.',
      });
      // Reset POS state for next sale
      setJobItems([]);
      setSelectedCustomer(posSession.defaultCustomer);
      setIsPaymentModalOpen(false);
      setIsConfirmModalOpen(false);
    } catch (err) {
      console.error('Payment error:', err);
      toast.error('Failed to complete sale. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePartialPaymentAttempt = (paymentData, couponId) => {
    // When a partial payment is attempted, store the data and open the confirmation modal
    setPendingSaleData({ paymentData, couponId });
    setIsPaymentModalOpen(false); // Close the payment modal
    setIsConfirmModalOpen(true); // Open the confirmation modal
  };

  const handleConfirmPartialPayment = () => {
    if (pendingSaleData) {
      finalizeSale(pendingSaleData.paymentData, pendingSaleData.couponId);
    }
  };

  const handleUpdateJobItem = (cartId, updatedValues) => {
    setJobItems((prev) => prev.map((item) => (item.cartId === cartId ? { ...item, ...updatedValues } : item)));
  };

  if (isLoading) {
    return <div className='p-8 text-center'>Loading Point of Sale...</div>;
  }

  // --- THE DEFINITIVE FIX: IMPLEMENTING YOUR SUPERIOR LAYOUT LOGIC ---
  if (layout === 'cartFocus') {
    // --- CART FOCUS MODE: STACKED VIEW ---
    return (
      <div className='flex flex-col h-full gap-4'>
        {/* Top Section: Cart and Totals take up available space */}
        <div className='flex-1 bg-slate-800 rounded-lg p-4 flex flex-col gap-4 overflow-hidden'>
          <div className='flex-shrink-0 space-y-4'>
            {posSession.activeSaleId && (
              <Button variant='destructive' className='w-full' onClick={posSession.resetPos}>
                <XCircle className='h-4 w-4 mr-2' />
                Cancel Recalled Sale & Start New
              </Button>
            )}
            <JobRecall onJobFound={handleJobFound} />
            <CustomerContext
              customer={selectedCustomer}
              onNew={() => setIsQuickCreateOpen(true)}
              onEdit={() => setIsCustomerSearchOpen(true)}
            />
            <UniversalSearch onAddItem={handleProductSelect} />
          </div>

          <div className='flex-grow overflow-y-auto pr-2'>
            <JobSheet
              taxBreakdown={calculatedCart.taxBreakdown}
              taxMode={calculatedCart.taxMode}
              items={jobItems}
              onEditItem={(item) => setEditingJobItem(item)}
              onRemoveItem={handleRemoveItem}
              onQuantityChange={handleQuantityChange}
            />
          </div>
          <div className='flex-shrink-0'>
            <div className='flex gap-2'>
              <Button
                disabled={!Array.isArray(calculatedCart.items)}
                type='button'
                variant='outline'
                className='flex-1'
                onClick={handleHoldSale}
              >
                <Hand className='h-4 w-4 mr-2' />
                Hold
              </Button>
              <Button disabled={!Array.isArray(calculatedCart.items)} variant='outline' className='flex-1'>
                <FileText className='h-4 w-4 mr-2' />
                Save as Quote
              </Button>
            </div>

            <TotalsPanel
              additionalCharges={posSession.additionalCharges}
              isLoading={isCalculating}
              cart={calculatedCart}
              totals={totals}
              onPay={() => setIsPaymentModalOpen(true)}
              cartItemCount={cartItems.length}
              onRemoveGlobalDiscount={removeGlobalDiscount}
              onRemoveCharge={removeAdditionalCharge}
              onFinalizeOnCredit={handleFinalizeOnCredit}
              canSellOnCredit={canSellOnCredit}
              creditSummary={creditSummary}
            />
          </div>
        </div>
        {/* Bottom Section: Product Search and Grid has a fixed height */}
        <div className='flex-shrink-0 h-[40%] bg-slate-800 rounded-lg p-4 flex flex-col'>
          {/* <WorkspaceTabs activeTab={activeWorkspace} onTabChange={setActiveWorkspace} />
          <div className="flex-grow overflow-y-auto">{renderWorkspace()}</div> */}
          {/* <ProductVariantSearch onProductSelect={handleAddItemToCart} />
          <div className="flex-grow overflow-y-auto pt-4 pr-2">
            <ProductGrid items={popularItems} onAddItem={handleAddItemToCart} />
          </div> */}
          <DiscoveryPanel onAddItem={handleProductSelect} onItemsSelected={handleAddItemsToJob} />
        </div>

        <Modal isOpen={isDiscountModalOpen} onClose={() => setIsDiscountModalOpen(false)} title='Apply Global Discount'>
          <GlobalDiscountForm
            onSave={(discount) => {
              setGlobalDiscount(discount);
              setIsDiscountModalOpen(false);
            }}
            onCancel={() => setIsDiscountModalOpen(false)}
          />
        </Modal>
        <Modal isOpen={isChargeModalOpen} onClose={() => setIsChargeModalOpen(false)} title='Add Additional Charge'>
          <AdditionalChargeForm
            onSave={(charge) => {
              setAdditionalCharges((prev) => [...prev, charge]);
              setIsChargeModalOpen(false);
            }}
            onCancel={() => setIsChargeModalOpen(false)}
          />
        </Modal>

        {modalState.variant && (
          <StockBreakdownModal
            isOpen={modalState.isOpen}
            onClose={() => setModalState({ isOpen: false, variant: null })}
            onConfirm={handleAddItemToJob}
            variant={modalState.variant}
            branchId={user.branchId}
            unavailableSerials={modalState.unavailableSerials || []}
          />
        )}

        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          onConfirm={finalizeSale}
          totalAmount={calculatedCart.grandTotal}
          paymentMethods={paymentMethods}
          customer={selectedCustomer}
          creditSummary={creditSummary}
          denominations={denominations}
        />

        <CustomerSearchModal
          isOpen={isCustomerSearchOpen}
          onClose={() => setIsCustomerSearchOpen(false)}
          onSelectCustomer={setSelectedCustomer}
        />
        <Modal isOpen={isQuickCreateOpen} onClose={() => setIsQuickCreateOpen(false)} title='Create New Customer'>
          <QuickCustomerCreateForm
            onSave={handleCreateCustomer}
            onCancel={() => setIsQuickCreateOpen(false)}
            isSaving={isSaving}
          />
        </Modal>

        <JobSheetEditorModal
          isOpen={!!editingJobItem}
          onClose={() => setEditingJobItem(null)}
          onSave={handleUpdateJobItem}
          item={editingJobItem}
        />

        {/* --- 3. RENDER THE NEW CONFIRMATION MODAL --- */}
        <ConfirmationModal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          onConfirm={handleConfirmPartialPayment}
          title='Confirm Partial Payment'
          message={`This will leave an outstanding balance. Are you sure you want to proceed?`}
          confirmText='Proceed'
          isConfirming={isSaving}
        />
      </div>
    );
  }

  return (
    <div className='grid h-full gap-4 grid-cols-1 sm:grid-cols-12'>
      <div className='sm:col-span-7 lg:col-span-8 flex flex-col min-h-[85vh] bg-slate-800 rounded-lg p-4 gap-4'>
        <div className='flex-shrink-0 space-y-4'>
          {posSession.activeSaleId && (
            <Button variant='destructive' className='w-full' onClick={posSession.resetPos}>
              <XCircle className='h-4 w-4 mr-2' />
              Cancel Recalled Sale & Start New
            </Button>
          )}

          <JobRecall onJobFound={handleJobFound} />
          <CustomerContext
            customer={selectedCustomer}
            onNew={() => setIsQuickCreateOpen(true)}
            onEdit={() => setIsCustomerSearchOpen(true)}
          />
          <UniversalSearch onAddItem={handleProductSelect} />
        </div>
        <div className='flex-grow overflow-y-auto pr-2'>
          <JobSheet
            taxBreakdown={calculatedCart.taxBreakdown}
            taxMode={calculatedCart.taxMode}
            items={jobItems}
            onEditItem={(item) => setEditingJobItem(item)}
            onRemoveItem={handleRemoveItem}
            onQuantityChange={handleQuantityChange}
          />
        </div>
        <div className='flex-shrink-0'>
          <div className='flex gap-2'>
            <Button
              disabled={!Array.isArray(calculatedCart.items)}
              type='button'
              variant='outline'
              className='flex-1'
              onClick={handleHoldSale}
            >
              <Hand className='h-4 w-4 mr-2' />
              Hold
            </Button>
            <Button disabled={!Array.isArray(calculatedCart.items)} variant='outline' className='flex-1'>
              <FileText className='h-4 w-4 mr-2' />
              Save as Quote
            </Button>

            <div className='flex gap-2 mb-2'>
              <Button variant='outline' className='flex-1' onClick={() => setIsDiscountModalOpen(true)}>
                <Tag className='h-4 w-4 mr-2' />
                Add Discount
              </Button>
              <Button variant='outline' className='flex-1' onClick={() => setIsChargeModalOpen(true)}>
                <Plus className='h-4 w-4 mr-2' />
                Add Surcharge
              </Button>
            </div>
          </div>

          <TotalsPanel
            additionalCharges={posSession.additionalCharges}
            isLoading={isCalculating}
            cart={calculatedCart}
            totals={totals}
            onPay={() => setIsPaymentModalOpen(true)}
            cartItemCount={cartItems.length}
            onRemoveGlobalDiscount={removeGlobalDiscount}
            onRemoveCharge={removeAdditionalCharge}
            onFinalizeOnCredit={handleFinalizeOnCredit}
            canSellOnCredit={canSellOnCredit}
            creditSummary={creditSummary}
          />
        </div>
      </div>
      <div className='sm:col-span-5 lg:col-span-4 flex flex-col min-h-[85vh] bg-slate-800 rounded-lg p-4'>
        {/* <ProductVariantSearch onProductSelect={handleAddItemToCart} />
        <div style={{ maxWidth: "100vw" }} className="flex-grow overflow-y-auto pt-4 pr-2">
          <ProductGrid cartFocus={true} items={popularItems} onAddItem={handleAddItemToCart} />
        </div> */}

        {/* <WorkspaceTabs activeTab={activeWorkspace} onTabChange={setActiveWorkspace} />
        <div className="flex-grow overflow-y-auto">{renderWorkspace()}</div> */}

        <DiscoveryPanel onAddItem={handleProductSelect} onItemsSelected={handleAddItemToJob} />

        {/* <ProductSearchPanel onAddItem={handleAddItemToCart} cartFocus={layout !== "cartFocus"} /> */}
        {canEditPrice && (
          <div className='mt-4 p-2 bg-indigo-900/50 rounded-md text-center text-xs text-indigo-300'>
            Manager Tools Unlocked
          </div>
        )}
      </div>
      <Modal isOpen={isDiscountModalOpen} onClose={() => setIsDiscountModalOpen(false)} title='Apply Global Discount'>
        <GlobalDiscountForm
          onSave={(discount) => {
            setGlobalDiscount(discount);
            setIsDiscountModalOpen(false);
          }}
          onCancel={() => setIsDiscountModalOpen(false)}
        />
      </Modal>
      <Modal isOpen={isChargeModalOpen} onClose={() => setIsChargeModalOpen(false)} title='Add Additional Charge'>
        <AdditionalChargeForm
          onSave={(charge) => {
            setAdditionalCharges((prev) => [...prev, charge]);
            setIsChargeModalOpen(false);
          }}
          onCancel={() => setIsChargeModalOpen(false)}
        />
      </Modal>
      <JobSheetEditorModal
        isOpen={!!editingJobItem}
        onClose={() => setEditingJobItem(null)}
        onSave={handleUpdateJobItem}
        item={editingJobItem}
      />

      {modalState.variant && (
        <StockBreakdownModal
          isOpen={modalState.isOpen}
          onClose={() => setModalState({ isOpen: false, variant: null })}
          onConfirm={handleAddItemToJob}
          variant={modalState.variant}
          branchId={user.branchId}
          unavailableSerials={modalState.unavailableSerials || []}
        />
      )}

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onConfirm={finalizeSale}
        totalAmount={calculatedCart.grandTotal}
        paymentMethods={paymentMethods}
        customer={selectedCustomer}
        creditSummary={creditSummary}
        denominations={denominations}
      />

      <CustomerSearchModal
        isOpen={isCustomerSearchOpen}
        onClose={() => setIsCustomerSearchOpen(false)}
        onSelectCustomer={setSelectedCustomer}
      />
      <Modal isOpen={isQuickCreateOpen} onClose={() => setIsQuickCreateOpen(false)} title='Create New Customer'>
        <QuickCustomerCreateForm
          onSave={handleCreateCustomer}
          onCancel={() => setIsQuickCreateOpen(false)}
          isSaving={isSaving}
        />
      </Modal>

      {/* --- 3. RENDER THE NEW CONFIRMATION MODAL --- */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmPartialPayment}
        title='Confirm Partial Payment'
        message={`This will leave an outstanding balance. Are you sure you want to proceed?`}
        confirmText='Proceed'
        isConfirming={isSaving}
      />
    </div>
  );
};

export default PosPage;
