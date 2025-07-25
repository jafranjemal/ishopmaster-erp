import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs';
import { Eye, Library } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Badge, Button, Modal } from 'ui-library';
import useAuth from '../../context/useAuth';
import { tenantCustomerService } from '../../services/api';

const HistoryList = ({ items, renderItem }) => (
  <div className='min-h-[100vh] overflow-y-auto pr-2'>
    {items.length === 0 ? (
      <div className='h-100 text-center py-12 rounded-2xl bg-gradient-to-br from-slate-900/50 to-slate-800/30 border border-slate-700/50 backdrop-blur-sm'>
        <div className='mx-auto bg-slate-800/50 w-14 h-14 rounded-full flex items-center justify-center mb-3'>
          <Library className='h-60 w-60 text-indigo-400' />
        </div>
        <p className='text-slate-400 text-sm'>No records found for this period</p>
      </div>
    ) : (
      <div className='  grid grid-cols-1 md:grid-cols-2 gap-4'>
        {items.map((item, index) => (
          <div
            key={index}
            className='  bg-slate-800/40 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden transition-all duration-300 hover:border-indigo-500/30 hover:shadow-lg'
          >
            {renderItem(item)}
          </div>
        ))}
      </div>
    )}
  </div>
);

const CustomerHistoryModal = ({ isOpen, onClose, customer, onLoadToPos }) => {
  const [history, setHistory] = useState({ activeRepairs: [], pastRepairs: [], salesHistory: [] });
  const [isLoading, setIsLoading] = useState(true);
  const { formatDate, formatCurrency } = useAuth();

  useEffect(() => {
    if (isOpen && customer) {
      setIsLoading(true);
      tenantCustomerService
        .getCustomerHistory(customer._id)
        .then((res) => {
          const repairs = res.data.data.repairHistory || [];
          setHistory({
            activeRepairs: repairs.filter((r) => !['closed', 'cancelled'].includes(r.status)),
            pastRepairs: repairs.filter((r) => ['closed', 'cancelled'].includes(r.status)),
            salesHistory: res.data.data.salesHistory || [],
          });
        })
        .catch(() => toast.error('Failed to load customer history.'))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, customer]);

  const renderRepairItem = (item) => (
    <div key={item._id} className='p-4 bg-slate-800 rounded-lg flex flex-col space-y-2'>
      <div className='flex justify-between items-center'>
        <div>
          <p className='font-mono text-indigo-400'>{item.ticketNumber}</p>
          <p className='text-xs text-slate-300'>{item.customerComplaint}</p>
        </div>
        <Badge variant='secondary' className='capitalize'>
          {item.status.replace('_', ' ')}
        </Badge>
      </div>

      <div className='grid grid-cols-2 gap-4 text-xs text-slate-400'>
        <div>
          <p>
            <strong>Branch:</strong> {item.branchName}
          </p>
          <p>
            <strong>Technician:</strong> {item.technicianName}
          </p>
        </div>
        <div>
          <p>
            <strong>Opened:</strong> {formatDate(item.createdAt)}
          </p>
          <p>
            <strong>Assets:</strong> {item.assets.join(', ')}
          </p>
        </div>
      </div>

      <div className='grid grid-cols-3 gap-4 text-xs text-slate-400'>
        <div>
          <strong>Parts:</strong> {item.jobSheet.partsCount}
        </div>
        <div>
          <strong>Labor Hrs:</strong> {item.jobSheet.laborHours}
        </div>
        <div>
          <strong>QC:</strong> {item.qcStatus || 'N/A'}
        </div>
      </div>

      <div className='flex justify-between items-center'>
        <Button
          size='sm'
          variant='outline'
          onClick={() => onLoadToPos({ type: 'RepairTicket', document: item, action: 'view' })}
        >
          <Eye className='h-4 w-4 mr-1' />
          View Details
        </Button>

        {item.finalInvoiceId && (
          <Button
            size='sm'
            onClick={() =>
              onLoadToPos({ type: 'SalesInvoice', document: { _id: item.finalInvoiceId }, action: 'view' })
            }
          >
            View Invoice
          </Button>
        )}
      </div>
    </div>
  );

  const renderSaleItem = (item) => (
    <div key={item._id} className='p-4 bg-slate-800 rounded-lg flex flex-col space-y-2'>
      <div className='flex justify-between items-center'>
        <p className='font-mono text-indigo-400'>{item.invoiceId}</p>
        <Badge variant={item.paymentStatus === 'paid' ? 'success' : 'warning'}>
          {item.paymentStatus.replace('_', ' ')}
        </Badge>
      </div>

      <div className='grid grid-cols-2 gap-4 text-xs text-slate-400'>
        <div>
          <p>
            <strong>Branch:</strong> {item.branchName}
          </p>
          <p>
            <strong>Cashier:</strong> {item.cashierName}
          </p>
        </div>
        <div>
          <p>
            <strong>Date:</strong> {formatDate(item.createdAt)}
          </p>
          <p>
            <strong>Due:</strong> {formatDate(item.dueDate)}
          </p>
        </div>
      </div>

      <div className='grid grid-cols-3 gap-4 text-xs text-slate-400'>
        <div>
          <strong>Subtotal:</strong> {formatCurrency(item.subTotal)}
        </div>
        <div>
          <strong>Tax:</strong> {formatCurrency(item.totalTax)}
        </div>
        <div>
          <strong>Discount:</strong>{' '}
          {item.globalDiscount ? `${item.globalDiscount.type} ${item.globalDiscount.value}` : '—'}
        </div>
      </div>

      <div className='grid grid-cols-2 gap-4 text-xs text-slate-400'>
        <div>
          <strong>Charges:</strong> {item.additionalCharges?.length || 0}
        </div>
        <div>
          <strong>Items:</strong> {item.itemCount}
        </div>
      </div>

      <div className='flex justify-between items-center'>
        <p className='text-lg font-semibold'>{formatCurrency(item.totalAmount)}</p>
        <Button
          size='sm'
          variant='outline'
          onClick={() => onLoadToPos({ type: 'SalesInvoice', document: item, action: 'view' })}
        >
          <Eye className='h-4 w-4 mr-1' />
          View Details
        </Button>
      </div>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`History for ${customer?.name}`} size='l'>
      {isLoading ? (
        <p className='p-8 text-center'>Loading history...</p>
      ) : (
        <Tabs defaultValue='active_repairs'>
          <TabsList className='grid w-full grid-cols-3'>
            <TabsTrigger value='active_repairs'>Active Repairs ({history.activeRepairs.length})</TabsTrigger>
            <TabsTrigger value='past_repairs'>Past Repairs ({history.pastRepairs.length})</TabsTrigger>
            <TabsTrigger value='sales_history'>Sales History ({history.salesHistory.length})</TabsTrigger>
          </TabsList>

          <TabsContent value='active_repairs' className='mt-4'>
            <HistoryList items={history.activeRepairs} renderItem={renderRepairItem} />
          </TabsContent>

          <TabsContent value='past_repairs' className='mt-4'>
            <HistoryList items={history.pastRepairs} renderItem={renderRepairItem} />
          </TabsContent>

          <TabsContent value='sales_history' className='mt-4'>
            <HistoryList items={history.salesHistory} renderItem={renderSaleItem} />
          </TabsContent>
        </Tabs>
      )}
    </Modal>
  );
};

export default CustomerHistoryModal;
