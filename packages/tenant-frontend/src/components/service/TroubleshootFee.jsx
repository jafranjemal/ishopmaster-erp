import { Label, Switch } from 'ui-library';
import useAuth from '../../context/useAuth';

const TroubleshootFee = ({ fee, setFee }) => {
  const { formatCurrency } = useAuth();
  // In a real app, this default amount would come from tenant settings
  const defaultAmount = 500;

  const handleWaiver = (isWaived) => {
    setFee((prev) => ({
      ...prev,
      status: isWaived ? 'waived' : 'pending',
      amount: isWaived ? 0 : defaultAmount,
    }));
  };

  return (
    <div className='p-4 bg-indigo-900/50 rounded-lg flex items-center justify-between'>
      <div>
        <p className='font-bold text-lg'>Mandatory Troubleshoot Fee</p>
        <p className='text-3xl font-bold'>{formatCurrency(fee.amount)}</p>
      </div>
      <div className='flex items-center space-x-2'>
        <Label htmlFor='waive-fee'>Waive Fee?</Label>
        <Switch id='waive-fee' checked={fee.status === 'waived'} onCheckedChange={handleWaiver} />
      </div>
    </div>
  );
};
export default TroubleshootFee;
