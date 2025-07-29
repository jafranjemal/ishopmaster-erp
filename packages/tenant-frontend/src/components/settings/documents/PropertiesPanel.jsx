import { Trash2 } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'ui-library';

const PropertiesPanel = ({ element, onUpdate, onDelete }) => {
  if (!element) {
    return (
      <Card className='h-full'>
        <CardHeader>
          <CardTitle>Properties</CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-sm text-slate-400'>Select an element on the canvas to edit its properties.</p>
        </CardContent>
      </Card>
    );
  }

  const handleUpdate = (path, value) => {
    const updatedElement = { ...element };
    const keys = path.split('.');
    let current = updatedElement;
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    onUpdate(updatedElement);
  };

  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle className='capitalize'>Properties: {element.type}</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4 overflow-y-auto'>
        <h4 className='font-semibold'>Position & Size (mm)</h4>
        <div className='grid grid-cols-2 gap-2'>
          <div>
            <Label>X</Label>
            <Input
              type='number'
              value={element.position.x}
              onChange={(e) => handleUpdate('position.x', parseFloat(e.target.value))}
            />
          </div>
          <div>
            <Label>Y</Label>
            <Input
              type='number'
              value={element.position.y}
              onChange={(e) => handleUpdate('position.y', parseFloat(e.target.value))}
            />
          </div>
          <div>
            <Label>Width</Label>
            <Input
              type='number'
              value={element.dimensions.width}
              onChange={(e) => handleUpdate('dimensions.width', parseFloat(e.target.value))}
            />
          </div>
          <div>
            <Label>Height</Label>
            <Input
              type='number'
              value={element.dimensions.height}
              onChange={(e) => handleUpdate('dimensions.height', parseFloat(e.target.value))}
            />
          </div>
        </div>

        {element.type === 'text' && (
          <>
            <h4 className='font-semibold border-t border-slate-700 pt-4 mt-4'>Content</h4>
            <div>
              <Label>Static Text</Label>
              <Input
                value={element.content.staticText || ''}
                onChange={(e) => handleUpdate('content.staticText', e.target.value)}
              />
            </div>
            <div>
              <Label>Data Key</Label>
              <Input
                value={element.content.dataKey || ''}
                onChange={(e) => handleUpdate('content.dataKey', e.target.value)}
                placeholder='{{invoice.invoiceId}}'
              />
            </div>

            <h4 className='font-semibold border-t border-slate-700 pt-4 mt-4'>Styling</h4>
            <div>
              <Label>Font Size (pt)</Label>
              <Input
                type='number'
                value={element.style?.fontSize || 10}
                onChange={(e) => handleUpdate('style.fontSize', Number(e.target.value))}
              />
            </div>
            <div>
              <Label>Color</Label>
              <Input
                type='color'
                value={element.style.fillColor || '#000000'}
                onChange={(e) => handleUpdate('style.fillColor', e.target.value)}
              />
            </div>
            <div>
              <Label>Alignment</Label>
              <Select onValueChange={(val) => handleUpdate('style.textAlign', val)} value={element.style.textAlign}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='left'>Left</SelectItem>
                  <SelectItem value='center'>Center</SelectItem>
                  <SelectItem value='right'>Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        <div className='p-4 border-t border-slate-700'>
          <Button variant='destructive' className='w-full' onClick={onDelete}>
            <Trash2 className='h-4 w-4 mr-2' />
            Delete Element
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertiesPanel;
