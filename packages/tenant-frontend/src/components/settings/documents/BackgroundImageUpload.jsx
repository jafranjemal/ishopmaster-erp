import { ImagePlus } from 'lucide-react';
import { useState } from 'react';

const BackgroundImageUpload = ({
  onUpload,
  printWithBackground,
  setPrintWithBackground,
  backgroundConfig,
  setBackgroundConfig,
}) => {
  const [preview, setPreview] = useState(null);

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target.result);

      // Create image object for Konva
      const img = new window.Image();
      img.src = event.target.result;
      img.onload = () => {
        onUpload(img);
        setBackgroundConfig((prev) => ({
          ...prev,
          image: event.target.result,
        }));
      };
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className='bg-slate-800 p-4 rounded-lg'>
      <h3 className='font-bold mb-2'>Background Image</h3>

      <label className='flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:bg-slate-700'>
        <div className='flex flex-col items-center justify-center pt-5 pb-6'>
          <ImagePlus className='w-8 h-8 mb-3 text-slate-400' />
          <p className='mb-2 text-sm text-slate-400'>
            <span className='font-semibold'>Click to upload</span> or drag and drop
          </p>
          <p className='text-xs text-slate-500'>PNG, JPG (MAX. 5MB)</p>
        </div>
        <input type='file' className='hidden' accept='image/*' onChange={handleChange} />
      </label>

      {preview && (
        <div className='mt-4'>
          <p className='text-sm mb-2'>Preview:</p>
          <img src={preview} alt='Background preview' className='max-w-full h-auto border border-slate-600 rounded' />
        </div>
      )}

      <div className='mt-4 space-y-3'>
        <div className='flex items-center gap-3'>
          <input
            type='checkbox'
            id='includeInPrint'
            checked={printWithBackground}
            onChange={(e) => setPrintWithBackground(e.target.checked)}
          />
          <label htmlFor='includeInPrint' className='text-sm'>
            Include background in print
          </label>
        </div>

        <div>
          <label className='block text-sm mb-1'>Opacity: {backgroundConfig.opacity}</label>
          <input
            type='range'
            min='0'
            max='1'
            step='0.1'
            value={backgroundConfig.opacity}
            onChange={(e) =>
              setBackgroundConfig((prev) => ({
                ...prev,
                opacity: parseFloat(e.target.value),
              }))
            }
            className='w-full'
          />
        </div>
      </div>
    </div>
  );
};

export default BackgroundImageUpload;
