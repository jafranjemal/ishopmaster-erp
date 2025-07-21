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
