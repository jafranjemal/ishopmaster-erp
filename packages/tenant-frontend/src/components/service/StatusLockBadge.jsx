// StatusLockBadge.jsx
import { Lock } from 'lucide-react';

const STATUS_VARIANTS = {
  // status: [textColor, bgColor]
  intake: ['text-blue-300', 'bg-blue-900/30'],
  diagnosing: ['text-indigo-300', 'bg-indigo-900/30'],
  quote_pending: ['text-yellow-300', 'bg-yellow-900/30'],
  approval_pending: ['text-orange-300', 'bg-orange-900/30'],
  repair_active: ['text-green-300', 'bg-green-900/30'],
  qc_pending: ['text-purple-300', 'bg-purple-900/30'],
  pickup_pending: ['text-teal-300', 'bg-teal-900/30'],
  closed: ['text-slate-300', 'bg-slate-900/30'],
  cancelled: ['text-red-300', 'bg-red-900/30'],
  default: ['text-yellow-300', 'bg-yellow-900/30'],
};

export const StatusLockBadge = ({ status }) => {
  const key = status in STATUS_VARIANTS ? status : 'default';
  const [textColor, bgColor] = STATUS_VARIANTS[key];

  return (
    <div
      className={`
        mb-4
        flex flex-col items-center
        text-center
        text-sm font-medium ${textColor} ${bgColor}
        px-4 py-2 rounded-md
      `}
    >
      <Lock className='w-5 h-5 mb-1' />
      <span className=''>Timer locked</span>
      <span className='uppercase'>(status: {status.replace(/_/g, ' ')})</span>
    </div>
  );
};
