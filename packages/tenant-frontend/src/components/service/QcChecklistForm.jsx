import { Check, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button, FileUploader, Input, Label } from 'ui-library';
import { tenantUploadService } from '../../services/api';

const QcChecklistForm = ({ template, onSubmit, isSubmitting }) => {
  const [results, setResults] = useState({});
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    // Initialize results state when template loads
    const initialResults = {};
    template.items.forEach((item) => {
      initialResults[item.task] = null; // null, true (pass), or false (fail)
    });
    setResults(initialResults);
  }, [template]);

  const handleResultChange = (task, passed) => {
    setResults((prev) => ({ ...prev, [task]: passed }));
  };

  const allTasksChecked = Object.values(results).every((val) => val !== null);
  const didFail = Object.values(results).some((val) => val === false);

  const handleSubmit = () => {
    const submissionData = {
      templateId: template._id,
      status: didFail ? 'fail' : 'pass',
      checklist: Object.entries(results).map(([task, passed]) => ({ task, passed })),
      notes,
      photos,
    };
    onSubmit(submissionData);
  };
  const [step, setStep] = useState(0);

  const current = template.items[step];
  const maxStep = template.items.length;

  const handleNext = () => setStep((s) => Math.min(s + 1, maxStep));
  const handlePrev = () => setStep((s) => Math.max(s - 1, 0));
  const allChecked = Object.values(results).every((v) => v !== null);

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <p className='font-semibold'>{`${step + 1} / ${maxStep}`}</p>
        <div className='flex-1 h-1 mx-4 bg-slate-700 rounded-full overflow-hidden'>
          <div className='h-full bg-indigo-500' style={{ width: `${((step + 1) / maxStep) * 100}%` }} />
        </div>
      </div>

      <div className='p-6 bg-slate-800 rounded-lg space-y-4'>
        <h3 className='text-lg font-medium'>{current.task}</h3>
        <div className='flex gap-4'>
          <Button
            variant={results[current.task] === false ? 'destructive' : 'outline'}
            onClick={() => setResults((r) => ({ ...r, [current.task]: false }))}
          >
            <X className='h-5 w-5 mr-1' /> Fail
          </Button>
          <Button
            variant={results[current.task] === true ? 'success' : 'outline'}
            onClick={() => setResults((r) => ({ ...r, [current.task]: true }))}
          >
            <Check className='h-5 w-5 mr-1' /> Pass
          </Button>
        </div>
      </div>

      <div className='flex justify-between'>
        <Button onClick={handlePrev} disabled={step === 0}>
          Back
        </Button>
        {step < maxStep - 1 ? (
          <Button onClick={handleNext} disabled={results[current.task] == null}>
            Next
          </Button>
        ) : (
          <Button
            onClick={() =>
              onSubmit({
                templateId: template._id,
                checklist: Object.entries(results).map(([task, passed]) => ({ task, passed })),
                notes,
                photos,
              })
            }
            disabled={!allChecked || isSubmitting}
          >
            {isSubmitting ? 'Submitting…' : 'Submit All'}
          </Button>
        )}
      </div>

      {step === maxStep - 1 && (
        <div className='mt-8 space-y-4'>
          <Label>Inspector Notes</Label>
          <Input as='textarea' rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} />

          <Label>Attach Photos</Label>
          <FileUploader
            onUploadComplete={setPhotos}
            getSignatureFunc={tenantUploadService.getCloudinarySignature}
            multiple
          />
        </div>
      )}
    </div>
  );
  return (
    <>
      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
        {template.items.map((item, idx) => {
          const status = results[item.task];
          return (
            <div
              key={idx}
              className={`
                p-4 rounded-lg border
                ${status === true ? 'border-green-400 bg-green-900/20' : ''}
                ${status === false ? 'border-red-400   bg-red-900/20' : 'border-slate-700 bg-slate-800'}
                transition
                hover:scale-105
                cursor-pointer
              `}
            >
              <p className='mb-2 font-medium'>{item.task}</p>
              <div className='flex justify-between'>
                <Check
                  onClick={() => setResults((r) => ({ ...r, [item.task]: true }))}
                  className={`h-5 w-5 cursor-pointer ${status === true ? 'text-green-400' : 'text-slate-500 hover:text-green-300'}`}
                />
                <X
                  onClick={() => setResults((r) => ({ ...r, [item.task]: false }))}
                  className={`h-5 w-5 cursor-pointer ${status === false ? 'text-red-400' : 'text-slate-500 hover:text-red-300'}`}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className='mt-6 space-y-4'>
        <Label>Inspector Notes</Label>
        <Input as='textarea' rows={4} />

        <Label>Attach Photos</Label>
        <FileUploader
          onUploadComplete={setPhotos}
          getSignatureFunc={tenantUploadService.getCloudinarySignature}
          multiple
        />
      </div>

      <div className='mt-6 flex justify-end'>
        <Button disabled={!allChecked || isSubmitting}>{isSubmitting ? 'Submitting…' : 'Submit Results'}</Button>
      </div>
    </>
  );

  return (
    <div className='space-y-6'>
      {template.items.map((item, index) => (
        <div key={index} className='p-3 bg-slate-800 rounded-md'>
          <div className='flex items-center justify-between'>
            <p className='font-medium'>{item.task}</p>
            <div className='flex items-center gap-2'>
              <Button
                size='sm'
                variant={results[item.task] === false ? 'destructive' : 'outline'}
                onClick={() => handleResultChange(item.task, false)}
              >
                <X className='h-4 w-4 mr-2' />
                Fail
              </Button>
              <Button
                size='sm'
                variant={results[item.task] === true ? 'success' : 'outline'}
                onClick={() => handleResultChange(item.task, true)}
              >
                <Check className='h-4 w-4 mr-2' />
                Pass
              </Button>
            </div>
          </div>
        </div>
      ))}
      <div className='border-t border-slate-700 pt-4 space-y-4'>
        <div>
          <Label>Inspector Notes</Label>
          <Input
            as={'textarea'}
            rows={5}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder='Add any relevant notes about the QC check...'
          />
        </div>
        <div>
          <Label>Attach Photos (if failed)</Label>
          <FileUploader
            onUploadComplete={setPhotos}
            getSignatureFunc={tenantUploadService.getCloudinarySignature}
            multiple={true}
          />
        </div>
      </div>
      <div className='pt-4 flex justify-end'>
        <Button onClick={handleSubmit} disabled={!allTasksChecked || isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit QC Results'}
        </Button>
      </div>
    </div>
  );
};

export default QcChecklistForm;
