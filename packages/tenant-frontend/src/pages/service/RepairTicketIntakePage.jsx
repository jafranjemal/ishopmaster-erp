import { ArrowLeft } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, CardContent, CardHeader, CardTitle, FileUploader, Label } from 'ui-library';
import CustomerSearch from '../../components/crm/CustomerSearch';
import AssetIntakeForm from '../../components/service/AssetIntakeForm';
import PreRepairChecklist from '../../components/service/PreRepairChecklist';
import SignaturePad from '../../components/service/SignaturePad';
import TroubleshootFee from '../../components/service/TroubleshootFee';
import { tenantRepairService, tenantUploadService } from '../../services/api';

const RepairTicketIntakePage = () => {
  const [customer, setCustomer] = useState(null);
  const [assets, setAssets] = useState([{ brandId: '', deviceId: '', serialNumber: '', complaint: '' }]);
  const [checklistData, setChecklistData] = useState({});
  const [beforeImages, setBeforeImages] = useState([]);
  const [troubleshootFee, setTroubleshootFee] = useState({ amount: 500, status: 'pending' });
  const [signature, setSignature] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  const isFormValid = useMemo(() => {
    const requiredChecklistItems = ['powerOn', 'screenCracked', 'waterDamage', 'buttonsFunctional'];
    return (
      customer &&
      assets.every((a) => a.brandId && a.deviceId && a.serialNumber && a.complaint) &&
      requiredChecklistItems.every((key) => checklistData[key] !== undefined) &&
      signature
    );
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
    };

    try {
      const res = await toast.promise(tenantRepairService.createTicket(ticketData), {
        /* ... */
      });
      navigate(`/service/tickets/${res.data.data.ticket._id}`);
    } catch (err) {
      /* ... */
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
      <h1 className='text-3xl font-bold'>New Service & Repair Intake</h1>

      <Card>
        <CardHeader>
          <CardTitle>Step 1: Customer & Device Details</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div>
            <Label>Select Customer</Label>
            <CustomerSearch onSelectCustomer={setCustomer} />
          </div>
          <AssetIntakeForm assets={assets} setAssets={setAssets} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Step 2: Condition Assessment</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <PreRepairChecklist checklistData={checklistData} setChecklistData={setChecklistData} />
          <div>
            <Label>Before Photos (Device Condition)</Label>
            <FileUploader
              onUploadComplete={setBeforeImages}
              getSignatureFunc={tenantUploadService.getCloudinarySignature}
              multiple={true}
            />
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
            <SignaturePad onSave={setSignature} />
          </div>
        </CardContent>
      </Card>

      <div className='flex justify-end'>
        <Button size='lg' onClick={handleSubmit} disabled={!isFormValid || isSaving}>
          {isSaving ? 'Creating Ticket...' : 'Create Repair Ticket'}
        </Button>
      </div>
    </div>
  );
};
export default RepairTicketIntakePage;
