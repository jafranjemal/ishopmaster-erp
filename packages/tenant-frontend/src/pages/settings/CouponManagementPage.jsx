import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { tenantCouponService } from '../../services/api';
import {
  Button,
  Label,
  Modal,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Input,
} from 'ui-library';
import { PlusCircle, Ticket } from 'lucide-react';
import CouponBatchForm from '../../components/settings/coupons/CouponBatchForm';
import CouponBatchList from '../../components/settings/coupons/CouponBatchList';

const GenerateCodesForm = ({ onGenerate, isSaving }) => {
  const [count, setCount] = useState(1);
  return (
    <div className='space-y-4'>
      <Label>Number of unique codes to generate:</Label>
      <Input type='number' min='1' max='1000' value={count} onChange={(e) => setCount(Number(e.target.value))} />
      <div className='pt-4 flex justify-end'>
        <Button onClick={() => onGenerate({ count })} disabled={isSaving}>
          {isSaving ? 'Generating...' : 'Generate'}
        </Button>
      </div>
    </div>
  );
};

const CouponManagementPage = () => {
  const [batches, setBatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalState, setModalState] = useState({ isOpen: false, type: '', data: null });

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await tenantCouponService.getAllBatches();
      setBatches(res.data.data);
    } catch (error) {
      toast.error('Failed to load coupon campaigns.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async (formData) => {
    const apiCall = modalState.data
      ? tenantCouponService.updateBatch(modalState.data._id, formData)
      : tenantCouponService.createBatch(formData);
    try {
      await toast.promise(apiCall, { loading: 'Saving...', success: 'Campaign saved!', error: 'Save failed.' });
      fetchData();
      setModalState({ isOpen: false });
    } catch (err) {}
  };

  const handleGenerate = async (formData) => {
    try {
      await toast.promise(tenantCouponService.generateFromBatch(modalState.data._id, formData), {
        loading: 'Generating codes...',
        success: `${formData.count} coupons generated!`,
        error: 'Generation failed.',
      });
      setModalState({ isOpen: false });
    } catch (err) {}
  };

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-3xl font-bold'>Coupon Campaigns</h1>
        <Button onClick={() => setModalState({ isOpen: true, type: 'batch' })}>
          <PlusCircle className='mr-2 h-4 w-4' />
          New Campaign
        </Button>
      </div>
      <Card>
        <CardContent className='p-0'>
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <CouponBatchList
              batches={batches}
              onGenerate={(batch) => setModalState({ isOpen: true, type: 'generate', data: batch })}
              onEdit={(batch) => setModalState({ isOpen: true, type: 'batch', data: batch })}
            />
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false })}
        title={modalState.type === 'batch' ? (modalState.data ? 'Edit Campaign' : 'New Campaign') : 'Generate Coupons'}
      >
        {modalState.type === 'batch' && (
          <CouponBatchForm
            batchToEdit={modalState.data}
            onSave={handleSave}
            onCancel={() => setModalState({ isOpen: false })}
          />
        )}
        {modalState.type === 'generate' && <GenerateCodesForm onGenerate={handleGenerate} />}
      </Modal>
    </div>
  );
};
export default CouponManagementPage;
