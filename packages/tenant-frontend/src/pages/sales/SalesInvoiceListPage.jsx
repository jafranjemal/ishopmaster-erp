import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Card, CardContent, Pagination } from 'ui-library';
import InvoiceList from '../../components/sales/InvoiceList';

import { tenantSalesService } from '../../services/api';
// Assume a FilterBar component exists for handling search, dropdowns, etc.
// import FilterBar from '../../components/shared/FilterBar';

const SalesInvoiceListPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [filters, setFilters] = useState({ page: 1, limit: 20 });
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await tenantSalesService.getAllInvoices(filters);
      setInvoices(res.data.data);
      setPagination(res.data.pagination);
    } catch (error) {
      toast.error('Failed to load invoices.');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-3xl font-bold'>Sales Invoices</h1>
        {/* Add "New Invoice" button if direct creation is needed */}
      </div>

      {/* <FilterBar onApplyFilters={(newFilters) => setFilters({ ...newFilters, page: 1 })} /> */}

      <Card>
        <CardContent className='p-0'>
          {isLoading ? <p className='p-8 text-center'>Loading invoices...</p> : <InvoiceList invoices={invoices} />}
        </CardContent>
      </Card>
      {pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default SalesInvoiceListPage;
