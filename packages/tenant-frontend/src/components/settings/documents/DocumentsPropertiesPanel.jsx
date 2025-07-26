import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowDownToLine,
  ArrowUpToLine,
  Bold,
  Italic,
  StretchVertical,
  Underline,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from 'ui-library';
import DocumentsPlaceholderToolbox from './DocumentsPlaceholderToolbox';

const DocumentsPropertiesPanel = ({ element, onUpdate }) => {
  const [localElement, setLocalElement] = useState(element || {});
  const [showPlaceholders, setShowPlaceholders] = useState(false);

  useEffect(() => {
    setLocalElement(element || {});
  }, [element]);

  if (!element) {
    return (
      <div className='bg-slate-800 p-4 rounded-lg h-full flex items-center justify-center'>
        <div className='text-center text-slate-400'>
          <div className='bg-slate-700 p-4 rounded-full inline-block mb-2'>
            <X className='h-8 w-8' />
          </div>
          <p>No element selected</p>
          <p className='text-xs mt-1'>Select an element to edit its properties</p>
        </div>
      </div>
    );
  }

  const handleChange = (field, value) => {
    const updated = { ...localElement, [field]: value };
    setLocalElement(updated);
    onUpdate && onUpdate(updated);
  };

  const handleStyleChange = (field, value) => {
    const updated = {
      ...localElement,
      style: { ...localElement.style, [field]: value },
    };
    setLocalElement(updated);
    onUpdate && onUpdate(updated);
  };

  const handleInsertPlaceholder = (placeholder) => {
    const updated = {
      ...localElement,
      content: {
        ...localElement.content,
        template: (localElement.content?.template || '') + placeholder,
      },
    };
    setLocalElement(updated);
    onUpdate && onUpdate(updated);
  };

  return (
    <div className='bg-slate-800 p-4 rounded-lg h-full overflow-y-auto'>
      <h3 className='font-bold mb-4 border-b border-slate-700 pb-2'>
        {element.type === 'text'
          ? 'Text'
          : element.type === 'image'
            ? 'Image'
            : element.type === 'line'
              ? 'Line'
              : element.type === 'table'
                ? 'Table'
                : 'Element'}{' '}
        Properties
      </h3>

      <div className='space-y-4'>
        {/* Position and Size */}
        <div>
          <h4 className='text-sm font-medium mb-2'>Position & Size</h4>
          <div className='grid grid-cols-2 gap-2'>
            <div>
              <label className='text-xs block'>X Position</label>
              <input
                type='number'
                className='w-full bg-slate-700 border border-slate-600 rounded p-1 text-sm'
                value={localElement.position?.x || 0}
                onChange={(e) =>
                  handleChange('position', {
                    ...localElement.position,
                    x: parseInt(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <label className='text-xs block'>Y Position</label>
              <input
                type='number'
                className='w-full bg-slate-700 border border-slate-600 rounded p-1 text-sm'
                value={localElement.position?.y || 0}
                onChange={(e) =>
                  handleChange('position', {
                    ...localElement.position,
                    y: parseInt(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <label className='text-xs block'>Width</label>
              <input
                type='number'
                className='w-full bg-slate-700 border border-slate-600 rounded p-1 text-sm'
                value={localElement.dimensions?.width || 0}
                onChange={(e) =>
                  handleChange('dimensions', {
                    ...localElement.dimensions,
                    width: parseInt(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <label className='text-xs block'>Height</label>
              <input
                type='number'
                className='w-full bg-slate-700 border border-slate-600 rounded p-1 text-sm'
                value={localElement.dimensions?.height || 0}
                onChange={(e) =>
                  handleChange('dimensions', {
                    ...localElement.dimensions,
                    height: parseInt(e.target.value),
                  })
                }
              />
            </div>
          </div>
        </div>

        {/* Text Content */}
        {element.type === 'text' && (
          <div>
            <div className='flex justify-between items-center mb-2'>
              <h4 className='text-sm font-medium'>Content</h4>
              <Button variant='outline' size='sm' onClick={() => setShowPlaceholders(!showPlaceholders)}>
                {showPlaceholders ? 'Hide Placeholders' : 'Show Placeholders'}
              </Button>
            </div>

            {showPlaceholders && <DocumentsPlaceholderToolbox onInsert={handleInsertPlaceholder} className='mb-2' />}

            <textarea
              className='w-full bg-slate-700 border border-slate-600 rounded p-2 text-sm h-24'
              value={localElement.content?.staticText || localElement.content?.template || ''}
              onChange={(e) =>
                handleChange('content', {
                  ...localElement.content,
                  staticText: e.target.value,
                })
              }
              placeholder='Enter text or use {{placeholders}}'
            />
          </div>
        )}

        {/* Text Styling */}
        {(element.type === 'text' || element.type === 'table') && (
          <div>
            <h4 className='text-sm font-medium mb-2'>Text Styling</h4>
            <div className='grid grid-cols-2 gap-2 mb-2'>
              <div>
                <label className='text-xs block'>Font Size</label>
                <input
                  type='number'
                  className='w-full bg-slate-700 border border-slate-600 rounded p-1 text-sm'
                  value={localElement.style?.fontSize || 12}
                  onChange={(e) => handleStyleChange('fontSize', parseInt(e.target.value))}
                />
              </div>
              <div>
                <label className='text-xs block'>Font Family</label>
                <select
                  className='w-full bg-slate-700 border border-slate-600 rounded p-1 text-sm'
                  value={localElement.style?.fontFamily || 'Helvetica'}
                  onChange={(e) => handleStyleChange('fontFamily', e.target.value)}
                >
                  <option value='Helvetica'>Helvetica</option>
                  <option value='Arial'>Arial</option>
                  <option value='Times New Roman'>Times New Roman</option>
                  <option value='Courier New'>Courier New</option>
                </select>
              </div>
            </div>

            <div className='flex items-center gap-2 mb-2'>
              <label className='text-xs'>Alignment:</label>
              <div className='flex gap-1'>
                <Button
                  variant={localElement.style?.textAlign === 'left' ? 'default' : 'outline'}
                  size='icon'
                  onClick={() => handleStyleChange('textAlign', 'left')}
                >
                  <AlignLeft className='h-4 w-4' />
                </Button>
                <Button
                  variant={localElement.style?.textAlign === 'center' ? 'default' : 'outline'}
                  size='icon'
                  onClick={() => handleStyleChange('textAlign', 'center')}
                >
                  <AlignCenter className='h-4 w-4' />
                </Button>
                <Button
                  variant={localElement.style?.textAlign === 'right' ? 'default' : 'outline'}
                  size='icon'
                  onClick={() => handleStyleChange('textAlign', 'right')}
                >
                  <AlignRight className='h-4 w-4' />
                </Button>
              </div>
            </div>

            <div className='flex items-center gap-2 mb-2'>
              <label className='text-xs'>Vertical Alignment:</label>
              <div className='flex gap-1'>
                <Button
                  variant={localElement.style?.verticalAlign === 'top' ? 'default' : 'outline'}
                  size='icon'
                  onClick={() => handleStyleChange('verticalAlign', 'top')}
                >
                  <ArrowUpToLine className='h-4 w-4' />
                </Button>
                <Button
                  variant={localElement.style?.verticalAlign === 'middle' ? 'default' : 'outline'}
                  size='icon'
                  onClick={() => handleStyleChange('verticalAlign', 'middle')}
                >
                  <StretchVertical className='h-4 w-4' />
                </Button>
                <Button
                  variant={localElement.style?.verticalAlign === 'bottom' ? 'default' : 'outline'}
                  size='icon'
                  onClick={() => handleStyleChange('verticalAlign', 'bottom')}
                >
                  <ArrowDownToLine className='h-4 w-4' />
                </Button>
              </div>
            </div>

            <div className='flex items-center gap-2'>
              <label className='text-xs'>Font Style:</label>
              <div className='flex gap-1'>
                <Button
                  variant={localElement.style?.fontWeight === 'bold' ? 'default' : 'outline'}
                  size='icon'
                  onClick={() =>
                    handleStyleChange('fontWeight', localElement.style?.fontWeight === 'bold' ? 'normal' : 'bold')
                  }
                >
                  <Bold className='h-4 w-4' />
                </Button>
                <Button
                  variant={localElement.style?.fontStyle === 'italic' ? 'default' : 'outline'}
                  size='icon'
                  onClick={() =>
                    handleStyleChange('fontStyle', localElement.style?.fontStyle === 'italic' ? 'normal' : 'italic')
                  }
                >
                  <Italic className='h-4 w-4' />
                </Button>
                <Button
                  variant={localElement.style?.textDecoration === 'underline' ? 'default' : 'outline'}
                  size='icon'
                  onClick={() =>
                    handleStyleChange(
                      'textDecoration',
                      localElement.style?.textDecoration === 'underline' ? 'none' : 'underline',
                    )
                  }
                >
                  <Underline className='h-4 w-4' />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Line Styling */}
        {element.type === 'line' && (
          <div>
            <h4 className='text-sm font-medium mb-2'>Line Styling</h4>
            <div className='grid grid-cols-2 gap-2'>
              <div>
                <label className='text-xs block'>Color</label>
                <input
                  type='color'
                  className='w-full h-8'
                  value={localElement.style?.strokeColor || '#000000'}
                  onChange={(e) => handleStyleChange('strokeColor', e.target.value)}
                />
              </div>
              <div>
                <label className='text-xs block'>Thickness</label>
                <input
                  type='range'
                  min='1'
                  max='10'
                  className='w-full'
                  value={localElement.style?.borderWidth || 1}
                  onChange={(e) => handleStyleChange('borderWidth', parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentsPropertiesPanel;
