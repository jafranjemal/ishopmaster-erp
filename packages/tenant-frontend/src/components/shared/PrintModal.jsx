// import { LoaderCircle, Printer } from 'lucide-react';
// import { useCallback, useEffect, useState } from 'react';
// import { toast } from 'react-hot-toast';
// import { Button, Input, Label, Modal, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'ui-library';
// import useAuth from '../../context/useAuth';
// import { tenantDocumentTemplateService, tenantHardwareService, tenantPrintingService } from '../../services/api';

// const PrintModal = ({ isOpen, onClose, documentType, documentId }) => {
//   const [templates, setTemplates] = useState([]);
//   const [printers, setPrinters] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isPrinting, setIsPrinting] = useState(false);

//   const [selectedTemplate, setSelectedTemplate] = useState('');
//   const [selectedPrinter, setSelectedPrinter] = useState('');
//   const [copies, setCopies] = useState(1);

//   const { user } = useAuth();

//   const fetchData = useCallback(async () => {
//     if (!isOpen) return;
//     try {
//       setIsLoading(true);
//       const [templatesRes, printersRes] = await Promise.all([
//         tenantDocumentTemplateService.getAll({ documentType }),
//         tenantHardwareService.getAll({ branchId: user.assignedBranchId, type: 'printer' }),
//       ]);

//       const availableTemplates = templatesRes.data.data;
//       setTemplates(availableTemplates);
//       const defaultTemplate = availableTemplates.find((t) => t.isDefault);
//       setSelectedTemplate(defaultTemplate?._id || '');

//       const availablePrinters = printersRes.data.data;
//       setPrinters(availablePrinters);
//       const defaultPrinter = availablePrinters.find((p) => p.isDefault);
//       setSelectedPrinter(defaultPrinter?._id || '');
//     } catch (error) {
//       toast.error('Failed to load printing options.');
//       onClose();
//     } finally {
//       setIsLoading(false);
//     }
//   }, [isOpen, documentType, user.assignedBranchId, onClose]);

//   useEffect(() => {
//     fetchData();
//   }, [fetchData]);

//   const handlePrint = async () => {
//     if (!selectedTemplate || !selectedPrinter) {
//       toast.error('Please select a template and a printer.');
//       return;
//     }
//     setIsPrinting(true);
//     try {
//       const jobData = {
//         documentType,
//         documentId,
//         templateId: selectedTemplate,
//         hardwareDeviceId: selectedPrinter,
//         copies,
//       };
//       await toast.promise(tenantPrintingService.createPrintJob(jobData), {
//         loading: 'Sending job to printer queue...',
//         success: 'Print job sent successfully!',
//         error: (err) => err.response?.data?.error || 'Failed to send print job.',
//       });
//       onClose(); // Close modal on success
//     } catch (err) {
//       /* Handled by toast */
//     } finally {
//       setIsPrinting(false);
//     }
//   };

//   return (
//     <Modal isOpen={isOpen} onClose={onClose} title='Print Document'>
//       {isLoading ? (
//         <div className='flex justify-center p-8'>
//           <LoaderCircle className='h-6 w-6 animate-spin' />
//         </div>
//       ) : (
//         <div className='space-y-4'>
//           <div>
//             <Label>Document Design</Label>
//             <Select onValueChange={setSelectedTemplate} value={selectedTemplate}>
//               <SelectTrigger>
//                 <SelectValue placeholder='Select a template...' />
//               </SelectTrigger>
//               <SelectContent>
//                 {templates.map((t) => (
//                   <SelectItem key={t._id} value={t._id}>
//                     {t.name}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>
//           <div>
//             <Label>Target Printer</Label>
//             <Select onValueChange={setSelectedPrinter} value={selectedPrinter}>
//               <SelectTrigger>
//                 <SelectValue placeholder='Select a printer...' />
//               </SelectTrigger>
//               <SelectContent>
//                 {printers.map((p) => (
//                   <SelectItem key={p._id} value={p._id}>
//                     {p.name} ({p.branchId.name})
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>
//           <div>
//             <Label>Copies</Label>
//             <Input
//               type='number'
//               value={copies}
//               onChange={(e) => setCopies(Math.max(1, Number(e.target.value)))}
//               min='1'
//             />
//           </div>
//           <div className='pt-4 flex justify-end'>
//             <Button size='lg' className='w-full' onClick={handlePrint} disabled={isPrinting}>
//               <Printer className='h-5 w-5 mr-2' />
//               {isPrinting ? 'Sending...' : 'Send to Printer'}
//             </Button>
//           </div>
//         </div>
//       )}
//     </Modal>
//   );
// };

