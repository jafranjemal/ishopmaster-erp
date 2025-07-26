const CanvasItem = ({ item }) => {
  // This component renders a placeholder for the visual editor
  const renderContent = () => {
    switch (item.id) {
      case 'company-logo':
        return (
          <div className='flex items-center justify-center h-full bg-slate-700 text-slate-400 text-sm'>
            Company Logo
          </div>
        );
      case 'invoice-title':
        return (
          <div className='p-2'>
            <h1 className='text-2xl font-bold'>INVOICE</h1>
          </div>
        );
      case 'items-table':
        return (
          <div className='flex items-center justify-center h-full bg-slate-700 text-slate-400 text-sm'>
            Items Table Placeholder
          </div>
        );
      case 'footer-text':
        return <div className='p-2 text-xs text-slate-400'>Thank you for your business!</div>;
      default:
        return <div className='p-2'>{item.name}</div>;
    }
  };

  return <div className='w-full h-full border border-dashed border-slate-600 overflow-hidden'>{renderContent()}</div>;
};

export default CanvasItem;
