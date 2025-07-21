import { CheckCircle, LoaderCircle, XCircle } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'ui-library';
import SignaturePad from '../../components/service/SignaturePad';
import { portalAuthService, setTenantForPortalApi } from '../../services/portalApi';

const formatCurrencyUtil = (amount, currencyCode = 'USD') => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode }).format(amount);
};

const RepairQuotePage = () => {
  const { id: quoteId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tenantId = searchParams.get('tenant');
  const [tenant, setTenant] = useState(null);
  const [quote, setQuote] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [signature, setSignature] = useState('');
  const [tenantProfile, setTenantProfile] = useState(null);
  // const { formatCurrency, formatDate } = useAuth();

  const formatCurrency = (amount) => {
    const currencyCode = tenantProfile?.settings?.localization?.baseCurrency || 'USD';
    return formatCurrencyUtil(amount, currencyCode);
  };

  useEffect(() => {
    if (tenantId) {
      setTenantForPortalApi(tenantId);
      setTenant(tenantId);
    } else {
      // Extract subdomain as fallback tenantId
      const hostname = window.location.hostname; // e.g., shop1.example.com
      const parts = hostname.split('.');

      if (parts.length > 1) {
        const subdomain = parts[0]; // e.g., "shop1"
        // toast.error(subdomain);
        setTenantForPortalApi(subdomain);
        setTenant(subdomain);
      } else {
        console.warn('No subdomain found to derive tenantId.');
        toast.error('Some information is missing from the link.');
      }
    }
  }, [tenantId]);

  useEffect(() => {
    if (tenant) {
      setTenantForPortalApi(tenant);
      portalAuthService
        .getTenantProfile()
        .then((res) => setTenantProfile(res.data.data))
        .catch(() => toast.error('Could not load shop details.'));
    }
  }, [tenant]);

  const fetchData = useCallback(async () => {
    if (!quoteId || !tenant || quote) return;
    try {
      setIsLoading(true);
      const res = await portalAuthService.getQuoteDetails(quoteId);
      setQuote(res.data.data);
    } catch (error) {
      toast.error(
        error.response?.data?.error || 'Could not load quotation. It may have expired or been actioned already.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [quoteId, tenant, quote]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleApprove = async () => {
    if (!signature) {
      toast.error('Please provide your signature to approve.');
      return;
    }
    setIsSaving(true);
    try {
      await toast.promise(portalAuthService.approveQuote(quoteId, signature), {
        loading: 'Submitting your approval...',
        success: 'Quotation approved successfully!',
        error: (err) => err.response?.data?.error || 'Approval failed.',
      });
      fetchData(); // Refresh to show the updated status
    } catch (err) {
      /* Handled by toast */
    } finally {
      setIsSaving(false);
    }
  };

  const handleDecline = async () => {
    // In a real app, this would call a `declineQuote` API endpoint.
    // For now, we'll simulate it.
    if (
      window.confirm('Are you sure you want to decline this quotation? The troubleshoot fee may still be applicable.')
    ) {
      toast.success('Quotation has been marked as declined.');
      // This would ideally refetch and show a 'declined' status.
      navigate('/portal/request-link'); // Redirect away
    }
  };

  if (isLoading)
    return (
      <div className='flex justify-center p-8'>
        <LoaderCircle className='h-8 w-8 animate-spin' />
      </div>
    );
  if (!quote)
    return (
      <div className='p-6 text-center bg-slate-800 rounded-lg'>
        <h2 className='text-2xl font-bold text-red-400'>Quotation Not Found</h2>
        <p className='text-slate-400 mt-2'>
          This link may be invalid, expired, or the quote may have already been actioned.
        </p>
      </div>
    );

  const isActionable = quote.status === 'pending_approval';
  const totalBeforeWaiver = Number(quote.subTotal) - Number(quote.troubleshootFee);

  return (
    <div className='max-w-4xl mx-auto space-y-6'>
      <div className='text-center'>
        <h1 className='text-3xl font-bold'>Repair Quotation</h1>
        <p className='text-slate-400'>Quote #: {quote.quoteNumber}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Repair Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            <strong>Customer:</strong> {quote.repairTicketId.customerId.name}
          </p>
          <p>
            <strong>Ticket #:</strong> {quote.repairTicketId.ticketNumber}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quoted Items, Services & Fees</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead className='text-right'>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quote.lineItems.map((item, i) => (
                <TableRow key={i}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{item.quantity || item.laborHours}</TableCell>
                  <TableCell className='text-right font-mono'>
                    {formatCurrency((item.unitPrice || item.laborRate) * (item.quantity || item.laborHours))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* --- THE DEFINITIVE FIX: TRANSPARENT FEE CALCULATION --- */}
          <div className='mt-4 pt-4 border-t border-slate-700 space-y-2 text-right'>
            <div className='flex justify-end items-center gap-4'>
              <span className='text-slate-400'>Subtotal (Parts & Labor)</span>{' '}
              <span className='font-mono w-32'>{formatCurrency(quote.subTotal)}</span>
            </div>
            <div className='flex justify-end items-center gap-4'>
              <span className='text-slate-400'>Troubleshoot Fee</span>{' '}
              <span className='font-mono w-32'>{formatCurrency(quote.troubleshootFee)}</span>
            </div>
            <div className='flex justify-end items-center gap-4 border-t border-slate-800 pt-2'>
              <span className='text-slate-400'>Total Before Tax</span>{' '}
              <span className='font-mono w-32'>{formatCurrency(totalBeforeWaiver)}</span>
            </div>
            {quote.taxBreakdown.map((tax, i) => (
              <div key={i} className='flex justify-end items-center gap-4'>
                <span className='text-slate-400'>{tax.ruleName}</span>{' '}
                <span className='font-mono w-32'>{formatCurrency(tax.amount)}</span>
              </div>
            ))}
            <div className='flex justify-end items-center gap-4 text-xl font-bold border-t border-slate-700 pt-2'>
              <span className=''>Grand Total</span>{' '}
              <span className='font-mono w-32'>{formatCurrency(quote.grandTotal)}</span>
            </div>

            {quote.troubleshootFee > 0 && (
              <div className='mt-4 p-3 bg-green-900/50 text-green-300 text-sm rounded-md text-center'>
                <strong>Note:</strong> The {formatCurrency(quote.troubleshootFee)} troubleshoot fee is included in the
                Grand Total and will be **waived** upon your approval of this quotation. If declined, this fee will be
                due.
              </div>
            )}
          </div>
          {/* --- END OF FIX --- */}
        </CardContent>
      </Card>

      {isActionable && (
        <Card>
          <CardHeader>
            <CardTitle>Approval & Signature</CardTitle>
            <CardDescription>
              Please sign below to approve this quotation and authorize the repair work.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SignaturePad onSave={setSignature} />
            <div className='flex justify-end gap-4 mt-6'>
              <Button variant='destructive' size='lg' onClick={handleDecline} disabled={isSaving}>
                <XCircle className='mr-2 h-5 w-5' />
                Decline Quote
              </Button>
              <Button size='lg' onClick={handleApprove} disabled={!signature || isSaving}>
                <CheckCircle className='mr-2 h-5 w-5' />
                Accept & Sign Quote
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!isActionable && (
        <div className='p-6 text-center bg-slate-800 rounded-lg'>
          <h2 className='text-2xl font-bold text-green-400 capitalize'>This quote has been {quote.status}.</h2>
          <p className='text-slate-400 mt-2'>Thank you. Our team will proceed with the next steps.</p>
        </div>
      )}
    </div>
  );
};

export default RepairQuotePage;
