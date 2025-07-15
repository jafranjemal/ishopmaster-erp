import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { tenantProductService } from '../../services/api';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
  Pagination,
  FilterBar,
} from 'ui-library';
import useAuth from '../../context/useAuth';

const InventoryLedgerPage = () => {
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const { formatDate } = useAuth();

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = { page: currentPage, limit: 20, ...filters };
      const res = await tenantProductService.getLedgerHistory(params);
      setRecords(res.data.data);
      setPagination(res.data.pagination);
    } catch (error) {
      toast.error('Failed to load inventory ledger.');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className='space-y-6'>
      <h1 className='text-3xl font-bold'>Inventory Ledger</h1>
      <p className='text-slate-400'>A complete audit trail of every stock movement in the system.</p>
      <FilterBar onApplyFilters={setFilters}>{/* Add filters for Product, Branch, Date Range here */}</FilterBar>
      <Card>
        <CardContent className='p-0'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Change</TableHead>
                <TableHead>User</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((rec) => (
                <TableRow key={rec._id}>
                  <TableCell>{formatDate(rec.createdAt)}</TableCell>
                  <TableCell>{rec.productVariantId?.variantName}</TableCell>
                  <TableCell>{rec.branchId?.name}</TableCell>
                  <TableCell>
                    <Badge variant='secondary'>{rec.type.replace('_', ' ')}</Badge>
                  </TableCell>
                  <TableCell className={rec.quantityChange > 0 ? 'text-green-400' : 'text-red-400'}>
                    {rec.quantityChange}
                  </TableCell>
                  <TableCell>{rec.userId?.name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {pagination && <Pagination paginationData={pagination} onPageChange={setCurrentPage} />}
        </CardContent>
      </Card>
    </div>
  );
};
export default InventoryLedgerPage;
