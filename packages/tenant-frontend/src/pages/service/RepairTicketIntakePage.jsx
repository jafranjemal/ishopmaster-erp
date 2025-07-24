import { ArrowLeft } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  FileUploader,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'ui-library';
import CustomerSearch from '../../components/crm/CustomerSearch';
import AssetIntakeForm from '../../components/service/AssetIntakeForm';
import PreRepairChecklist from '../../components/service/PreRepairChecklist';
import SignaturePad from '../../components/service/SignaturePad';
import TroubleshootFee from '../../components/service/TroubleshootFee';
import {
  tenantDeviceService,
  tenantQcTemplateService,
  tenantRepairService,
  tenantUploadService,
} from '../../services/api';

const RepairTicketIntakePage = () => {
  const { id: ticketId } = useParams();
  const isEditMode = Boolean(ticketId);
  const [customer, setCustomer] = useState(null);
  const [ticket, setTicket] = useState(null);
  const [assets, setAssets] = useState([{ brandId: '', deviceId: '', serialNumber: '', complaint: '' }]);
  const [checklistData, setChecklistData] = useState({});
  const [beforeImages, setBeforeImages] = useState([]);
  const [troubleshootFee, setTroubleshootFee] = useState({ amount: 500, status: 'pending' });
  const [signature, setSignature] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditMode); // Only load on mount if in edit mode
  const [qcTemplates, setQcTemplates] = useState([]);
  const [selectedQcTemplateId, setSelectedQcTemplateId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    tenantQcTemplateService
      .getAll()
      .then((res) => setQcTemplates(res.data.data))
      .catch(() => toast.error('Failed to load QC templates.'))
      .finally(() => setIsLoading(false));
  }, []);

  const primaryDeviceId = assets[0]?.deviceId;
  useEffect(() => {
    if (primaryDeviceId) {
      // When the device changes, find its details to get the default QC template
      tenantDeviceService.getById(primaryDeviceId).then((res) => {
        const device = res.data.data;
        if (device?.templateId?.defaultQcTemplateId) {
          setSelectedQcTemplateId(device.templateId.defaultQcTemplateId);
        } else {
          setSelectedQcTemplateId(''); // Reset if no default
        }
      });
    }
  }, [assets, primaryDeviceId]);

  useEffect(() => {
    if (isEditMode) {
      tenantRepairService
        .getTicketById(ticketId)
        .then((res) => {
          const ticket = res.data.data;
          setTicket(ticket);
          setCustomer(ticket.customerId);
          setAssets(ticket.assets); // Assuming assets are populated correctly
          setChecklistData(ticket.preRepairChecklist || {});
          setBeforeImages(ticket.beforeImages || []);
          setTroubleshootFee(ticket.troubleshootFee);
          setSignature(ticket.customerSignature || '');
        })
        .catch(() => toast.error('Failed to load ticket data for editing.'))
        .finally(() => setIsLoading(false));
    }
  }, [ticketId, isEditMode]);

  const isFormValid = useMemo(() => {
    const issues = [];

    // Check customer
    if (!customer) issues.push('Customer not selected');

    // Check each asset
    assets.forEach((a, index) => {
      if (!a.brandId) issues.push(`Asset ${index + 1}: Missing brand`);
      if (!a.deviceId) issues.push(`Asset ${index + 1}: Missing device`);
      if (!a.serialNumber) issues.push(`Asset ${index + 1}: Missing serial number`);
      if (!a.complaint) issues.push(`Asset ${index + 1}: Missing complaint`);
    });

    // Check checklist
    const requiredChecklistItems = ['powerOn', 'screenCracked', 'waterDamage', 'buttonsFunctional'];
    requiredChecklistItems.forEach((key) => {
      if (checklistData[key] === undefined) {
        issues.push(`Checklist: '${key}' is not filled`);
      }
    });

    // Check signature
    if (!signature) issues.push('Customer signature not captured');

    // Log issues if any
    if (issues.length > 0) {
      console.log('Form is invalid due to the following:');
      issues.forEach((issue) => console.log('- ' + issue));
      return false;
    }

    return true;
  }, [customer, assets, checklistData, signature]);

  const handleSubmit = async () => {
    if (!isFormValid) {
      toast.error('Please complete all required fields, including the signature.');
      return;
    }
    setIsSaving(true);
    const ticketData = {
      customerId: customer._id,
      assets: assets.map(({ deviceId, serialNumber, complaint }) => ({ deviceId, serialNumber, complaint })),
      preRepairChecklist: checklistData,
      beforeImages: beforeImages.map((f) => ({ url: f.url, public_id: f.public_id })),
      troubleshootFee,
      customerSignature: signature,
      qcTemplateId: selectedQcTemplateId || null,
    };

    try {
      // --- Definitive Fix #2: Use the correct API based on mode ---
      const apiCall = isEditMode
        ? tenantRepairService.updateTicketDetails(ticketId, ticketData)
        : tenantRepairService.createTicket(ticketData);

      const res = await toast.promise(apiCall, {
        loading: isEditMode ? 'Updating ticket...' : 'Creating ticket...',
        success: `Ticket ${isEditMode ? 'updated' : 'created'} successfully!`,
        error: `Failed to ${isEditMode ? 'update' : 'create'} ticket.`,
      });
      const newOrUpdatedTicket = isEditMode ? res.data.data : res.data.data.ticket;
      navigate(`/service/tickets/${newOrUpdatedTicket._id}`);
    } catch (err) {
      /* handled by toast */
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className='space-y-6'>
      <Link to='/service/dashboard' className='flex items-center text-sm text-indigo-400 hover:underline'>
        <ArrowLeft className='h-4 w-4 mr-2' />
        Back to Service Dashboard
      </Link>
      <h1 className='text-3xl font-bold'>
        {isEditMode ? `Edit Service Ticket #${ticket?.ticketNumber}` : 'New Service & Repair Intake'}
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>Step 1: Customer & Device Details</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div>
            <Label>Select Customer</Label>
            <CustomerSearch onSelectCustomer={setCustomer} initialCustomer={customer} />
          </div>
          <AssetIntakeForm assets={assets} setAssets={setAssets} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Step 2: Quality Control Assignment</CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <Card className='p-4'>
              <CardHeader className='p-2'>
                <CardTitle className='text-sm font-medium'>Before Photos</CardTitle>
              </CardHeader>
              <CardContent className='p-2'>
                <FileUploader
                  onUploadComplete={setBeforeImages}
                  getSignatureFunc={tenantUploadService.getCloudinarySignature}
                  multiple={true}
                  initialFiles={beforeImages}
                />
              </CardContent>
            </Card>

            <Card className='p-4'>
              <PreRepairChecklist checklistData={checklistData} setChecklistData={setChecklistData} />

              <hr />
              <CardHeader className='p-2'>
                <CardTitle className='text-sm font-medium'>QC Assignment</CardTitle>
              </CardHeader>
              <CardDescription className='px-2'>
                A QC checklist will be automatically selected based on the device, or you can choose one manually.
              </CardDescription>
              <CardContent className='p-2 space-y-3'>
                <div>
                  <Label>Required Checklist</Label>
                  <Select onValueChange={setSelectedQcTemplateId} value={selectedQcTemplateId}>
                    <SelectTrigger>
                      <SelectValue placeholder='Select a QC checklist...' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=''>None</SelectItem>
                      {qcTemplates.map((template) => (
                        <SelectItem key={template._id} value={template._id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Step 3: Fees & Confirmation</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <TroubleshootFee fee={troubleshootFee} setFee={setTroubleshootFee} />
          <div>
            <Label>Customer Signature (Acknowledges condition & fees)</Label>
            {signature && isEditMode ? (
              <img src={signature} alt='Customer Signature' className='bg-white p-2 rounded-md h-32' />
            ) : (
              <SignaturePad onSave={setSignature} />
            )}
          </div>
        </CardContent>
      </Card>

      <div className='flex justify-end'>
        <Button size='lg' onClick={handleSubmit} disabled={!isFormValid || isSaving}>
          {isSaving
            ? isEditMode
              ? 'Updating Ticket...'
              : 'Creating Ticket...'
            : isEditMode
              ? 'Save Changes'
              : 'Create Repair Ticket'}
        </Button>
      </div>
    </div>
  );
};
export default RepairTicketIntakePage;
