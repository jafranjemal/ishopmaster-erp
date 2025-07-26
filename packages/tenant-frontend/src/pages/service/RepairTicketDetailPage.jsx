import {
  ArrowLeft,
  CheckSquare,
  ChevronDown,
  Cpu,
  DollarSign,
  FileSignature,
  FileText,
  Flag,
  LoaderCircle,
  MessageSquare,
  MonitorSmartphone,
  Printer,
  ShoppingBag,
  Timer,
  User,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ConfirmationModal,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  FileUploader,
  Label,
  Modal,
} from 'ui-library';
import PaymentApplicationModal from '../../components/payments/PaymentApplicationModal';
import InvoiceSummaryCard from '../../components/sales/details/InvoiceSummaryCard';
import FlagRequoteForm from '../../components/service/FlagRequoteForm';
import JobSheetEditor from '../../components/service/JobSheetEditor';
import LaborTimerWidget from '../../components/service/LaborTimerWidget';
import MatrixQcGrid from '../../components/service/MatrixQcGrid';
import QuoteList from '../../components/service/QuoteList';
import StatusUpdater from '../../components/service/StatusUpdater';
import TechnicianSelector from '../../components/service/TechnicianSelector';
import StatusTimeline from '../../components/service/TicketStatusTimeline';
import PrintModal from '../../components/shared/PrintModal';
import useAuth from '../../context/useAuth';
import {
  tenantPaymentMethodService,
  tenantPaymentsService,
  tenantRepairService,
  tenantUploadService,
} from '../../services/api';

const RepairTicketDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { formatCurrency, user } = useAuth();
  const [quotes, setQuotes] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [qcTemplate, setQcTemplate] = useState(null);
  const [isQcLoading, setIsQcLoading] = useState(false);
  const [isSubmittingQc, setIsSubmittingQc] = useState(false);
  const [activeTimer, setActiveTimer] = useState(null);
  const [isRequoteModalOpen, setIsRequoteModalOpen] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isConfirmQcOpen, setIsConfirmQcOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [ticketRes, quotesRes, timerRes, pmRes] = await Promise.all([
        tenantRepairService.getTicketById(id),
        tenantRepairService.getQuotesForTicket(id),
        tenantRepairService.getActiveTimer(id),
        tenantPaymentMethodService.getAll(),
      ]);
      setPaymentMethods(pmRes.data.data);
      setTicket(ticketRes.data.data);
      setQuotes(quotesRes.data.data);
      setActiveTimer(timerRes.data.data);
    } catch (error) {
      console.log(error);
      toast.error('Failed to load ticket details.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (ticket?.status === 'qc_pending' && !qcTemplate) {
      setIsQcLoading(true);
      tenantRepairService
        .getQcDetails(ticket._id)
        .then((res) => {
          console.log('getQcDetails ', res.data.data);
          setQcTemplate(res.data.data);
        })
        .catch((err) => toast.error(err.response?.data?.error || 'Failed to load QC Checklist.'))
        .finally(() => setIsQcLoading(false));
    }
  }, [ticket, qcTemplate]);

  const handleUpdateFeeStatus = async (newStatus) => {
    try {
      const res = await toast.promise(tenantRepairService.updateTroubleshootFeeStatus(id, newStatus), {
        loading: `Marking fee as ${newStatus}...`,
        success: `Fee status updated to ${newStatus}!`,
        error: (err) => err.response?.data?.error || 'Update failed.',
      });
      handleTicketUpdate(res.data.data);
    } catch (err) {}
  };

  const handleGenerateInvoice = async () => {
    try {
      await toast.promise(tenantRepairService.generateInvoiceManually(id), {
        loading: 'Generating final invoice...',
        success: 'Invoice generated successfully!',
        error: (err) => err.response?.data?.error || 'Failed to generate invoice.',
      });
      // After success, refresh the ticket data to get the new invoiceId
      fetchData(false);
    } catch (err) {
      // Error is handled by the toast promise
    }
  };

  const handleTakePayment = () => {
    if (ticket && ticket.finalInvoiceId) {
      // Redirect to the POS terminal, passing the invoice ID in the URL
      navigate(`/pos/terminal?loadInvoice=${ticket.finalInvoiceId._id}`);
    }
  };
  const renderFinalizeButton = () => {
    if (ticket.status === 'pickup_pending') {
      if (ticket.finalInvoiceId) {
        const isPaid = ticket.finalInvoiceId.paymentStatus === 'paid';
        return (
          <div className='flex float-end gap-2'>
            <Button
              onClick={() => setIsPaymentModalOpen(true)}
              disabled={ticket.finalInvoiceId.paymentStatus === 'paid'}
            >
              <DollarSign className='h-4 w-4 mr-2' />
              {ticket.finalInvoiceId.paymentStatus === 'paid' ? 'Fully Paid' : 'Record Payment'}
            </Button>
            <Button onClick={handleTakePayment}>
              <MonitorSmartphone className='h-4 w-4 mr-2' /> Take Pos Payment
            </Button>
            <Button onClick={handleConfirmPickup} disabled={!isPaid || isSaving}>
              <ShoppingBag className='h-4 w-4 mr-2' /> {isSaving ? 'Closing...' : 'Confirm Pickup'}
            </Button>
          </div>
        );
      } else {
        return (
          <Button type='button' onClick={handleGenerateInvoice} variant='outline'>
            <FileSignature className='h-4 w-4 mr-2' /> Generate Invoice Manually
          </Button>
        );
      }
    }
    return null; // Don't show the button for other statuses
  };

  const handleFlagForRequote = async (data) => {
    setIsSaving(true);
    try {
      const res = await toast.promise(tenantRepairService.flagForRequote(id, data), {
        loading: 'Flagging ticket...',
        success: 'Ticket flagged for re-quote!',
        error: 'Action failed.',
      });
      handleTicketUpdate(res.data.data);
      setIsRequoteModalOpen(false);
    } catch (err) {
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateQuote = async () => {
    try {
      // --- THE DEFINITIVE FIX: FULLY IMPLEMENTED TOAST ---
      await toast.promise(tenantRepairService.generateQuote(id, { terms: 'Standard 30-day warranty on parts.' }), {
        loading: 'Generating new quote...',
        success: 'New quote generated successfully!',
        error: (err) => err.response?.data?.error || 'Failed to generate quote.',
      });
      // --- END OF FIX ---
      fetchData(); // Refresh to show the new quote
    } catch (err) {
      /* Handled by toast */
    }
  };

  const handleSendQuote = async (quoteId) => {
    try {
      // --- THE DEFINITIVE FIX: FULLY IMPLEMENTED TOAST ---
      await toast.promise(tenantRepairService.sendQuote(quoteId), {
        loading: 'Sending quote to customer...',
        success: "Quote sent to customer's email!",
        error: (err) => err.response?.data?.error || 'Failed to send quote.',
      });
      // --- END OF FIX ---
    } catch (err) {
      /* Handled by toast */
    }
  };

  const handleTicketUpdate = (updatedTicket) => {
    fetchData();
  };

  const handleAfterPhotosUpload = async (files) => {
    if (files.length === 0) return;
    try {
      const photoData = files.map((f) => ({ url: f.url, public_id: f.public_id }));
      const res = await toast.promise(tenantRepairService.addAfterPhotos(id, photoData), {
        loading: 'Saving photos...',
        success: 'After photos saved successfully!',
        error: (err) => err.response?.data?.error || 'Failed to save photos.',
      });
      handleTicketUpdate(res.data.data);
    } catch (err) {
      /* Handled by toast */
    }
  };

  const handleAssignTechnician = async (employeeId) => {
    try {
      await toast.promise(tenantRepairService.assignTechnician(id, employeeId), {
        loading: 'Assigning...',
        success: 'Technician assigned!',
        error: 'Assignment failed.',
      });
      fetchData();
    } catch (err) {}
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await toast.promise(tenantRepairService.updateStatus(id, newStatus), {
        loading: 'Updating status...',
        success: 'Status updated!',
        error: 'Update failed.',
      });
      fetchData();
    } catch (err) {}
  };

  const handleSubmitForQc = () => {
    handleStatusChange('qc_pending');
  };

  const handleConfirmSubmitForQc = () => {
    setIsConfirmQcOpen(false); // Close the modal
    handleStatusChange('qc_pending');
  };

  const handleSubmitQc = async (qcData) => {
    setIsSubmittingQc(true);
    try {
      const res = await toast.promise(tenantRepairService.submitQcCheck(id, qcData), {
        loading: 'Submitting QC results...',
        success: 'QC results submitted!',
        error: 'Submission failed.',
      });
      setQcTemplate(null); // Clear the template to hide the form
      handleTicketUpdate(res.data.data);
    } catch (err) {
    } finally {
      setIsSubmittingQc(false);
    }
  };

  const handleStartTimer = async () => {
    setIsSaving(true);
    try {
      const res = await toast.promise(tenantRepairService.startTimer(id), {
        loading: 'Starting timer...',
        success: 'Timer started!',
        error: 'Failed to start timer.',
      });
      setActiveTimer(res.data.data);
      fetchData(false); // Refresh data without full page loader
    } catch (err) {
    } finally {
      setIsSaving(false);
    }
  };

  const handleStopTimer = async () => {
    setIsSaving(true);
    try {
      const res = await toast.promise(tenantRepairService.stopTimer(id), {
        loading: 'Stopping timer & logging labor...',
        success: 'Time logged successfully!',
        error: 'Failed to stop timer.',
      });
      setActiveTimer(res.data.data); // Directly update ticket with response
      fetchData(false);
    } catch (err) {
    } finally {
      setIsSaving(false);
    }
  };

  const handlePauseTimer = async () => {
    setIsSaving(true);
    try {
      const res = await toast.promise(tenantRepairService.pauseTimer(id), {
        loading: 'Pausing timer & logging labor...',
        success: 'Time logged successfully!',
        error: 'Failed to Pausing timer.',
      });
      setActiveTimer(res.data.data); // Directly update ticket with response
      fetchData(false);
    } catch (err) {
    } finally {
      setIsSaving(false);
    }
  };

  const { totalHoursLogged, isPaused } = useMemo(() => {
    if (!ticket) return { totalHoursLogged: 0, isPaused: false };
    const totalHours =
      ticket &&
      Array.isArray(ticket.jobSheet) &&
      ticket.jobSheet
        .filter((item) => item.itemType === 'labor')
        .reduce((sum, item) => sum + (item.laborHours || 0), 0);
    const paused = activeTimer?.status === 'paused';
    console.log('totalHours ', totalHours);
    return { totalHoursLogged: totalHours || 0, isPaused: paused };
  }, [ticket, activeTimer]);

  const showTimer = ticket && ticket.assignedTo?._id === user.employeeId;

  const handleRecordPayment = async (paymentData) => {
    try {
      await toast.promise(tenantPaymentsService.recordPayment(paymentData), {
        loading: 'Recording payment...',
        success: 'Payment recorded successfully!',
        error: (err) => err.response?.data?.error || 'Failed to record payment.',
      });
      setIsPaymentModalOpen(false);
      fetchData(); // Refresh the invoice data to show the new balance
    } catch (err) {
      // Error is handled by the toast promise
    }
  };

  const handleConfirmPickup = async () => {
    setIsSaving(true);
    try {
      const res = await toast.promise(tenantRepairService.confirmDevicePickup(id), {
        loading: 'Closing repair job...',
        success: 'Job closed successfully!',
        error: (err) => err.response?.data?.error || 'Failed to close job.',
      });
      handleTicketUpdate(res.data.data); // Refresh the ticket state
    } catch (err) {
      /* Handled by toast */
    } finally {
      setIsSaving(false);
    }
  };

  const isJobSheetLocked = useMemo(() => {
    if (!ticket) return true;
    // The Job Sheet can only be edited during diagnosis or when a re-quote is needed.
    return !['diagnosing', 'on_hold_pending_re_quote'].includes(ticket.status);
  }, [ticket]);

  const isTimerActive = activeTimer?.status === 'in_progress';

  if (isLoading) return <p className='p-8 text-center'>Loading ticket details...</p>;
  if (!ticket) return <p className='p-8 text-center'>Ticket not found.</p>;
  const isTechnicianView = ticket.assignedTo?._id === user.employeeId;
  const canGenerateQuote =
    user.permissions.includes('service:quote:create') &&
    ['diagnosing', 'on_hold_pending_re_quote'].includes(ticket.status);

  const DetailBlock = ({ label, value, icon }) => (
    <div className='flex items-start gap-3'>
      <div className='bg-slate-800 p-2 rounded-lg border border-slate-700'>{icon}</div>
      <div>
        <p className='text-sm font-medium text-slate-400'>{label}</p>
        <p className='font-medium text-slate-200'>{value}</p>
      </div>
    </div>
  );

  const canWaiveFees = user.permissions.includes('service:ticket:waive_fees');
  const isWorkActive = ['repair_active', 'qc_pending'].includes(ticket.status);
  return (
    <div className='space-y-6'>
      <Link to='/service/dashboard' className='flex items-center text-sm text-indigo-400 hover:underline'>
        <ArrowLeft className='h-4 w-4 mr-2' />
        Back to Service Dashboard
      </Link>
      {ticket.status === 'on_hold_pending_re_quote' && (
        <Alert variant='destructive'>
          <AlertTitle>Action Required: Re-Quote Needed</AlertTitle>
          <AlertDescription>
            A technician has flagged this job for re-quoting due to a new discovery. Please update the job sheet below
            and generate a new quote for customer approval.
          </AlertDescription>
        </Alert>
      )}
      <div className='flex justify-between items-center'>
        <h1 className='text-3xl font-bold'>Repair Ticket: {ticket.ticketNumber}</h1>
        {/* <Button disabled={ticket.status !== 'pickup_pending'}>Create Invoice</Button> */}
        {renderFinalizeButton()}

        <Button variant='outline' onClick={() => setIsPrintModalOpen(true)}>
          <Printer className='h-4 w-4 mr-2' /> Print
        </Button>
      </div>
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 items-start'>
        <div className='lg:col-span-2 space-y-6'>
          <Card className=' border-slate-800 rounded-xl'>
            <CardHeader className='border-b border-slate-800 pb-3'>
              <CardTitle className='text-lg font-medium flex items-center gap-2'>
                <User className='h-5 w-5 text-indigo-400' />
                Customer & Asset Details
              </CardTitle>
            </CardHeader>
            <CardContent className='p-0'>
              <div className='grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 p-5'>
                {/* Customer Details - Enhanced */}
                <div className='bg-slate-900 p-4 space-y-4'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <DetailBlock label='Customer' value={ticket.customerId.name} icon={<User size={16} />} />

                    <DetailBlock
                      label='Asset'
                      value={`${ticket.assets[0]?.deviceId?.name || 'N/A'} (SN: ${ticket.assets[0]?.serialNumber || 'N/A'})`}
                      icon={<Cpu size={16} />}
                    />
                  </div>

                  <div className='bg-slate-800/50 rounded-lg p-4 border border-slate-700'>
                    <div className='flex items-start gap-2'>
                      <MessageSquare className='h-4 w-4 text-slate-500 mt-0.5 flex-shrink-0' />
                      <div>
                        <p className='text-sm font-medium text-slate-400 mb-1'>Complaint</p>
                        <p className='text-slate-200 whitespace-pre-wrap'>{ticket.customerComplaint}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timer Widget - Enhanced Integration */}
                <div className='lg:w-72 flex flex-col'>
                  <div className='bg-slate-800/50 rounded-xl border border-slate-700 p-4 h-full'>
                    <div className='flex justify-between items-center mb-3'>
                      <h3 className='text-sm font-medium text-slate-400 flex items-center gap-1'>
                        <Timer className='h-4 w-4' />
                        Time Tracker
                      </h3>
                    </div>

                    <LaborTimerWidget
                      onStart={handleStartTimer}
                      onPause={handlePauseTimer}
                      onStop={handleStopTimer}
                      isPaused={isPaused}
                      totalEstimatedHours={totalHoursLogged}
                      totalHoursLogged={activeTimer?.totalHoursLogged}
                      isSaving={isSaving}
                      activeTimer={activeTimer}
                      ticket={ticket}
                    />

                    {ticket.status === 'repair_active' && activeTimer && !isTimerActive && (
                      <div className='border-t border-slate-700 pt-4'>
                        <Button className='w-full' onClick={handleSubmitForQc}>
                          <CheckSquare className='h-4 w-4 mr-2' /> Complete Repair & Submit for QC
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Job Sheet</CardTitle>
            </CardHeader>

            <CardContent>
              <JobSheetEditor isLocked={isJobSheetLocked} ticket={ticket} onUpdate={handleTicketUpdate} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Before & After Photos</CardTitle>
            </CardHeader>
            <CardContent className='grid grid-cols-2 gap-4'>
              <div>
                <Label>Before Repair</Label>
                <div className='grid grid-cols-3 gap-2'>
                  {ticket.beforeImages.map((img) => (
                    <img key={img.public_id} src={img.url} className='rounded-md' />
                  ))}
                </div>
              </div>
              <div>
                <Label>After Repair</Label>
                <div className='grid grid-cols-1 gap-2'>
                  {isWorkActive && (
                    <div className='mt-4'>
                      <FileUploader
                        onUploadComplete={handleAfterPhotosUpload}
                        getSignatureFunc={tenantUploadService.getCloudinarySignature}
                        multiple={true}
                      />
                    </div>
                  )}

                  {ticket.afterImages.map((img) => (
                    <img key={img.public_id} src={img.url} className='rounded-md' />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {ticket.status === 'qc_pending' && (
            <Card>
              <CardHeader>
                <CardTitle>Quality Control Check</CardTitle>
              </CardHeader>
              <CardContent>
                {isQcLoading && (
                  <div className='flex justify-center p-4'>
                    <LoaderCircle className='h-6 w-6 animate-spin' />
                  </div>
                )}
                {qcTemplate && (
                  <>
                    {/* <QcChecklistForm template={qcTemplate} onSubmit={handleSubmitQc} isSubmitting={isSubmittingQc} />
                    <HotkeyQcList template={qcTemplate} onSubmit={handleSubmitQc} isSubmitting={isSubmittingQc} /> */}
                    <MatrixQcGrid template={qcTemplate} onSubmit={handleSubmitQc} isSubmitting={isSubmittingQc} />
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className='lg:col-span-1 space-y-6'>
          {ticket.finalInvoiceId && <InvoiceSummaryCard invoice={ticket.finalInvoiceId} />}
          <Card>
            <CardHeader className='flex flex-row items-center justify-between'>
              <CardTitle>Quotations</CardTitle>
              <Button size='sm' onClick={handleGenerateQuote} disabled={!canGenerateQuote}>
                <FileText className='h-4 w-4 mr-2' />
                Generate New Quote
              </Button>
            </CardHeader>
            <CardContent>
              <QuoteList quotes={quotes} onSend={handleSendQuote} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Management</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <Label>Status</Label>
                <StatusUpdater currentStatus={ticket.status} onStatusChange={handleStatusChange} />
              </div>
              <div>
                <Label>Assigned Technician</Label>
                <TechnicianSelector onSelect={handleAssignTechnician} currentTechnicianId={ticket.assignedTo?._id} />
              </div>
              <div>
                <Label>Troubleshoot Fee</Label>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <p className='font-bold'>{formatCurrency(ticket.troubleshootFee.amount)}</p>
                    <Badge className='capitalize'>{ticket.troubleshootFee.status}</Badge>
                  </div>
                  {ticket.troubleshootFee.status === 'pending' && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='outline' size='sm'>
                          Actions <ChevronDown className='h-4 w-4 ml-2' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleUpdateFeeStatus('paid')}>Mark as Paid</DropdownMenuItem>
                        {canWaiveFees && (
                          <DropdownMenuItem onClick={() => handleUpdateFeeStatus('waived')}>
                            {' '}
                            Waive Fee
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>

              {ticket.status === 'repair_active' && (
                <Button variant='outline' className='w-full' onClick={() => setIsRequoteModalOpen(true)}>
                  <Flag className='h-4 w-4 mr-2' /> Flag for Re-Quote
                </Button>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>History</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusTimeline ticketId={ticket?._id} />
            </CardContent>
          </Card>
        </div>
      </div>

      {isPaymentModalOpen && (
        <PaymentApplicationModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          onConfirm={handleRecordPayment}
          invoice={ticket.finalInvoiceId}
          paymentMethods={paymentMethods}
        />
      )}

      <Modal isOpen={isRequoteModalOpen} onClose={() => setIsRequoteModalOpen(false)} title='Flag Ticket for Re-Quote'>
        <FlagRequoteForm
          onConfirm={handleFlagForRequote}
          onCancel={() => setIsRequoteModalOpen(false)}
          isSaving={isSaving}
        />
      </Modal>

      <ConfirmationModal
        isOpen={isConfirmQcOpen}
        onClose={() => setIsConfirmQcOpen(false)}
        onConfirm={handleConfirmSubmitForQc}
        title='Submit for Quality Control?'
        message='Are you sure you have completed all repair work? This will submit the ticket for final inspection.'
        confirmText='Yes, Submit for QC'
        isConfirming={isSaving}
      />

      <PrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        documentType='RepairTicket'
        documentId={ticket._id}
      />
    </div>
  );
};
export default RepairTicketDetailPage;
