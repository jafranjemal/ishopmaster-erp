import { toast } from 'react-hot-toast';
import { Badge } from 'ui-library';

const PlaceholderToolbox = ({ variables = [], onInsert }) => {
  const handleInsert = (variable) => {
    const placeholder = `{{${variable}}}`;
    onInsert(placeholder);
    toast.success(`Copied ${placeholder} to clipboard!`);
    // Also copy to clipboard for convenience
    navigator.clipboard.writeText(placeholder);
  };

  return (
    <div className='p-3 bg-slate-800 rounded-md border border-slate-700'>
      <p className='text-sm font-semibold mb-2'>Available Placeholders</p>
      <p className='text-xs text-slate-400 mb-3'>Click to insert or copy a placeholder.</p>
      <div className='flex flex-wrap gap-2'>
        {variables.length === 0 ? (
          <p className='text-xs text-slate-500'>Select an event to see available placeholders.</p>
        ) : (
          variables.map((variable) => (
            <Badge
              key={variable}
              variant='secondary'
              className='cursor-pointer hover:bg-indigo-500 hover:text-white'
              onClick={() => handleInsert(variable)}
            >
              {variable}
            </Badge>
          ))
        )}
      </div>
    </div>
  );
};

export default PlaceholderToolbox;
