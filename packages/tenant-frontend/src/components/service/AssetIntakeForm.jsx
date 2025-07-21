import { LoaderCircle, PlusCircle, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
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
import { tenantBrandService, tenantDeviceService } from '../../services/api';

const AssetRow = ({ asset, index, onAssetChange, onRemove, allBrands }) => {
  const [devicesForBrand, setDevicesForBrand] = useState([]);
  const [isLoadingDevices, setIsLoadingDevices] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    if (asset.brandId) {
      setIsLoadingDevices(true);
      tenantDeviceService
        .getAll({ brandId: asset.brandId })
        .then((res) => {
          setDevicesForBrand(res.data.data);
        })
        .catch(() => {
          toast.error('Failed to load devices for selected brand.');
          setDevicesForBrand([]);
        })
        .finally(() => setIsLoadingDevices(false));
    } else {
      setDevicesForBrand([]);
    }
  }, [asset.brandId]);

  const handleRemove = () => {
    if (asset.length <= 1) {
      toast.error('At least one asset is required');
      return;
    }

    setIsRemoving(true);
    setTimeout(() => {
      onRemove(index);
      setIsRemoving(false);
    }, 300);
  };

  return (
    <Card className='relative overflow-hidden transition-all duration-300 hover:border-indigo-500/50 group'>
      <div
        className={`absolute inset-0 bg-slate-900/80 flex items-center justify-center transition-opacity duration-300 ${isRemoving ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <LoaderCircle className='h-8 w-8 animate-spin text-rose-500' />
      </div>

      <CardHeader className='pb-3'>
        <CardTitle className='text-lg font-medium flex items-center'>
          <div className='bg-indigo-500/10 w-8 h-8 rounded-full flex items-center justify-center mr-3'>
            <span className='text-indigo-400'>{index + 1}</span>
          </div>
          Device #{index + 1}
        </CardTitle>
      </CardHeader>

      <CardContent className='space-y-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <Label className='flex items-center'>
              Brand
              {asset.brandId && <span className='ml-2 text-xs text-emerald-400 flex items-center'>• Selected</span>}
            </Label>
            <Select onValueChange={(val) => onAssetChange(index, 'brandId', val)} value={asset.brandId}>
              <SelectTrigger className='bg-slate-800 border-slate-700 hover:border-indigo-400 transition-colors'>
                <SelectValue placeholder='Select Brand...' />
              </SelectTrigger>
              <SelectContent className='bg-slate-800 border-slate-700'>
                {allBrands.map((b) => (
                  <SelectItem key={b._id} value={b._id} className='hover:bg-slate-700 focus:bg-slate-700'>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label className='flex items-center'>
              Device / Model
              {asset.deviceId && <span className='ml-2 text-xs text-emerald-400 flex items-center'>• Selected</span>}
            </Label>
            <Select
              onValueChange={(val) => onAssetChange(index, 'deviceId', val)}
              value={asset.deviceId}
              disabled={!asset.brandId || isLoadingDevices}
            >
              <SelectTrigger className='bg-slate-800 border-slate-700 hover:border-indigo-400 transition-colors'>
                <SelectValue
                  placeholder={
                    isLoadingDevices ? (
                      <span className='flex items-center'>
                        <LoaderCircle className='h-4 w-4 mr-2 animate-spin' /> Loading...
                      </span>
                    ) : (
                      'Select Device...'
                    )
                  }
                />
              </SelectTrigger>
              <SelectContent className='bg-slate-800 border-slate-700'>
                {devicesForBrand.length > 0 ? (
                  devicesForBrand.map((d) => (
                    <SelectItem key={d._id} value={d._id} className='hover:bg-slate-700 focus:bg-slate-700'>
                      {d.name}
                    </SelectItem>
                  ))
                ) : (
                  <div className='py-2 px-3 text-sm text-slate-400'>
                    {asset.brandId ? 'No devices found' : 'Select a brand first'}
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className='space-y-2'>
          <Label>Serial / IMEI Number</Label>
          <Input
            value={asset.serialNumber}
            onChange={(e) => onAssetChange(index, 'serialNumber', e.target.value)}
            className='bg-slate-800 border-slate-700 focus:border-indigo-400 transition-colors'
            required
            placeholder='Enter unique identifier'
          />
        </div>

        <div className='space-y-2'>
          <Label>Customer's Complaint</Label>
          <Input
            as='textarea'
            value={asset.complaint}
            onChange={(e) => onAssetChange(index, 'complaint', e.target.value)}
            className='bg-slate-800 border-slate-700 focus:border-indigo-400 transition-colors min-h-[100px]'
            required
            placeholder='Describe the issue in detail...'
          />
        </div>
      </CardContent>

      <Button
        variant='ghost'
        size='icon'
        className='absolute top-4 right-4 text-slate-400 hover:text-rose-500 transition-colors group-hover:opacity-100 opacity-0'
        onClick={handleRemove}
        disabled={isRemoving}
        aria-label='Remove device'
      >
        <Trash2 className='h-4 w-4' />
      </Button>
    </Card>
  );
};

const AssetIntakeForm = ({ assets, setAssets }) => {
  const [allBrands, setAllBrands] = useState([]);
  const [isLoadingBrands, setIsLoadingBrands] = useState(true);

  useEffect(() => {
    setIsLoadingBrands(true);
    tenantBrandService
      .getAll()
      .then((res) => {
        setAllBrands(res.data.data);
        setIsLoadingBrands(false);
      })
      .catch(() => {
        toast.error('Failed to load brands');
        setIsLoadingBrands(false);
      });
  }, []);

  const handleAssetChange = (index, field, value) => {
    const newAssets = [...assets];
    newAssets[index][field] = value;

    // If brand changes, reset the device selection
    if (field === 'brandId') {
      newAssets[index].deviceId = '';
    }

    setAssets(newAssets);
  };

  const addAsset = () => {
    setAssets([...assets, { brandId: '', deviceId: '', serialNumber: '', complaint: '' }]);

    // Scroll to new asset after a slight delay
    setTimeout(() => {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth',
      });
    }, 100);
  };

  const removeAsset = (index) => {
    if (assets.length <= 1) {
      toast.error('At least one asset is required');
      return;
    }

    setAssets(assets.filter((_, i) => i !== index));
  };

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 gap-6'>
        {assets.map((asset, index) => (
          <AssetRow
            key={index}
            asset={asset}
            index={index}
            onAssetChange={handleAssetChange}
            onRemove={removeAsset}
            allBrands={allBrands}
          />
        ))}
      </div>

      <Button
        variant='outline'
        onClick={addAsset}
        className='w-full border-indigo-500/30 hover:border-indigo-500 hover:bg-indigo-500/10 text-indigo-400 transition-colors'
      >
        <PlusCircle className='h-5 w-5 mr-2' />
        Add Another Device
      </Button>

      {/* Empty state when loading brands */}
      {isLoadingBrands && (
        <div className='flex flex-col items-center justify-center py-12 text-center'>
          <LoaderCircle className='h-10 w-10 animate-spin text-indigo-500 mb-4' />
          <p className='text-slate-400'>Loading device information...</p>
        </div>
      )}

      {/* Empty state when no assets */}
      {assets.length === 0 && !isLoadingBrands && (
        <div className='flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-700 rounded-xl'>
          <div className='bg-slate-800/50 w-16 h-16 rounded-full flex items-center justify-center mb-4'>
            <PlusCircle className='h-8 w-8 text-indigo-500' />
          </div>
          <h3 className='text-lg font-medium text-slate-200 mb-2'>No devices added</h3>
          <p className='text-slate-500 mb-4'>Add your first device to get started</p>
          <Button
            variant='outline'
            onClick={addAsset}
            className='border-indigo-500/30 hover:border-indigo-500 hover:bg-indigo-500/10 text-indigo-400'
          >
            <PlusCircle className='h-4 w-4 mr-2' />
            Add First Device
          </Button>
        </div>
      )}
    </div>
  );
};

export default AssetIntakeForm;
