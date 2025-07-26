import { Box, Building, DollarSign, FileText, Heading, Image, Minus, Table, Type, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from 'ui-library';
import { v4 as uuidv4 } from 'uuid';

const ToolboxItem = ({ item, onDragStart, onItemClick }) => (
  <div
    className='p-3 bg-slate-800 rounded-md flex items-center gap-3 cursor-move mb-2 hover:bg-slate-700'
    draggable={!!onDragStart}
    onDragStart={(e) => onDragStart && onDragStart(e, item)}
    onClick={() => onItemClick && onItemClick(item)}
  >
    {item.icon}
    <span className='text-sm'>{item.name}</span>
  </div>
);

const ToolboxSection = ({ title, items, onDragStart, onItemClick }) => (
  <div className='mb-4'>
    <h4 className='text-xs text-slate-400 mb-2 font-semibold'>{title}</h4>
    <div className='space-y-2'>
      {items.map((item) => (
        <ToolboxItem key={item.id} item={item} onDragStart={onDragStart} onItemClick={onItemClick} />
      ))}
    </div>
  </div>
);

const Toolbox = ({ documentType, onAddElement }) => {
  const [allFields, setAllFields] = useState({
    salesInvoice: [],
    repairTicket: [],
    supplierInvoice: [],
  });

  useEffect(() => {
    const loadFields = async () => {
      try {
        const [salesFields, repairFields, supplierFields] = await Promise.all([
          getSalesInvoiceFields(),
          getRepairTicketFields(),
          getSupplierInvoiceFields(),
        ]);

        setAllFields({
          salesInvoice: salesFields,
          repairTicket: repairFields,
          supplierInvoice: supplierFields,
        });
      } catch (error) {
        console.error('Failed to load field definitions', error);
      }
    };

    loadFields();
  }, []);

  const handleOneClickInsert = (field) => {
    const newElement = {
      id: uuidv4(),
      type: 'text',
      position: { x: 100, y: 100 },
      dimensions: { width: field.type === 'financial' ? 200 : 150, height: 30 },
      content: {
        template: field.template || `{{${field.key}}}`,
      },
      style: {
        fontSize: field.type === 'financial' ? 12 : 10,
        fontWeight: field.type === 'financial' ? 'bold' : 'normal',
        textAlign: field.type === 'financial' ? 'right' : 'left',
      },
    };

    onAddElement(newElement);
  };

  const handleDragStart = (e, componentType) => {
    e.dataTransfer.setData('application/reactflow', JSON.stringify(componentType));
  };

  // Layout elements
  const layoutElements = [
    { id: 'text', name: 'Text Block', icon: <Type /> },
    { id: 'line', name: 'Line Separator', icon: <Minus /> },
    { id: 'image', name: 'Image', icon: <Image /> },
    { id: 'table', name: 'Items Table', icon: <Table /> },
  ];

  // Quick sections
  const sectionElements = [
    { id: 'header', name: 'Header Section', icon: <Heading /> },
    { id: 'footer', name: 'Footer Section', icon: <FileText /> },
  ];

  // Field categories
  const customerFields = [
    ...allFields.salesInvoice.filter((f) => f.group === 'Customer'),
    ...allFields.repairTicket.filter((f) => f.group === 'Customer'),
  ].map((f) => ({
    ...f,
    icon: <User className='h-4 w-4' />,
    type: 'data-field',
  }));

  const financialFields = [
    ...allFields.salesInvoice.filter((f) => f.group === 'Financial'),
    ...allFields.supplierInvoice.filter((f) => f.group === 'Financial'),
  ].map((f) => ({
    ...f,
    icon: <DollarSign className='h-4 w-4' />,
    type: 'financial-field',
  }));

  const productFields = allFields.salesInvoice
    .filter((f) => f.group === 'Product')
    .map((f) => ({
      ...f,
      icon: <Box className='h-4 w-4' />,
      type: 'product-field',
    }));

  const companyFields = [
    ...allFields.salesInvoice.filter((f) => f.group === 'Company'),
    ...allFields.repairTicket.filter((f) => f.group === 'Company'),
  ].map((f) => ({
    ...f,
    icon: <Building className='h-4 w-4' />,
    type: 'company-field',
  }));

  return (
    <Card className='h-full flex flex-col'>
      <CardHeader>
        <CardTitle>Document Elements</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4 flex-grow overflow-y-auto'>
        <ToolboxSection title='Quick Sections' items={sectionElements} onItemClick={handleOneClickInsert} />

        <ToolboxSection title='Layout Elements' items={layoutElements} onDragStart={handleDragStart} />

        <ToolboxSection title='Customer Fields' items={customerFields} onItemClick={handleOneClickInsert} />

        <ToolboxSection title='Financial Fields' items={financialFields} onItemClick={handleOneClickInsert} />

        <ToolboxSection title='Product Fields' items={productFields} onItemClick={handleOneClickInsert} />

        <ToolboxSection title='Company Fields' items={companyFields} onItemClick={handleOneClickInsert} />
      </CardContent>
    </Card>
  );
};

// Field definitions from schemas
const getSalesInvoiceFields = () => [
  // Customer fields
  { key: 'customer.name', label: 'Customer Name', group: 'Customer' },
  { key: 'customer.address', label: 'Customer Address', group: 'Customer' },
  { key: 'customer.phone', label: 'Customer Phone', group: 'Customer' },
  { key: 'customer.email', label: 'Customer Email', group: 'Customer' },

  // Financial fields
  { key: 'invoice.subTotal', label: 'Subtotal', group: 'Financial', type: 'financial' },
  { key: 'invoice.totalTax', label: 'Tax Amount', group: 'Financial', type: 'financial' },
  { key: 'invoice.totalAmount', label: 'Total Amount', group: 'Financial', type: 'financial' },
  { key: 'invoice.amountPaid', label: 'Amount Paid', group: 'Financial', type: 'financial' },
  { key: 'invoice.balanceDue', label: 'Balance Due', group: 'Financial', type: 'financial' },

  // Product fields
  { key: 'items.description', label: 'Item Description', group: 'Product' },
  { key: 'items.quantity', label: 'Quantity', group: 'Product' },
  { key: 'items.unitPrice', label: 'Unit Price', group: 'Product', type: 'financial' },
  { key: 'items.totalPrice', label: 'Total Price', group: 'Product', type: 'financial' },

  // Company fields
  { key: 'company.name', label: 'Company Name', group: 'Company' },
  { key: 'company.address', label: 'Company Address', group: 'Company' },
  { key: 'company.phone', label: 'Company Phone', group: 'Company' },
  { key: 'company.email', label: 'Company Email', group: 'Company' },
  { key: 'company.taxId', label: 'Tax ID', group: 'Company' },
];

const getRepairTicketFields = () => [
  // Customer fields
  { key: 'customer.name', label: 'Customer Name', group: 'Customer' },
  { key: 'customer.address', label: 'Customer Address', group: 'Customer' },

  // Asset fields
  { key: 'asset.name', label: 'Asset Name', group: 'Asset' },
  { key: 'asset.serialNumber', label: 'Serial Number', group: 'Asset' },

  // Service fields
  { key: 'service.description', label: 'Service Description', group: 'Service' },
  { key: 'service.laborHours', label: 'Labor Hours', group: 'Service' },
  { key: 'service.laborRate', label: 'Labor Rate', group: 'Service', type: 'financial' },
  { key: 'service.laborTotal', label: 'Labor Total', group: 'Service', type: 'financial' },

  // Company fields
  { key: 'company.name', label: 'Company Name', group: 'Company' },
];

const getSupplierInvoiceFields = () => [
  // Supplier fields
  { key: 'supplier.name', label: 'Supplier Name', group: 'Supplier' },
  { key: 'supplier.address', label: 'Supplier Address', group: 'Supplier' },

  // Financial fields
  { key: 'invoice.subTotal', label: 'Subtotal', group: 'Financial', type: 'financial' },
  { key: 'invoice.totalTax', label: 'Tax Amount', group: 'Financial', type: 'financial' },
  { key: 'invoice.totalAmount', label: 'Total Amount', group: 'Financial', type: 'financial' },

  // Product fields
  { key: 'items.description', label: 'Item Description', group: 'Product' },
  { key: 'items.quantity', label: 'Quantity', group: 'Product' },
  { key: 'items.unitPrice', label: 'Unit Price', group: 'Product', type: 'financial' },
  { key: 'items.totalPrice', label: 'Total Price', group: 'Product', type: 'financial' },
];

export default Toolbox;
