import { ArrowRight, CheckCircle, ChevronDown, Clock, FileText, Send } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Modal,
  Tooltip,
  TooltipProvider,
} from 'ui-library';
import useAuth from '../../context/useAuth';

const QuoteList = ({ quotes, onSend, loading = false }) => {
  const { formatCurrency, formatDate } = useAuth();
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [viewingQuote, setViewingQuote] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Status configuration
  const statusConfig = {
    draft: {
      icon: <FileText className='w-4 h-4' />,
      color: 'bg-slate-600/20 text-slate-400',
      label: 'Draft',
      action: null,
    },
    pending_approval: {
      icon: <Clock className='w-4 h-4' />,
      color: 'bg-yellow-500/20 text-yellow-500',
      label: 'Pending Approval',
      action: 'send',
    },
    approved: {
      icon: <CheckCircle className='w-4 h-4' />,
      color: 'bg-emerald-500/20 text-emerald-500',
      label: 'Approved',
      action: null,
    },
    declined: {
      icon: <FileText className='w-4 h-4' />,
      color: 'bg-rose-500/20 text-rose-500',
      label: 'Declined',
      action: null,
    },
    superseded: {
      icon: <FileText className='w-4 h-4' />,
      color: 'bg-purple-500/20 text-purple-400',
      label: 'Superseded',
      action: null,
    },
  };

  // Process quotes with filtering and sorting
  const processedQuotes = useMemo(() => {
    let result = [...quotes];

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter((quote) => quote.status === statusFilter);
    }

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [quotes, statusFilter, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  // Calculate days until expiry
  const getDaysUntilExpiry = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Handle view action
  const handleViewQuote = (quote) => {
    setViewingQuote(quote);
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setViewingQuote(null);
  };

  return (
    <div className='space-y-4'>
      {/* Filter and Sort Controls */}
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <div className='flex items-center gap-2'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' size='sm' className='flex items-center gap-1'>
                {statusFilter === 'all' ? 'All Statuses' : statusConfig[statusFilter]?.label}
                <ChevronDown className='w-4 h-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='start' className='w-48'>
              <DropdownMenuItem onClick={() => setStatusFilter('all')}>All Statuses</DropdownMenuItem>
              {Object.entries(statusConfig).map(([key, config]) => (
                <DropdownMenuItem key={key} onClick={() => setStatusFilter(key)} className='flex items-center gap-2'>
                  <span className={config.color + ' w-2 h-2 rounded-full'}></span>
                  {config.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <span className='text-sm text-slate-500 hidden sm:block'>
            {processedQuotes.length} {processedQuotes.length === 1 ? 'quote' : 'quotes'}
          </span>
        </div>

        <div className='flex items-center gap-1'>
          <Button
            size='sm'
            variant={sortConfig.key === 'createdAt' ? 'default' : 'outline'}
            onClick={() => handleSort('createdAt')}
            className='px-2'
          >
            {sortConfig.key === 'createdAt' ? (sortConfig.direction === 'asc' ? 'Oldest' : 'Newest') : 'Newest'}
          </Button>
          <Button
            size='sm'
            variant={sortConfig.key === 'expiryDate' ? 'default' : 'outline'}
            onClick={() => handleSort('expiryDate')}
            className='px-2'
          >
            {sortConfig.key === 'expiryDate' ? (sortConfig.direction === 'asc' ? 'Farthest' : 'Soonest') : 'Expiry'}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className='space-y-2'>
          {[...Array(3)].map((_, i) => (
            <div key={i} className='h-16 rounded-lg bg-slate-800/50 animate-pulse' />
          ))}
        </div>
      ) : (
        <>
          {/* Quote List - Compact View */}
          <div className='space-y-2'>
            {processedQuotes.map((quote) => {
              const isExpired = quote.expiryDate < new Date();
              const daysUntilExpiry = getDaysUntilExpiry(quote.expiryDate);
              const status = statusConfig[quote.status] || {};

              return (
                <div
                  key={quote._id}
                  className={`bg-slate-800/50 rounded-lg border ${
                    isExpired ? 'border-rose-500/30' : 'border-slate-700'
                  } p-3 hover:bg-slate-800 transition-colors group`}
                >
                  <div className='flex justify-between items-start gap-3'>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center gap-2 mb-1'>
                        <h3 className='font-bold truncate'>{quote.quoteNumber}</h3>
                        <Badge className='bg-slate-700 text-xs px-1.5 py-0.5'>v{quote.version}</Badge>
                        <Badge className={`${status.color} flex items-center gap-1 px-2 py-0.5 text-xs`}>
                          {status.icon}
                          <span>{status.label}</span>
                        </Badge>
                      </div>

                      <div className='flex flex-wrap items-center gap-3 text-sm'>
                        <div className='font-medium'>{formatCurrency(quote.grandTotal)}</div>
                        <div className='text-slate-500 hidden sm:block'>|</div>
                        <div className={`${isExpired ? 'text-rose-400' : 'text-slate-400'} flex items-center gap-1`}>
                          <Clock className='w-3.5 h-3.5' />
                          <span>
                            {formatDate(quote.expiryDate)}
                            {!isExpired && (
                              <span className='ml-1 text-xs'>
                                ({daysUntilExpiry} {daysUntilExpiry === 1 ? 'day' : 'days'})
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className='flex items-center gap-1'>
                      {status.action === 'send' && (
                        <TooltipProvider>
                          <Tooltip content='Send to customer'>
                            <Button
                              size='icon'
                              variant='outline'
                              onClick={() => onSend(quote._id)}
                              className='h-8 w-8'
                              aria-label={`Send quote ${quote.quoteNumber}`}
                            >
                              <Send className='h-4 w-4' />
                            </Button>
                          </Tooltip>
                        </TooltipProvider>
                      )}

                      <TooltipProvider>
                        <Tooltip content={`View ${quote.quoteNumber}`}>
                          <Button
                            size='icon'
                            variant='ghost'
                            className='h-8 w-8 text-slate-400 hover:text-white group-hover:bg-slate-700 transition-colors'
                            aria-label={`View quote ${quote.quoteNumber}`}
                            onClick={() => handleViewQuote(quote)}
                          >
                            <ArrowRight className='h-4 w-4' />
                          </Button>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {!loading && processedQuotes.length === 0 && (
            <div className='text-center py-6 px-4 bg-slate-800/30 rounded-lg border border-slate-700'>
              <div className='inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-800 mb-3 mx-auto'>
                <FileText className='w-5 h-5 text-slate-500' />
              </div>
              <h3 className='text-sm font-medium text-slate-300 mb-1'>No quotes found</h3>
              <p className='text-xs text-slate-500'>
                {statusFilter !== 'all'
                  ? `No ${statusConfig[statusFilter]?.label.toLowerCase()} quotes`
                  : 'Create your first quote to get started'}
              </p>
            </div>
          )}
        </>
      )}

      {/* Quote Detail Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={viewingQuote?.quoteNumber || 'Quote Details'}
        description={`Version ${viewingQuote?.version} | Created ${viewingQuote && formatDate(viewingQuote.createdAt)}`}
        size='l'
        footer={
          <div className='flex justify-end w-full gap-2'>
            <Button variant='outline' onClick={closeModal}>
              Close
            </Button>
            {viewingQuote?.status === 'pending_approval' && (
              <Button
                onClick={() => {
                  onSend(viewingQuote._id);
                  closeModal();
                }}
              >
                <Send className='h-4 w-4 mr-2' />
                Send to Customer
              </Button>
            )}
          </div>
        }
      >
        {viewingQuote && (
          <div className='space-y-6'>
            {/* Status and Expiry */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <h3 className='text-sm font-medium text-slate-400'>Status</h3>
                <Badge
                  className={`${statusConfig[viewingQuote.status]?.color} flex items-center gap-1 px-3 py-1 text-sm`}
                >
                  {statusConfig[viewingQuote.status]?.icon}
                  <span>{statusConfig[viewingQuote.status]?.label}</span>
                </Badge>
              </div>

              <div className='space-y-2'>
                <h3 className='text-sm font-medium text-slate-400'>Expiry</h3>
                <div
                  className={`flex items-center gap-2 ${viewingQuote.expiryDate < new Date() ? 'text-rose-400' : 'text-slate-300'}`}
                >
                  <Clock className='h-4 w-4' />
                  <span>
                    {formatDate(viewingQuote.expiryDate)}
                    {viewingQuote.expiryDate >= new Date() && (
                      <span className='ml-2 text-sm text-slate-500'>
                        (Expires in {getDaysUntilExpiry(viewingQuote.expiryDate)} days)
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Pricing Summary */}
            <div className='space-y-4'>
              <h3 className='text-md font-semibold border-b border-slate-700 pb-2'>Pricing Summary</h3>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <div className='flex justify-between'>
                    <span className='text-slate-400'>Service Cost:</span>
                    <span>
                      {formatCurrency(
                        viewingQuote.lineItems
                          ?.filter((c) => c.itemType === 'service')
                          .reduce((a, c) => a + c.unitPrice, 0),
                      )}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-slate-400'>Parts Cost:</span>
                    <span>{formatCurrency(viewingQuote.totalPartsCost)}</span>
                  </div>
                  {/* <div className='flex justify-between'>
                    <span className='text-slate-400'>Parts Markup:</span>
                    <span>+{formatCurrency(viewingQuote.totalPartsMarkup)}</span>
                  </div> */}
                  <div className='flex justify-between'>
                    <span className='text-slate-400'>Labor:</span>
                    <span>{formatCurrency(viewingQuote.totalLaborPrice)}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-slate-400'>Troubleshooting:</span>
                    <span>{formatCurrency(viewingQuote.troubleshootFee)}</span>
                  </div>
                </div>

                <div className='space-y-2 bg-slate-800/50 p-4 rounded-lg'>
                  <div className='flex justify-between'>
                    <span className='text-slate-400'>Subtotal:</span>
                    <span>{formatCurrency(viewingQuote.subTotal)}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-slate-400'>Discount:</span>
                    <span className='text-emerald-400'>-{formatCurrency(viewingQuote.totalGlobalDiscount)}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-slate-400'>Tax:</span>
                    <span>+{formatCurrency(viewingQuote.totalTax)}</span>
                  </div>
                  <div className='flex justify-between font-semibold mt-2 pt-2 border-t border-slate-700'>
                    <span>Total:</span>
                    <span className='text-lg'>{formatCurrency(viewingQuote.grandTotal)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className='space-y-4'>
              <h3 className='text-md font-semibold border-b border-slate-700 pb-2'>Line Items</h3>
              <div className='space-y-3'>
                {viewingQuote.lineItems.map((item, index) => (
                  <div key={index} className='flex justify-between items-start py-2 border-b border-slate-700/50'>
                    <div>
                      <h4 className='font-medium'>{item.description}</h4>
                      <div className='text-sm text-slate-500 mt-1'>
                        {item.quantity} × {formatCurrency(item.unitPrice)}
                        <span className='mx-2'>|</span>
                        {item.itemType.charAt(0).toUpperCase() + item.itemType.slice(1)}
                      </div>
                    </div>
                    <div className='text-right'>
                      <div>{formatCurrency(item.quantity * item.unitPrice)}</div>
                      <div className='text-xs text-slate-500'>Cost: {formatCurrency(item.costPrice)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Terms */}
            {viewingQuote.termsAndConditions && (
              <div className='space-y-2'>
                <h3 className='text-md font-semibold'>Terms & Conditions</h3>
                <p className='text-sm text-slate-400 whitespace-pre-wrap'>{viewingQuote.termsAndConditions}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
export default QuoteList;
