import React from 'react';
import { Mail, Phone, MapPin, PlusCircle, Wrench } from 'lucide-react';
import { Button, Badge } from 'ui-library';
import { QrCode, RotateCw } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from 'ui-library';

/**
 * A presentational component for the top section of the customer profile page.
 */
const CustomerProfileHeader = ({
  activePortalToken,
  handleViewExistingQR,
  handleGenerateNewQR,
  qrCodeSvg,
  customer,
  handleGenerateQR,
}) => {
  if (!customer) return null;

  const addressString = [
    customer.address?.street,
    customer.address?.city,
    customer.address?.state,
    customer.address?.postalCode,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <div className='bg-slate-800 p-6 rounded-lg border border-slate-700'>
      <div className='flex flex-col md:flex-row justify-between items-start'>
        <div>
          <div className='flex items-center gap-4'>
            {qrCodeSvg && (
              <img src={qrCodeSvg} alt='Customer Portal Access QR Code' className='w-24 h-24 bg-white p-2 rounded-lg' />
            )}
            <h1 className='text-3xl font-bold text-white'>{customer.name}</h1>
            <Badge variant={customer.isActive ? 'success' : 'destructive'}>
              {customer.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <div className='mt-4 flex flex-col md:flex-row md:items-center gap-x-6 gap-y-2 text-slate-400 text-sm'>
            {customer.email && (
              <div className='flex items-center'>
                <Mail className='h-4 w-4 mr-2' />
                <span>{customer.email}</span>
              </div>
            )}
            {customer.phone && (
              <div className='flex items-center'>
                <Phone className='h-4 w-4 mr-2' />
                <span>{customer.phone}</span>
              </div>
            )}
            {addressString && (
              <div className='flex items-center'>
                <MapPin className='h-4 w-4 mr-2' />
                <span>{addressString}</span>
              </div>
            )}
          </div>
        </div>
        <div className='flex space-x-2 mt-4 md:mt-0 flex-shrink-0'>
          <Button variant='outline'>
            <Wrench className='mr-2 h-4 w-4' /> New Repair
          </Button>
          <Button>
            <PlusCircle className='mr-2 h-4 w-4' /> New Sale
          </Button>
          {/* <Button variant='outline' onClick={handleGenerateQR}>
            <QrCode className='h-4 w-4 mr-2' />
            Generate Portal Access
          </Button> */}
          <div className='flex items-center gap-2'>
            {activePortalToken && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant='outline' size='icon' onClick={handleViewExistingQR}>
                      <QrCode className='h-4 w-4' />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View Existing Active QR Code</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <Button variant={activePortalToken ? 'secondary' : 'default'} onClick={handleGenerateNewQR}>
              <RotateCw className='h-4 w-4 mr-2' />
              {activePortalToken ? 'Generate New Link' : 'Generate Portal Access'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfileHeader;
