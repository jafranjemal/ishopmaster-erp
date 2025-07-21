import { PlusCircle } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
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
import { tenantRepairService } from '../../services/api';

const RepairTicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((t) => (
                <TableRow key={t._id}>
                  <TableCell>
                    <Link to={`/service/tickets/${t._id}`} className='font-mono hover:underline'>
                      {t.ticketNumber}
                    </Link>
                  </TableCell>
                  <TableCell>{t.customerId?.name}</TableCell>
                  <TableCell>
                    <Badge>{t.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {t.assignedTo ? `${t.assignedTo.firstName} ${t.assignedTo.lastName}` : 'Unassigned'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
export default RepairTicketsPage;
