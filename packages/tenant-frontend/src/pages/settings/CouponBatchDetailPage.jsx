import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { tenantCouponService } from '../../services/api';
import * as Tabs from '@radix-ui/react-tabs';
import { Card, CardContent, Pagination } from 'ui-library';
import CouponList from '../../components/settings/coupons/CouponList';
import { ArrowLeft } from 'lucide-react';

const CouponBatchDetailPage = () => {
  const { batchId } = useParams();
  const [coupons, setCoupons] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [activeTab, setActiveTab] = useState('active');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await tenantCouponService.getCouponsForBatch(batchId, {
        page: currentPage,
        limit: 20,
        status: activeTab,
      });
      setCoupons(res.data.data);
      setPagination(res.data.pagination);
    } catch (error) {
      toast.error('Failed to load coupons.');
    } finally {
      setIsLoading(false);
    }
  }, [batchId, currentPage, activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className='space-y-6'>
      {/* Back Link */}
      <Link
        to='/settings/coupons'
        className='inline-flex items-center text-sm text-indigo-500 hover:underline transition'
      >
        <ArrowLeft className='h-4 w-4 mr-1' />
        Back to All Campaigns
      </Link>

      {/* Title */}
      <h1 className='text-3xl font-bold'>Coupon Audit Trail</h1>

      {/* Tabs */}
      <Tabs.Root
        value={activeTab}
        onValueChange={(value) => {
          setCurrentPage(1); // Reset page on tab switch
          setActiveTab(value);
        }}
      >
        <Tabs.List className='sticky top-0 z-10 flex border-b  bg-white/80  border-slate-700 backdrop-blur-sm p-1 rounded-md'>
          {['active', 'redeemed', 'expired'].map((status) => (
            <Tabs.Trigger
              key={status}
              value={status}
              className={`ui-tabs-trigger px-4 py-2 rounded font-medium capitalize transition 
                ${activeTab === status ? 'bg-indigo-500 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}
              `}
            >
              {status}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        {/* Content */}
        <div className='pt-4'>
          <Card>
            <CardContent className='p-0'>
              {isLoading ? (
                <div className='p-8 text-center text-slate-500 animate-pulse'>
                  <p>Fetching coupons...</p>
                </div>
              ) : coupons.length === 0 ? (
                <div className='p-8 text-center text-slate-500'>
                  <p>No {activeTab} coupons found for this batch.</p>
                </div>
              ) : (
                <>
                  <CouponList coupons={coupons} />
                  {pagination && (
                    <div className='px-4 py-6 border-t border-slate-200'>
                      <Pagination paginationData={pagination} onPageChange={setCurrentPage} />
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </Tabs.Root>
    </div>
  );
};

export default CouponBatchDetailPage;
