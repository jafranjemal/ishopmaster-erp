import { ArrowLeft, FileText, Flag } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Link, useParams } from 'react-router-dom';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Label,
  Modal,
} from 'ui-library';
import FlagRequoteForm from '../../components/service/FlagRequoteForm';
import JobSheetEditor from '../../components/service/JobSheetEditor';
import LaborTimerWidget from '../../components/service/LaborTimerWidget';
import QcChecklistForm from '../../components/service/QcChecklistForm';
import QuoteList from '../../components/service/QuoteList';
import StatusUpdater from '../../components/service/StatusUpdater';
import TechnicianSelector from '../../components/service/TechnicianSelector';
import StatusTimeline from '../../components/service/TicketStatusTimeline';
import useAuth from '../../context/useAuth';
import { tenantRepairService } from '../../services/api';

const RepairTicketDetailPage = () => {
  const { id } = useParams();
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

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [ticketRes, quotesRes, timerRes] = await Promise.all([
        tenantRepairService.getTicketById(id),
        tenantRepairService.getQuotesForTicket(id),
        tenantRepairService.getActiveTimer(id),
      ]);
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
          setQcTemplate(res.data.data.defaultQcTemplateId);
        })
        .catch((err) => toast.error(err.response?.data?.error || 'Failed to load QC Checklist.'))
        .finally(() => setIsQcLoading(false));
    }
  }, [ticket, qcTemplate]);

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
    setTicket(updatedTicket);
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
      await toast.promise(tenantRepairService.startTimer(id), {
        loading: 'Starting timer...',
        success: 'Timer started!',
        error: 'Failed to start timer.',
      });
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
      setTicket(res.data.data); // Directly update ticket with response
    } catch (err) {
    } finally {
      setIsSaving(false);
    }
  };

  const totalHoursLogged = useMemo(() => {
    if (!ticket) return 0;
    return ticket.jobSheet
      .filter((item) => item.itemType === 'labor')
      .reduce((sum, item) => sum + (item.laborHours || 0), 0);
  }, [ticket]);

  const isJobSheetLocked = useMemo(() => {
    if (!ticket) return true;
    // The Job Sheet can only be edited during diagnosis or when a re-quote is needed.
    return !['diagnosing', 'on_hold_pending_re_quote'].includes(ticket.status);
  }, [ticket]);

  const isTimerActive = !!activeTimer;
  if (isLoading) return <p className='p-8 text-center'>Loading ticket details...</p>;
  if (!ticket) return <p className='p-8 text-center'>Ticket not found.</p>;
  const isTechnicianView = ticket.assignedTo?._id === user.employeeId;
  const canGenerateQuote =
    user.permissions.includes('service:quote:create') &&
    ['diagnosing', 'on_hold_pending_re_quote'].includes(ticket.status);
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
        <Button disabled={ticket.status !== 'pickup_pending'}>Create Invoice</Button>
      </div>
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 items-start'>
        <div className='lg:col-span-2 space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Customer & Asset Details</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                <strong>Customer:</strong> {ticket.customerId.name}
              </p>
              <p>
                <strong>Asset:</strong> {ticket.assets[0]?.deviceId?.name} (SN: {ticket.assets[0]?.serialNumber})
              </p>
              <p className='mt-2'>
                <strong>Complaint:</strong> {ticket.customerComplaint}
              </p>
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
                <div className='grid grid-cols-3 gap-2'>
                  {ticket.afterImages.map((img) => (
                    <img key={img.public_id} src={img.url} className='rounded-md' />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {ticket.status !== 'qc_pending' && (
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
                  <QcChecklistForm template={qcTemplate} onSubmit={handleSubmitQc} isSubmitting={isSubmittingQc} />
                )}
              </CardContent>
            </Card>
          )}
        </div>
        <div className='lg:col-span-1 space-y-6'>
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

          <LaborTimerWidget
            onStart={handleStartTimer}
            onStop={handleStopTimer}
            isTimerActive={isTimerActive}
            totalHoursLogged={totalHoursLogged}
            isSaving={isSaving}
            activeTimer={activeTimer}
          />
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
                <p className='font-bold'>
                  {formatCurrency(ticket.troubleshootFee.amount)} ({ticket.troubleshootFee.status})
                </p>
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
              <StatusTimeline ticket={ticket} />
            </CardContent>
          </Card>
        </div>
      </div>

      <Modal isOpen={isRequoteModalOpen} onClose={() => setIsRequoteModalOpen(false)} title='Flag Ticket for Re-Quote'>
        <FlagRequoteForm
          onConfirm={handleFlagForRequote}
          onCancel={() => setIsRequoteModalOpen(false)}
          isSaving={isSaving}
        />
      </Modal>
    </div>
  );
};
export default RepairTicketDetailPage;
