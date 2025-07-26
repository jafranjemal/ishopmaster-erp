import { LoaderCircle, Printer } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Button, Input, Label, Modal, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'ui-library';
import useAuth from '../../context/useAuth';
import { tenantDocumentTemplateService, tenantHardwareService, tenantPrintingService } from '../../services/api';

const PrintModal = ({ isOpen, onClose, documentType, documentId }) => {
  const [templates, setTemplates] = useState([]);
  const [printers, setPrinters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPrinting, setIsPrinting] = useState(false);

  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedPrinter, setSelectedPrinter] = useState('');
  const [copies, setCopies] = useState(1);

  const { user } = useAuth();

  const fetchData = useCallback(async () => {
    if (!isOpen) return;
    try {
      setIsLoading(true);
      const [templatesRes, printersRes] = await Promise.all([
        tenantDocumentTemplateService.getAll({ documentType }),
        tenantHardwareService.getAll({ branchId: user.assignedBranchId, type: 'printer' }),
      ]);

      const availableTemplates = templatesRes.data.data;
      setTemplates(availableTemplates);
      const defaultTemplate = availableTemplates.find((t) => t.isDefault);
      setSelectedTemplate(defaultTemplate?._id || '');

      const availablePrinters = printersRes.data.data;
      setPrinters(availablePrinters);
      const defaultPrinter = availablePrinters.find((p) => p.isDefault);
      setSelectedPrinter(defaultPrinter?._id || '');
    } catch (error) {
      toast.error('Failed to load printing options.');
      onClose();
    } finally {
      setIsLoading(false);
    }
  }, [isOpen, documentType, user.assignedBranchId, onClose]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePrint = async () => {
    if (!selectedTemplate || !selectedPrinter) {
      toast.error('Please select a template and a printer.');
      return;
    }
    setIsPrinting(true);
    try {
      const jobData = {
        documentType,
        documentId,
        templateId: selectedTemplate,
        hardwareDeviceId: selectedPrinter,
        copies,
      };
      await toast.promise(tenantPrintingService.createPrintJob(jobData), {
        loading: 'Sending job to printer queue...',
        success: 'Print job sent successfully!',
        error: (err) => err.response?.data?.error || 'Failed to send print job.',
      });
      onClose(); // Close modal on success
    } catch (err) {
      /* Handled by toast */
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title='Print Document'>
      {isLoading ? (
        <div className='flex justify-center p-8'>
          <LoaderCircle className='h-6 w-6 animate-spin' />
        </div>
      ) : (
        <div className='space-y-4'>
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
          <div>
            <Label>Target Printer</Label>
            <Select onValueChange={setSelectedPrinter} value={selectedPrinter}>
              <SelectTrigger>
                <SelectValue placeholder='Select a printer...' />
              </SelectTrigger>
              <SelectContent>
                {printers.map((p) => (
                  <SelectItem key={p._id} value={p._id}>
                    {p.name} ({p.branchId.name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Copies</Label>
            <Input
              type='number'
              value={copies}
              onChange={(e) => setCopies(Math.max(1, Number(e.target.value)))}
              min='1'
            />
          </div>
          <div className='pt-4 flex justify-end'>
            <Button size='lg' className='w-full' onClick={handlePrint} disabled={isPrinting}>
              <Printer className='h-5 w-5 mr-2' />
              {isPrinting ? 'Sending...' : 'Send to Printer'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default PrintModal;
