// MatrixQcGrid.jsx
import { AlertCircle, Camera, Check, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Button, FileUploader, Input, Label } from 'ui-library';
import { tenantUploadService } from '../../services/api';

const COLORS = ['#10B981', '#EF4444', '#64748B']; // Emerald, red, slate

const MatrixQcGrid = ({ template, onSubmit, isSubmitting }) => {
  const [results, setResults] = useState(Object.fromEntries(template.items.map((i) => [i.task, null])));
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState([]);

  const summary = useMemo(() => {
    const passed = Object.values(results).filter((v) => v === true).length;
    const failed = Object.values(results).filter((v) => v === false).length;
    const todo = Object.values(results).filter((v) => v === null).length;
    return [
      { name: 'Pass', value: passed },
      { name: 'Fail', value: failed },
      { name: 'To Check', value: todo },
    ];
  }, [results]);

  const allDone = summary[2].value === 0;

  return (
    <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 bg-gray-900 text-gray-100 p-4'>
      {/* 1) Matrix Section */}
      <div className='lg:col-span-2 space-y-2 border border-gray-700 rounded-lg shadow-lg overflow-hidden bg-gray-800'>
        <div className='grid grid-cols-3 gap-1 bg-gray-700 p-3 font-medium'>
          <div className='col-span-2'>Task</div>
          <div className='text-center'>Status</div>
        </div>

        <div className='max-h-[60vh] overflow-y-auto'>
          {template.items.map((item, idx) => (
            <div
              key={idx}
              className={`
                grid grid-cols-3 items-center gap-1 p-3
                ${idx % 2 === 0 ? 'bg-gray-800' : 'bg-gray-900'}
                hover:bg-gray-700 transition-colors
              `}
            >
              <div className='col-span-2 text-gray-200'>{item.task}</div>
              <div className='flex items-center justify-center gap-2'>
                <Button
                  variant={results[item.task] === true ? 'success' : 'outline'}
                  size='icon'
                  className='h-9 w-9 rounded-full '
                  onClick={() => setResults((r) => ({ ...r, [item.task]: true }))}
                >
                  <Check size={18} />
                </Button>
                <Button
                  variant={results[item.task] === false ? 'destructive' : 'outline'}
                  size='icon'
                  className='h-9 w-9 rounded-full '
                  onClick={() => setResults((r) => ({ ...r, [item.task]: false }))}
                >
                  <X size={18} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2) Summary Panel */}
      <div className='flex flex-col space-y-6'>
        {/* Summary Card */}
        <div className='bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-5'>
          <h3 className='font-semibold text-gray-200 mb-4'>QC Summary</h3>

          <div className='h-52 w-full'>
            <ResponsiveContainer width='100%' height='100%'>
              <PieChart>
                <Pie data={summary} dataKey='value' nameKey='name' innerRadius={50} outerRadius={70} paddingAngle={2}>
                  {summary.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke='none' />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [value, 'Items']}
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    borderRadius: '8px',
                    border: '1px solid #374151',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.25)',
                    color: '#f9fafb',
                  }}
                />
                <Legend
                  layout='horizontal'
                  verticalAlign='bottom'
                  align='center'
                  iconSize={10}
                  iconType='circle'
                  formatter={(value) => <span className='text-xs text-gray-400'>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className='grid grid-cols-3 gap-2 mt-4'>
            <div className='bg-emerald-900/30 p-3 rounded-lg text-center border border-emerald-800/50'>
              <div className='text-emerald-400 font-bold text-xl'>{summary[0].value}</div>
              <div className='text-xs text-emerald-300'>Passed</div>
            </div>
            <div className='bg-red-900/30 p-3 rounded-lg text-center border border-red-800/50'>
              <div className='text-red-400 font-bold text-xl'>{summary[1].value}</div>
              <div className='text-xs text-red-300'>Failed</div>
            </div>
            <div className='bg-gray-700 p-3 rounded-lg text-center border border-gray-600'>
              <div className='text-gray-300 font-bold text-xl'>{summary[2].value}</div>
              <div className='text-xs text-gray-400'>Pending</div>
            </div>
          </div>
        </div>

        {/* Submit Card */}
        <div className='bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-5'>
          <Button
            disabled={!allDone || isSubmitting}
            className={`w-full h-12 text-base font-medium transition-all
              ${
                allDone
                  ? 'bg-gradient-to-r from-indigo-700 to-purple-700 hover:from-indigo-600 hover:to-purple-600'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }
            `}
            onClick={() => {
              const didFail = Object.values(results).some((val) => val === false);

              onSubmit({
                templateId: template._id,
                status: didFail ? 'fail' : 'pass',
                checklist: Object.entries(results).map(([task, passed]) => ({ task, passed })),
                notes,
                photos,
              });
            }}
          >
            {isSubmitting ? (
              <span className='flex items-center justify-center'>
                <svg
                  className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                >
                  <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                  ></path>
                </svg>
                Processing...
              </span>
            ) : allDone ? (
              'Submit QC Report'
            ) : (
              <span className='flex items-center justify-center'>
                <AlertCircle className='mr-2 text-gray-500' size={18} />
                Complete all checks
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* 3) Notes & Photos */}
      <div className='lg:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4'>
        <div className='space-y-3'>
          <Label className='font-medium text-gray-300'>Inspector Notes</Label>
          <Input
            as='textarea'
            rows={20}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className='block w-full rounded-lg border border-gray-700 bg-gray-800 text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500'
            placeholder='Add observations, comments, or recommendations...'
          />
        </div>

        <div className='space-y-3'>
          <Label className='font-medium text-gray-300 flex items-center gap-2'>
            <Camera size={18} className='text-gray-400' />
            <span>Supporting Photos</span>
          </Label>
          <FileUploader
            onUploadComplete={setPhotos}
            getSignatureFunc={tenantUploadService.getCloudinarySignature}
            multiple
            className='border-2 border-dashed border-gray-700 rounded-xl hover:border-indigo-500 transition-colors bg-gray-800'
            uploadArea={
              <div className='py-8 text-center'>
                <Camera className='mx-auto text-gray-500 mb-2' size={24} />
                <p className='text-sm text-gray-400'>Click or drag files to upload</p>
                <p className='text-xs text-gray-500 mt-1'>Supports JPG, PNG up to 10MB</p>
              </div>
            }
          />

          {photos.length > 0 && (
            <div className='mt-2 text-sm text-gray-400 flex items-center'>
              <Camera className='mr-1' size={16} />
              {photos.length} file{photos.length !== 1 ? 's' : ''} attached
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatrixQcGrid;
