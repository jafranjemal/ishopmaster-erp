// File: HotkeyQcList.jsx
import { useEffect, useRef, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Button, FileUploader, Input, Label } from 'ui-library';
import { tenantUploadService } from '../../services/api';

const HotkeyQcList = ({ template, onSubmit, isSubmitting }) => {
  const [results, setResults] = useState({});
  const [currentIndex, setCurrent] = useState(0);
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState([]);
  const itemKeys = template.items.map((i) => i.task);
  const activeTask = itemKeys[currentIndex];
  const inputRef = useRef();

  useEffect(() => {
    setResults(Object.fromEntries(itemKeys.map((k) => [k, null])));
  }, [template]);

  // Hotkeys
  useHotkeys('p', () => mark(true), [currentIndex, results]);
  useHotkeys('f', () => mark(false), [currentIndex, results]);
  useHotkeys('enter', () => navigate(1), [currentIndex, results]);
  useHotkeys('up', () => navigate(-1), [currentIndex]);
  useHotkeys('down', () => navigate(1), [currentIndex]);

  const mark = (val) => {
    setResults((r) => ({ ...r, [activeTask]: val }));
  };
  const navigate = (dir) => {
    const next = currentIndex + dir;
    if (next >= 0 && next < itemKeys.length) setCurrent(next);
  };

  const allChecked = Object.values(results).every((v) => v !== null);

  return (
    <div className='space-y-6'>
      <div className='p-6 bg-slate-800 rounded-lg'>
        <p className='text-sm text-slate-400 mb-1'>
          Use <strong>P</strong>=Pass, <strong>F</strong>=Fail, <strong>Enter</strong>=Next
        </p>
        {template.items.map((item, idx) => (
          <div
            key={idx}
            className={`
            p-3 rounded mb-1 flex justify-between items-center
            ${idx === currentIndex ? 'bg-indigo-900' : 'bg-slate-900'}
          `}
          >
            <span>{item.task}</span>
            <span className='flex items-center gap-2'>
              {results[item.task] === true && <span className='text-green-400'>✔️</span>}
              {results[item.task] === false && <span className='text-red-400'>❌</span>}
            </span>
          </div>
        ))}
      </div>

      <div className='space-y-4'>
        <Label>Inspector Notes</Label>
        <Input ref={inputRef} as='textarea' rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
        <Label>Photos</Label>
        <FileUploader
          onUploadComplete={setPhotos}
          getSignatureFunc={tenantUploadService.getCloudinarySignature}
          multiple
        />
      </div>

      <div className='flex justify-end'>
        <Button
          disabled={!allChecked || isSubmitting}
          onClick={() =>
            onSubmit({
              templateId: template._id,
              checklist: Object.entries(results).map(([t, p]) => ({ task: t, passed: p })),
              notes,
              photos,
            })
          }
        >
          {isSubmitting ? 'Submitting…' : 'Submit QC'}
        </Button>
      </div>
    </div>
  );
};

export default HotkeyQcList;
