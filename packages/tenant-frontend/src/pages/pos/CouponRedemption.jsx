import React, { useState } from 'react';
import { Input, Button, Label } from 'ui-library';
import { tenantCouponService } from '../../services/api';
import { toast } from 'react-hot-toast';

const CouponRedemption = ({ cartTotal, onCouponApplied }) => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleApplyCoupon = async () => {
    if (!code) return;
    setIsLoading(true);
    try {
      const res = await tenantCouponService.validate(code, cartTotal);
      toast.success(`Discount of ${res.data.data.discountAmount} applied!`);
      onCouponApplied(res.data.data); // Pass discount info back to parent
      setCode('');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to apply coupon.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='space-y-2 border-t border-slate-700 pt-4 mt-4'>
      <Label>Have a Discount Code?</Label>
      <div className='flex gap-2'>
        <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder='Enter code...' />
        <Button onClick={handleApplyCoupon} disabled={isLoading || !code}>
          {isLoading ? 'Applying...' : 'Apply'}
        </Button>
      </div>
    </div>
  );
};
export default CouponRedemption;
