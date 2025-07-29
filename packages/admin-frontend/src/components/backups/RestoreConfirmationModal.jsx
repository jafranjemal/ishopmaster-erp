import { Loader2, ShieldAlert } from "lucide-react";
import { Button, Modal } from "ui-library";

const RestoreConfirmationModal = ({ isOpen, onClose, onConfirm, isRestoring, backupDetails }) => {
  if (!backupDetails) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Database Restore">
      <div className="text-center">
        <ShieldAlert className="mx-auto h-16 w-16 text-red-500" />
        <h3 className="mt-4 text-xl font-bold text-white">This is a destructive action.</h3>
        <p className="mt-2 text-slate-300">
          You are about to restore the database for tenant: <br />
          <strong className="text-cyan-400">{backupDetails.tenant.companyName}</strong>
        </p>
        <p className="mt-4 text-sm bg-slate-900 p-3 rounded-md">
          All data created after <strong className="text-amber-400">{new Date(backupDetails.createdAt).toLocaleString()}</strong> will be permanently
          lost. This action cannot be undone.
        </p>
      </div>
      <div className="mt-6 flex justify-end space-x-4">
        <Button variant="outline" onClick={onClose} disabled={isRestoring}>
          Cancel
        </Button>
        <Button variant="destructive" onClick={onConfirm} disabled={isRestoring}>
          {isRestoring ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}I understand, Restore Database
        </Button>
      </div>
    </Modal>
  );
};

export default RestoreConfirmationModal;
