import React, { useState } from 'react';
import { Input, Button, Label } from 'ui-library';

import { toast } from 'react-hot-toast';
import { Ticket, LoaderCircle } from 'lucide-react';
import { tenantCouponService } from '../../../services/api';

/**
 * The definitive, self-contained component for handling coupon code validation and redemption.
 * It manages its own state and communicates the result back to its parent.
 *
 * @param {object} props
 * @param {number} props.cartTotal - The total amount of the cart before any coupon discount.
 * @param {Function} props.onCouponApplied - The callback function to pass the discount details to the parent.
 * @param {boolean} props.disabled - Whether the component should be disabled (e.g., after a coupon is already applied).
 */
const CouponRedemption = ({ cartTotal, onCouponApplied, disabled = false }) => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleApplyCoupon = async () => {
    if (!code) return;
    setIsLoading(true);
    try {
      // Call the secure backend endpoint to validate and lock the coupon
      const res = await tenantCouponService.validate(code, cartTotal);

      const { discountAmount, couponId } = res.data.data;
      toast.success(`Discount of ${discountAmount} applied!`);

      // Pass the result up to the parent PaymentModal
      onCouponApplied({ discountAmount, couponId });

      setCode(''); // Clear the input after successful application
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to apply coupon.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='space-y-2 border-t border-slate-700 pt-4 mt-4'>
      <Label htmlFor='coupon-code'>Have a Discount Code?</Label>
      <div className='flex gap-2'>
        <div className='relative flex-grow'>
          <Ticket className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400' />
          <Input
            id='coupon-code'
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder='Enter code...'
            className='pl-9'
            disabled={disabled || isLoading}
          />
        </div>
        <Button type='button' onClick={handleApplyCoupon} disabled={isLoading || !code || disabled}>
          {isLoading ? <LoaderCircle className='h-4 w-4 animate-spin' /> : 'Apply'}
        </Button>
      </div>
      {disabled && <p className='text-xs text-green-400'>A coupon has already been applied to this sale.</p>}
    </div>
  );
};

export default CouponRedemption;
