import { FilePenLine, PlusCircle, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import {
  Badge,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'ui-library';
import ConfirmationModal from '../../components/shared/ConfirmationModal';
import { tenantRepairService } from '../../services/api';

const RepairTicketsPage = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await tenantRepairService.getAllTickets();
      setTickets(res.data.data);
    } catch (error) {
      toast.error('Failed to load repair tickets.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEdit = (ticketId) => {
    // Navigate to the intake page in "edit mode"
    navigate(`/service/tickets/${ticketId}/edit`);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setIsSaving(true);
    try {
      await toast.promise(tenantRepairService.deleteTicket(deleteConfirm._id), {
        loading: `Deleting ticket #${deleteConfirm.ticketNumber}...`,
        success: 'Ticket deleted successfully!',
        error: (err) => err.response?.data?.error || 'Failed to delete ticket.',
      });
      fetchData(); // Refresh the list
      setDeleteConfirm(null);
    } catch (err) {
      /* Handled by toast */
    } finally {
      setIsSaving(false);
    }
  };

  const safeToDeleteStatuses = ['intake', 'cancelled'];

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-3xl font-bold'>Service & Repair Tickets</h1>
        <Button asChild>
          <Link to='/service/tickets/new'>
            <PlusCircle className='mr-2 h-4 w-4' />
            New Repair Ticket
          </Link>
        </Button>
      </div>
      <Card>
        <CardContent className='p-0'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead className='text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className='text-center h-24'>
                    Loading tickets...
                  </TableCell>
                </TableRow>
              ) : (
                tickets.map((t) => (
                  <TableRow key={t._id}>
                    <TableCell>
                      <Link to={`/service/tickets/${t._id}`} className='font-mono hover:underline'>
                        {t.ticketNumber}
                      </Link>
                    </TableCell>
                    <TableCell>{t.customerId?.name}</TableCell>
                    <TableCell>
                      <Badge className='capitalize'>{t.status.replace('_', ' ')}</Badge>
                    </TableCell>
                    <TableCell>
                      {t.assignedTo ? `${t.assignedTo.firstName} ${t.assignedTo.lastName}` : 'Unassigned'}
                    </TableCell>
                    <TableCell className='text-right space-x-1'>
                      <Button variant='ghost' size='icon' onClick={() => handleEdit(t._id)}>
                        <FilePenLine className='h-4 w-4' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => setDeleteConfirm(t)}
                        disabled={!safeToDeleteStatuses.includes(t.status)}
                      >
                        <Trash2 className='h-4 w-4 text-red-500' />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ConfirmationModal
        isOpen={Boolean(deleteConfirm)}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title='Confirm Deletion'
        message={`Are you sure you want to permanently delete ticket #${deleteConfirm?.ticketNumber}? This action cannot be undone.`}
        confirmText='Delete Ticket'
        isConfirming={isSaving}
      />
    </div>
  );
};
export default RepairTicketsPage;
