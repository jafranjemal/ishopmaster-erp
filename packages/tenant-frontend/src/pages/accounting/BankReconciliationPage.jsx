import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { tenantReconciliationService, tenantAccountingService } from '../../services/api';
import StatementUploader from '../../components/accounting/reconciliation/StatementUploader';
import ReconciliationView from '../../components/accounting/reconciliation/ReconciliationView';
import { Button } from 'ui-library';
import { RefreshCw } from 'lucide-react';

const BankReconciliationPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [activeStatement, setActiveStatement] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    tenantAccountingService.getAllAccounts({ type: 'Asset' }).then((res) => setAccounts(res.data.data));
  }, []);

  const handleUpload = async (payload) => {
    setIsUploading(true);
    try {
      const res = await toast.promise(tenantReconciliationService.uploadStatement(payload), {
        loading: 'Processing statement...',
        success: 'Statement processed!',
        error: 'Upload failed.',
      });
      const statement = res.data.data;
      setActiveStatement(statement);
      const suggestionsRes = await tenantReconciliationService.getSuggestions(statement._id);
      setSuggestions(suggestionsRes.data.data);
    } catch (error) {
      /* Handled by toast */
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmMatch = async (statementLineId, ledgerEntryIds) => {
    setIsConfirming(true);
    try {
      await toast.promise(
        tenantReconciliationService.confirmMatch({ statementId: activeStatement._id, statementLineId, ledgerEntryIds }),
        { loading: 'Confirming match...', success: 'Match reconciled!', error: 'Confirmation failed.' },
      );
      // Refresh data after confirming
      const [statementRes, suggestionsRes] = await Promise.all([
        // In a real app, you'd have a getById for statements
        // For now, we just refetch suggestions
        tenantReconciliationService.getSuggestions(activeStatement._id),
        // A bit inefficient, but we'll refetch the whole statement to update status
        // This would be replaced by a dedicated getById call
      ]);
      // This is a mock refresh of the statement line status
      setActiveStatement((prev) => ({
        ...prev,
        lines: prev.lines.map((l) => (l._id === statementLineId ? { ...l, status: 'matched' } : l)),
      }));
      setSuggestions(suggestionsRes.data.data);
    } catch (error) {
      /* Handled by toast */
    } finally {
      setIsConfirming(false);
    }
  };

  const handleStartNew = () => {
    setActiveStatement(null);
    setSuggestions([]);
  };

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-3xl font-bold'>Bank Reconciliation</h1>
        {activeStatement && (
          <Button variant='outline' onClick={handleStartNew}>
            <RefreshCw className='h-4 w-4 mr-2' />
            Start New Reconciliation
          </Button>
        )}
      </div>
      {!activeStatement ? (
        <StatementUploader accounts={accounts} onUpload={handleUpload} isUploading={isUploading} />
      ) : (
        <ReconciliationView
          statement={activeStatement}
          suggestions={suggestions}
          onConfirmMatch={handleConfirmMatch}
          isConfirming={isConfirming}
        />
      )}
    </div>
  );
};
export default BankReconciliationPage;
