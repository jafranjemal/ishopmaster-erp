import { Image, Minus, Table as TableIcon, Type } from 'lucide-react';
import { useDrag } from 'react-dnd';
import { Card, CardContent, CardHeader, CardTitle } from 'ui-library';
import FieldExplorer from './FieldExplorer';

const TOOLBOX_ELEMENTS = [
  {
    id: 'text',
    name: 'Text Block',
    icon: <Type className='h-5 w-5' />,
    type: 'text',
    defaultSize: { width: 60, height: 10 },
  },
  {
    id: 'line',
    name: 'Line Separator',
    icon: <Minus className='h-5 w-5' />,
    type: 'line',
    defaultSize: { width: 180, height: 1 },
  },
  {
    id: 'image',
    name: 'Image',
    icon: <Image className='h-5 w-5' />,
    type: 'image',
    defaultSize: { width: 40, height: 40 },
  },
  {
    id: 'table',
    name: 'Items Table',
    icon: <TableIcon className='h-5 w-5' />,
    type: 'table',
    defaultSize: { width: 180, height: 100 },
  },
];

const ToolboxItem = ({ item }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: item.type,
    item: item,
    collect: (monitor) => ({ isDragging: !!monitor.isDragging() }),
  }));
  return (
    <div
      ref={drag}
      className={`p-3  rounded-md flex items-center gap-3 cursor-move shadow hover:shadow-md ${isDragging ? 'opacity-50' : 'opacity-100'}`}
    >
      {item.icon}
      <span className='text-sm font-medium'>{item.name}</span>
    </div>
  );
};

const Toolbox = ({ documentType }) => {
  return (
    <div className='h-full flex flex-col gap-4'>
      <Card className='shadow'>
        <CardHeader className='  py-3'>
          <CardTitle className='text-base'>Layout Elements</CardTitle>
        </CardHeader>
        <CardContent className='space-y-2 p-4'>
          {TOOLBOX_ELEMENTS.map((item) => (
            <ToolboxItem key={item.id} item={item} />
          ))}
        </CardContent>
      </Card>
      <div className='flex-grow min-h-0'>
        <FieldExplorer documentType={documentType} />
      </div>
    </div>
  );
};
export default Toolbox;