// export default PrintModal;

import { Download, LoaderCircle, Mail, Printer } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Button, Label, Modal, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'ui-library';
import { tenantDocumentService, tenantDocumentTemplateService } from '../../services/api';

const PrintModal = ({ isOpen, onClose, documentType, documentId }) => {
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');

  const fetchData = useCallback(async () => {
    if (!isOpen) return;
    try {
      setIsLoading(true);
      const res = await tenantDocumentTemplateService.getAll({ documentType });
      const availableTemplates = res.data.data;
      setTemplates(availableTemplates);
      const defaultTemplate = availableTemplates.find((t) => t.isDefault);
      setSelectedTemplate(defaultTemplate?._id || availableTemplates[0]?._id || '');
    } catch (error) {
      toast.error('Failed to load document templates.');
      onClose();
    } finally {
      setIsLoading(false);
    }
  }, [isOpen, documentType, onClose]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAction = async (actionType, style) => {
    if (!selectedTemplate) {
      toast.error('Please select a document design.');
      return;
    }
    setIsProcessing(true);
    try {
      if (actionType === 'download') {
        const res = await toast.promise(tenantDocumentService.renderForDownload(selectedTemplate, documentId, style), {
          loading: 'Generating PDF...',
          success: 'Download will begin shortly!',
          error: 'Failed to generate PDF.',
        });
        console.log('repair ticket reciverd ', res);
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${documentType}-${documentId}-${style}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
      }
      // Add logic for 'email' and 'print' here
    } catch (err) {
      /* Handled by toast */
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title='Print / Distribute Document'>
      {isLoading ? (
        <div className='flex justify-center p-8'>
          <LoaderCircle className='h-6 w-6 animate-spin' />
        </div>
      ) : (
        <div className='space-y-6'>
          <div>
            <Label>Document Design</Label>
            <Select onValueChange={setSelectedTemplate} value={selectedTemplate}>
              <SelectTrigger>
                <SelectValue placeholder='Select a template...' />
              </SelectTrigger>
              <SelectContent>
                {templates.map((t) => (
                  <SelectItem key={t._id} value={t._id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='border-t border-slate-700 pt-4 space-y-3'>
            <h3 className='text-lg font-semibold'>Actions</h3>
            <div className='p-4 bg-slate-800 rounded-lg flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <Download className='h-6 w-6 text-indigo-400' />
                <div>
                  <p className='font-semibold'>Download PDF</p>
                  <p className='text-xs text-slate-400'>Save a digital copy to your device.</p>
                </div>
              </div>
              <div className='flex gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => handleAction('download', 'customer_copy')}
                  disabled={isProcessing}
                >
                  Customer Copy
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => handleAction('download', 'technician_copy')}
                  disabled={isProcessing}
                >
                  Internal Copy
                </Button>
              </div>
            </div>
            <div className='p-4 bg-slate-800 rounded-lg flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <Mail className='h-6 w-6 text-indigo-400' />
                <div>
                  <p className='font-semibold'>Send via Email</p>
                  <p className='text-xs text-slate-400'>Email a PDF attachment to the customer.</p>
                </div>
              </div>
              <Button disabled={isProcessing}>Send Email</Button>
            </div>
            <div className='p-4 bg-slate-800 rounded-lg flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <Printer className='h-6 w-6 text-indigo-400' />
                <div>
                  <p className='font-semibold'>Print to Local Device</p>
                  <p className='text-xs text-slate-400'>Send to a configured local printer.</p>
                </div>
              </div>
              <Button disabled={isProcessing}>Send to Printer</Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default PrintModal;
