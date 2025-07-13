import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { tenantClosingService } from '../../services/api';
import {
  Button,
  Modal,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
  Input,
  Label,
} from 'ui-library';
import { PlusCircle, CalendarPlus } from 'lucide-react';
import useAuth from '../../context/useAuth';

const GenerateYearForm = ({ onGenerate, isSaving }) => {
  const [year, setYear] = useState(new Date().getFullYear() + 1);
  return (
    <div className='space-y-4'>
      <Label>Generate all 12 monthly periods for year:</Label>
      <Input type='number' value={year} onChange={(e) => setYear(Number(e.target.value))} />
      <div className='pt-4 flex justify-end'>
        <Button onClick={() => onGenerate(year)} disabled={isSaving}>
          {isSaving ? 'Generating...' : 'Generate'}
        </Button>
      </div>
    </div>
  );
};

const FinancialPeriodsPage = () => {
  const [periods, setPeriods] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { formatDate } = useAuth();

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await tenantClosingService.getAllPeriods();
      setPeriods(res.data.data);
    } catch (error) {
      toast.error('Failed to load financial periods.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleGenerateYear = async (year) => {
    setIsSaving(true);
    try {
      await toast.promise(tenantClosingService.generateYearlyPeriods(year), {
        loading: `Generating periods for ${year}...`,
        success: 'Financial year generated!',
        error: (err) => err.response?.data?.error || 'Generation failed.',
      });
      fetchData();
      setIsModalOpen(false);
    } catch (err) {
      /* Handled by toast */
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-3xl font-bold'>Financial Periods</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <CalendarPlus className='mr-2 h-4 w-4' /> Generate Financial Year
        </Button>
      </div>
      <Card>
        <CardContent className='p-0'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period Name</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {periods.map((p) => (
                <TableRow key={p._id}>
                  <TableCell className='font-medium'>{p.name}</TableCell>
                  <TableCell>{formatDate(p.startDate)}</TableCell>
                  <TableCell>{formatDate(p.endDate)}</TableCell>
                  <TableCell>
                    <Badge variant={p.status === 'Open' ? 'success' : 'secondary'}>{p.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title='Generate Financial Year'>
        <GenerateYearForm onGenerate={handleGenerateYear} isSaving={isSaving} />
      </Modal>
    </div>
  );
};
export default FinancialPeriodsPage;
