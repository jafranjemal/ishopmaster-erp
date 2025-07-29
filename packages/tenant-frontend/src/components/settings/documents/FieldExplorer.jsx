import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Input } from 'ui-library';
import { tenantDocumentTemplateService } from '../../../services/api';

const DraggableField = ({ field }) => {
  const handleDragStart = (e) => {
    const payload = {
      id: `data-field-${field.dataKey}`,
      type: 'text', // All data fields start as text elements
      content: { dataKey: field.dataKey },
      defaultSize: { width: 80, height: 10 }, // in mm
    };
    e.dataTransfer.setData('text/plain', JSON.stringify(payload));
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className='p-2 bg-slate-800 rounded text-xs cursor-grab hover:bg-indigo-600 hover:text-white'
    >
      {field.label}
    </div>
  );
};

const FieldExplorer = ({ documentType }) => {
  const [dataSources, setDataSources] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (documentType) {
      tenantDocumentTemplateService
        .getDataSources(documentType)
        .then((res) => setDataSources(res.data.data))
        .catch(() => toast.error('Could not load data fields for toolbox.'));
    }
  }, [documentType]);

  const filteredDataSources = dataSources
    .map((group) => ({
      ...group,
      fields: group.fields.filter(
        (field) =>
          field.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          field.dataKey.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    }))
    .filter((group) => group.fields.length > 0);

  return (
    <div className='p-3 bg-slate-800/50 rounded-md border border-slate-700 h-full flex flex-col'>
      <p className='text-sm font-semibold mb-2'>Field Explorer</p>
      <div className='relative mb-3'>
        <Search className='absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400' />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder='Search fields...'
          className='pl-8 h-8'
        />
      </div>
      <div className='flex-grow overflow-y-auto pr-2'>
        <Accordion type='multiple' className='w-full' defaultValue={dataSources.map((g) => g.group)}>
          {filteredDataSources.map((group) => (
            <AccordionItem value={group.group} key={group.group}>
              <AccordionTrigger>{group.group}</AccordionTrigger>
              <AccordionContent>
                <div className='grid grid-cols-1 gap-2 p-1'>
                  {group.fields.map((field) => (
                    <DraggableField key={field.dataKey} field={field} />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default FieldExplorer;
