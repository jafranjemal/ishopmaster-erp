import { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from 'ui-library';

const SignaturePad = ({ onSave }) => {
  const sigPadRef = useRef(null);

  const clear = () => sigPadRef.current.clear();
  const save = () => {
    if (sigPadRef.current.isEmpty()) {
      alert('Please provide a signature first.');
    } else {
      const dataUrl = sigPadRef.current.toDataURL();
      onSave(dataUrl);
    }
  };

  return (
    <div>
      <div className='border border-slate-600 rounded-md'>
        <SignatureCanvas ref={sigPadRef} penColor='white' canvasProps={{ className: 'w-full h-48' }} />
      </div>
      <div className='flex justify-end gap-2 mt-2'>
        <Button variant='outline' size='sm' onClick={clear}>
          Clear
        </Button>
        <Button size='sm' onClick={save}>
          Confirm Signature
        </Button>
      </div>
    </div>
  );
};
export default SignaturePad;
