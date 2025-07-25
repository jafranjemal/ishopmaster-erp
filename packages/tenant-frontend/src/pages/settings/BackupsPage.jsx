import { Loader2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  Badge,
  Card,
  CardContent,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'ui-library';
import { formatDate } from '../../lib/formatters';
import { tenantBackupService } from '../../services/api'; // Use the new service

const BackupsPage = () => {
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = { page: currentPage, limit: 15 };
      const res = await tenantBackupService.getBackupHistory(params);
      setRecords(res.data.data);
      setPagination(res.data.pagination);
    } catch (error) {
      toast.error('Failed to load backup history.');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatBytes = (bytes, decimals = 2) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold'>Backup History</h1>
        <p className='mt-1 text-slate-400'>A read-only log of your account's automated daily backups.</p>
      </div>
      <Card>
        <CardContent className='p-0'>
          {isLoading ? (
            <div className='p-8 text-center flex items-center justify-center h-64'>
              <Loader2 className='h-8 w-8 animate-spin' />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Backup Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Trigger</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((rec) => (
                  <TableRow key={rec._id}>
                    <TableCell className='font-medium text-white'>{formatDate(rec.createdAt)}</TableCell>
                    <TableCell>
                      <Badge variant={rec.status === 'success' ? 'success' : 'destructive'}>{rec.status}</Badge>
                    </TableCell>
                    <TableCell className='font-mono'>{formatBytes(rec.fileSize)}</TableCell>
                    <TableCell className='capitalize'>{rec.triggeredBy.replace('_', ' ')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {pagination && pagination.totalPages > 1 && (
            <Pagination paginationData={pagination} onPageChange={setCurrentPage} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BackupsPage;
