import React from 'react';
import { Modal, Button } from 'ui-library';
import useAuth from '../../context/useAuth';
import { CheckCircle } from 'lucide-react';

const ChangeCalculatorModal = ({ isOpen, onClose, changeBreakdown, changeDue }) => {
  const { formatCurrency } = useAuth();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title='Change Calculation' size='md'>
      <div className='text-center px-4 pb-2'>
        {/* Header */}
        <p className='text-sm text-slate-400 mb-1'>Total Change Due to Customer</p>
        <p className='text-5xl font-bold text-green-500 mb-6'>{formatCurrency(changeDue)}</p>

        {/* Breakdown */}
        {changeBreakdown.length === 0 ? (
          <div className='py-8 text-center text-slate-400'>No denominations available for breakdown</div>
        ) : (
          <>
            <p className='text-sm text-slate-400 mb-3'>Breakdown by denomination</p>
            <div className='grid grid-cols-2 gap-3'>
              {changeBreakdown.map((item) => (
                <div key={item._id} className='bg-slate-800 rounded-lg p-3 text-center border border-slate-700'>
                  <div className='text-2xl font-bold'>{item.count}x</div>
                  <div className='text-sm text-slate-300'>{item.name}</div>
                  <div className='text-xs text-slate-400 mt-1'>{formatCurrency(item.value * item.count)}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Action */}
        <Button
          onClick={onClose}
          className='w-full mt-8 py-3 text-lg'
          variant='success'
          icon={<CheckCircle className='mr-2' />}
        >
          Confirm Change Given
        </Button>

        {/* Help Text */}
        <p className='text-xs text-slate-500 mt-4'>Verify physical count matches this breakdown</p>
      </div>
    </Modal>
  );
};

export default ChangeCalculatorModal;
