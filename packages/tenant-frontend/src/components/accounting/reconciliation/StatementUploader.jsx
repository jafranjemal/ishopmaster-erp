import React, { useState, useMemo } from 'react';
import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'ui-library';
import FileUploader from 'ui-library/components/FileUploader'; // Assuming this is the path to your uploader
import { tenantUploadService } from '../../../services/api';
import { toast } from 'react-hot-toast';
import { FileCheck2 } from 'lucide-react';

/**
 * The definitive form for uploading a bank statement.
 * It uses the cloud-based FileUploader and submits a URL to the backend.
 */
const StatementUploader = ({ accounts, onUpload, isUploading }) => {
  // State for the form fields
  const [fileUrl, setFileUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [accountId, setAccountId] = useState('');
  const [statementDate, setStatementDate] = useState(new Date().toISOString().split('T')[0]);

  const bankAndCashAccounts = useMemo(
    () => accounts.filter((a) => a.subType === 'Bank' || a.subType === 'Cash'),
    [accounts],
  );

  const handleUploadComplete = (uploadedFiles) => {
    if (uploadedFiles && uploadedFiles.length > 0) {
      // Store the secure URL and name from the upload service (e.g., Cloudinary)
      setFileUrl(uploadedFiles[0].url);
      setFileName(uploadedFiles[0].name);
      toast.success('File uploaded successfully. Ready to process.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fileUrl || !accountId || !statementDate) {
      toast.error('Please select an account, date, and upload a file.');
      return;
    }
    // The payload is now a clean JSON object with the URL, not a FormData object.
    const payload = {
      fileUrl,
      accountId,
      statementDate,
    };
    onUpload(payload);
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-6 max-w-lg mx-auto p-8 bg-slate-800 rounded-lg'>
      <div>
        <Label htmlFor='accountId'>Bank/Cash Account</Label>
        <Select onValueChange={setAccountId} value={accountId} required>
          <SelectTrigger id='accountId'>
            <SelectValue placeholder='Select account to reconcile...' />
          </SelectTrigger>
          <SelectContent>
            {bankAndCashAccounts.map((a) => (
              <SelectItem key={a._id} value={a._id}>
                {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor='statementDate'>Statement End Date</Label>
        <Input
          id='statementDate'
          type='date'
          value={statementDate}
          onChange={(e) => setStatementDate(e.target.value)}
          required
        />
      </div>
      <div>
        <Label>Upload Statement File (CSV)</Label>
        {fileName ? (
          <div className='flex items-center justify-between p-3 bg-slate-700 rounded-md'>
            <div className='flex items-center gap-2'>
              <FileCheck2 className='h-5 w-5 text-green-400' />
              <span className='text-sm font-medium'>{fileName}</span>
            </div>
            <Button
              variant='link'
              size='sm'
              onClick={() => {
                setFileName('');
                setFileUrl('');
              }}
            >
              Change File
            </Button>
          </div>
        ) : (
          <FileUploader
            onUploadComplete={handleUploadComplete}
            getSignatureFunc={tenantUploadService.getCloudinarySignature}
            multiple={false}
          />
        )}
      </div>
      <div className='pt-4 flex justify-end'>
        <Button type='submit' disabled={isUploading || !fileUrl}>
          {isUploading ? 'Processing...' : 'Upload & Process Statement'}
        </Button>
      </div>
    </form>
  );
};

export default StatementUploader;
