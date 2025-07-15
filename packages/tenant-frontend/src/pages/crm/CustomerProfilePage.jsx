import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { tenantCustomerService, tenantInstallmentService } from '../../services/api';

// We will build these components in the next steps

import LedgerView from '../../components/accounting/LedgerView';
import { Button, Card, CardContent, CardHeader, CardTitle, Modal } from 'ui-library';
import CustomerProfileHeader from '../../components/crm/CustomerProfileHeader';
import CustomerFinancialSummary from '../../components/crm/CustomerFinancialSummary';
import InstallmentPlanList from '../../components/payments/InstallmentPlanList';
import { Tabs, List, TabsList, TabsTrigger, TabsContent } from '@radix-ui/react-tabs';
import CustomerCreditWidget from '../../components/crm/CustomerCreditWidget';
import { generateCodeSvg } from 'label-renderer';
import { ArrowLeft, QrCode, RotateCw } from 'lucide-react';
import useAuth from '../../context/useAuth';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from 'ui-library';
/**
 * A "smart" page component that orchestrates the entire customer profile view.
 * It fetches all data, manages state, and passes props down to dumb components.
 */
const CustomerProfilePage = () => {
  const { id } = useParams(); // Get customer ID from the URL, e.g., /crm/customers/:id
  const { user } = useAuth();
  const [customer, setCustomer] = useState(null);
  const [ledger, setLedger] = useState({ entries: [], pagination: null });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [installmentPlans, setInstallmentPlans] = useState([]); // <-- 2. ADD NEW STATE
  const [qrCodeSvg, setQrCodeSvg] = useState('');
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [activePortalToken, setActivePortalToken] = useState(null);
  const handleGenerateQR = async () => {
    try {
      const res = await toast.promise(tenantCustomerService.generatePortalToken(id), {
        loading: 'Generating secure link...',
        success: 'Secure link generated!',
        error: 'Failed to generate link.',
      });
      const loginUrl = res.data.data.loginUrl;
      // --- THE FIX: Call our existing, powerful function ---
      const svgDataUri = await generateCodeSvg(
        {
          id: 'customer-portal-qr', // Provide a unique ID for logging
          type: 'qrcode',
          dataField: 'loginUrl',
        },
        { loginUrl },
      );
      setQrCodeSvg(svgDataUri);
      setIsQrModalOpen(true);
    } catch (error) {
      console.error('QR Generation failed:', error);
    }
  };

  const handleGenerateQROld = async () => {
    try {
      // 1. Call the backend to get the secure login URL
      const res = await toast.promise(tenantCustomerService.generatePortalToken(id), {
        loading: 'Generating secure link...',
        success: 'Secure link generated!',
        error: 'Failed to generate link.',
      });

      const loginUrl = res.data.data.loginUrl;
      console.log({ loginUrl });
      // 2. Use our existing library to convert the URL into an SVG QR Code
      const svgDataUri = await generateCodeSvg(
        { type: 'qrcode', dataField: 'loginUrl' }, // Element config
        { loginUrl }, // Item data
      );

      // 3. Set the state to display the QR code in a modal
      setQrCodeSvg(svgDataUri);
      setIsQrModalOpen(true);
    } catch (error) {
      console.error('QR Generation failed:', error);
      // The toast will already have shown an error message
    }
  };
  const fetchData = useCallback(async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      setError(null);

      // Fetch customer details and their ledger transactions in parallel for performance
      const [customerResponse, ledgerResponse, plansResponse] = await Promise.all([
        tenantCustomerService.getById(id), // Assuming getById exists in your service
        tenantCustomerService.getCustomerLedger(id, { page: 1, limit: 15 }),
        tenantInstallmentService.getAllForCustomer(id),
      ]);
      setActivePortalToken(customerResponse.data.data.activePortalToken);
      setInstallmentPlans(plansResponse.data.data);
      if (customerResponse.data.success) {
        setCustomer(customerResponse.data.data.customer);
      } else {
        throw new Error('Could not fetch customer details.');
      }

      if (ledgerResponse.data.success) {
        setLedger({
          entries: ledgerResponse.data.data,
          pagination: ledgerResponse.data.pagination,
        });
      } else {
        throw new Error('Could not fetch customer ledger.');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to load customer profile.';
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= ledger.pagination.totalPages) {
      // Refetch data for the new page
      fetchData(newPage);
    }
  };

  const generateAndShowQr = async (token) => {
    const baseUrl = window.location.origin; // Use the current origin for the portal URL
    const loginUrl = `${baseUrl}/portal/login?token=${token}&tenant=${user.subdomain}`;
    const svgDataUri = await generateCodeSvg(
      { id: 'customer-portal-qr', type: 'qrcode', dataField: 'loginUrl' },
      { loginUrl },
    );
    setQrCodeSvg(svgDataUri);
    setIsQrModalOpen(true);
  };
  const handleViewExistingQR = () => {
    if (activePortalToken) {
      generateAndShowQr(activePortalToken);
    }
  };

  useEffect(() => {
    if (activePortalToken && qrCodeSvg === '') {
      generateAndShowQr(activePortalToken);
    }
  }, [activePortalToken, qrCodeSvg]);

  const handleGenerateNewQR = async () => {
    try {
      const res = await toast.promise(tenantCustomerService.generatePortalToken(id), {
        loading: 'Generating new secure link...',
        success: 'New link generated!',
        error: 'Failed to generate link.',
      });
      const newToken = res.data.data.token;
      setActivePortalToken(newToken); // Update the local state with the new token
      generateAndShowQr(newToken);
    } catch (error) {
      console.error('QR Generation failed:', error);
    }
  };

  const currentBalance = useMemo(() => {
    if (!customer || !ledger) return 0;
    // Calculate balance from the ledger entries for the customer's A/R account
    return ledger.entries?.reduce((bal, entry) => {
      if (entry.debitAccountId?.toString() === customer.ledgerAccountId) return bal + entry.amountInBaseCurrency;
      if (entry.creditAccountId?.toString() === customer.ledgerAccountId) return bal - entry.amountInBaseCurrency;
      return bal;
    }, 0);
  }, [customer, ledger]);

  if (isLoading) {
    return <div className='p-8 text-center'>Loading customer profile...</div>;
  }

  if (error) {
    return <div className='p-8 text-center text-red-400'>Error: {error}</div>;
  }

  if (!customer) {
    return <div className='p-8 text-center'>Customer not found.</div>;
  }

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <Link to='/crm/customers' className='flex items-center text-sm text-indigo-400 hover:underline mb-2'>
            <ArrowLeft className='h-4 w-4 mr-2' />
            Back to All Customers
          </Link>
        </div>
      </div>

      <div className='p-4 bg-slate-800 rounded-lg'>
        <CustomerProfileHeader
          handleViewExistingQR={handleViewExistingQR}
          activePortalToken={activePortalToken}
          qrCodeSvg={qrCodeSvg}
          handleGenerateNewQR={handleGenerateNewQR}
          handleGenerateQR={handleGenerateQR}
          customer={customer}
        />
      </div>
      <div className='md:col-span-1 space-y-6'>
        {/* --- 4. RENDER THE NEW WIDGET --- */}
        <CustomerCreditWidget creditLimit={customer.creditLimit} currentBalance={currentBalance} />
        {/* Placeholder for other summary cards */}
      </div>

      {/* Placeholder for the financial summary component */}
      <div className='p-4 bg-slate-800 rounded-lg'>
        <CustomerFinancialSummary
          ledgerEntries={ledger.entries}
          creditLimit={customer.creditLimit}
          ledgerAccountId={customer?.ledgerAccountId?._id}
        />
      </div>

      <Tabs defaultValue='transactions'>
        <TabsList className='flex border-b border-slate-700'>
          <TabsTrigger value='transactions' className='px-4 py-2 ui-tabs-trigger'>
            Transaction History
          </TabsTrigger>
          <TabsTrigger value='installments' className='px-4 py-2 ui-tabs-trigger'>
            Installment Plans
          </TabsTrigger>
        </TabsList>
        <div className='pt-6'>
          <TabsContent value='transactions'>
            <Card>
              <CardHeader>
                <CardTitle>Ledger History</CardTitle>
              </CardHeader>
              <CardContent className='p-0'>
                <LedgerView entries={ledger.entries} pagination={ledger.pagination} onPageChange={handlePageChange} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value='installments'>
            <Card>
              <CardHeader>
                <CardTitle>Active Installment Plans</CardTitle>
              </CardHeader>
              <CardContent className='p-0'>
                <InstallmentPlanList plans={installmentPlans} />
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>

      <Modal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)} title='Customer Portal Access QR Code'>
        <div className='flex flex-col items-center justify-center p-4'>
          {qrCodeSvg ? (
            <img src={qrCodeSvg} alt='Customer Portal Access QR Code' className='w-64 h-64 bg-white p-2 rounded-lg' />
          ) : (
            <p>Generating QR Code...</p>
          )}
          <p className='text-center mt-4 text-sm text-slate-400'>
            Have the customer scan this code with their phone to access their portal.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default CustomerProfilePage;
