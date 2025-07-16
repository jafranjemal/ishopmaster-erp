import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { tenantGrnService, tenantReconciliationService, tenantPurchaseOrderService } from '../../services/api';
import { ArrowLeft } from 'lucide-react';

// --- 1. IMPORT THE ACTUAL UI COMPONENTS ---
import PurchaseOrderDetailView from '../../components/procurement/PurchaseOrderDetailView';
import SupplierInvoiceForm from '../../components/accounting/SupplierInvoiceForm';

const SupplierInvoiceReconciliationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [purchaseOrder, setPurchaseOrder] = useState(null);
  const [initialInvoiceData, setInitialInvoiceData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // Extract GRN IDs from the URL
  const grnIds = useMemo(() => searchParams.get('grnIds')?.split(','), [searchParams]);

  const fetchData = useCallback(async () => {
    if (!grnIds || grnIds.length === 0) {
      setError('No Goods Receipt Notes selected.');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      // In a real app, we might create a dedicated endpoint to get all this data at once.
      // For now, we fetch the PO details first, then use that to form the invoice.

      // We need the PO ID from one of the GRNs to fetch the PO.
      // This part of the logic needs to be more robust. Let's assume a dedicated endpoint or GRN details contain PO ID.
      // For now, let's just fetch the PO from the first GRN's PO ID.
      const tempGrnDetails = await tenantGrnService.getDetailsForReconciliation(grnIds);
      if (!tempGrnDetails.data.data || tempGrnDetails.data.data.length === 0)
        throw new Error('Could not find specified GRNs');

      const poId = tempGrnDetails.data.data[0].purchaseOrderId._id;
      const poResponse = await tenantPurchaseOrderService.getById(poId);
      const po = poResponse.data.data;
      setPurchaseOrder(po);

      // Consolidate all items from all selected GRNs
      const consolidatedItems = tempGrnDetails.data.data.reduce((acc, grn) => {
        grn.items.forEach((item) => {
          const poItem = po.items.find((p) => p.productVariantId._id === item.productVariantId._id);
          const existingItem = acc.get(item.productVariantId._id);

          if (existingItem) {
            existingItem.quantityBilled += item.quantityReceived;
          } else {
            acc.set(item.productVariantId._id, {
              productVariantId: item.productVariantId._id,
              description: poItem?.description || 'N/A',
              quantityBilled: item.quantityReceived,
              finalCostPrice: poItem?.costPrice || 0,
            });
          }
        });
        return acc;
      }, new Map());

      setInitialInvoiceData({
        supplierId: po.supplierId._id,
        goodsReceiptNoteIds: grnIds,
        transactionCurrency: po.transactionCurrency,
        exchangeRateToBase: po.exchangeRateToBase,
        items: Array.from(consolidatedItems.values()),
        supplierInvoiceNumber: '',
        invoiceDate: new Date().toISOString().split('T')[0],
        fileAttachments: [],
      });
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to load reconciliation data.';
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [grnIds]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePostInvoice = async (finalInvoiceData) => {
    setIsSaving(true);
    try {
      await toast.promise(tenantReconciliationService.postInvoice(finalInvoiceData), {
        loading: 'Posting supplier invoice...',
        success: 'Invoice posted and reconciled successfully!',
        error: (err) => err.response?.data?.error || 'Failed to post invoice.',
      });
      navigate('/accounting/payables');
    } catch (err) {
      console.log(err);
      // Toast handles error display
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className='p-8 text-center'>Loading Reconciliation Workspace...</div>;
  if (error) return <div className='p-8 text-center text-red-400'>Error: {error}</div>;
  if (!purchaseOrder || !initialInvoiceData)
    return <div className='p-8 text-center'>Could not prepare reconciliation data.</div>;

  return (
    <div className='space-y-6'>
      <Link to='/accounting/payables' className='flex items-center text-sm text-indigo-400 hover:underline'>
        <ArrowLeft className='h-4 w-4 mr-2' />
        Back to Accounts Payable
      </Link>
      <div>
        <h1 className='text-3xl font-bold'>Reconcile Supplier Invoice</h1>
        <p className='mt-1 text-slate-400'>
          Match the supplier's bill against goods received for PO #{purchaseOrder?.poNumber}.
        </p>
      </div>

      {/* --- 2. ASSEMBLE THE UI IN A TWO-COLUMN LAYOUT --- */}
      <div className='grid grid-cols-1 lg:grid-cols-5 gap-8 items-start'>
        {/* Left Column: Read-only PO Details */}
        <div className='lg:col-span-2 space-y-6'>
          <PurchaseOrderDetailView purchaseOrder={purchaseOrder} />
        </div>

        {/* Right Column: The Invoice Entry Form */}
        <div className='lg:col-span-3'>
          <SupplierInvoiceForm
            purchaseOrder={purchaseOrder}
            initialInvoiceData={initialInvoiceData}
            onPost={handlePostInvoice}
            isSaving={isSaving}
          />
        </div>
      </div>
    </div>
  );
};

export default SupplierInvoiceReconciliationPage;
