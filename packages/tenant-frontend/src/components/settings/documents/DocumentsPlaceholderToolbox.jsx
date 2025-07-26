import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from 'ui-library';

const PlaceholderItem = ({ field, onInsert }) => (
  <div
    className='text-xs bg-slate-700 p-2 rounded mb-1 cursor-pointer hover:bg-indigo-600'
    onClick={() => onInsert(`{{${field.key}}}`)}
  >
    <div className='font-medium'>{field.label}</div>
    <div className='text-slate-400 text-xxs mt-1'>{field.key}</div>
  </div>
);

const DocumentsPlaceholderToolbox = ({ onInsert }) => {
  const dataFields = [
    {
      group: 'Customer',
      fields: [
        { key: 'customer.name', label: 'Customer Name' },
        { key: 'customer.address', label: 'Customer Address' },
        { key: 'customer.phone', label: 'Customer Phone' },
        { key: 'customer.email', label: 'Customer Email' },
      ],
    },
    {
      group: 'Company',
      fields: [
        { key: 'company.name', label: 'Company Name' },
        { key: 'company.address', label: 'Company Address' },
        { key: 'company.phone', label: 'Company Phone' },
        { key: 'company.email', label: 'Company Email' },
        { key: 'company.taxId', label: 'Tax ID' },
      ],
    },
    {
      group: 'Financial',
      fields: [
        { key: 'invoice.subTotal', label: 'Subtotal' },
        { key: 'invoice.totalTax', label: 'Tax Amount' },
        { key: 'invoice.totalAmount', label: 'Total Amount' },
        { key: 'invoice.amountPaid', label: 'Amount Paid' },
        { key: 'invoice.balanceDue', label: 'Balance Due' },
      ],
    },
    {
      group: 'Items',
      fields: [
        { key: 'items.description', label: 'Item Description' },
        { key: 'items.quantity', label: 'Quantity' },
        { key: 'items.unitPrice', label: 'Unit Price' },
        { key: 'items.totalPrice', label: 'Total Price' },
      ],
    },
    {
      group: 'Dates',
      fields: [
        { key: 'date.current', label: 'Current Date' },
        { key: 'date.due', label: 'Due Date' },
        { key: 'date.issue', label: 'Issue Date' },
      ],
    },
  ];

  return (
    <div className='bg-slate-800 rounded-md border border-slate-700 p-3'>
      <p className='text-sm font-semibold mb-3'>Data Fields</p>
      <p className='text-xs text-slate-400 mb-3'>Click to insert into selected text element</p>

      <Accordion type='multiple' className='w-full'>
        {dataFields.map((group) => (
          <AccordionItem value={group.group} key={group.group}>
            <AccordionTrigger className='py-2'>
              <span className='text-sm'>{group.group}</span>
            </AccordionTrigger>
            <AccordionContent className='pt-2 pb-3'>
              <div className='grid grid-cols-1 gap-1 max-h-60 overflow-y-auto'>
                {group.fields.map((field) => (
                  <PlaceholderItem key={field.key} field={field} onInsert={onInsert} />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default DocumentsPlaceholderToolbox;
