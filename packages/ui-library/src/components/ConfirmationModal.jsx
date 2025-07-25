import { ShieldAlert } from "lucide-react";
import { Button } from "./Button";
import Modal from "./Modal";

/**
 * A generic, reusable modal for critical user confirmations.
 */
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message,
  confirmText = "Confirm",
  isConfirming = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="text-center">
        <ShieldAlert className="mx-auto h-12 w-12 text-amber-400" />
        <p className="mt-4 text-slate-300">{message}</p>
      </div>
      <div className="mt-6 flex justify-end space-x-4">
        <Button variant="outline" onClick={onClose} disabled={isConfirming}>
          Cancel
        </Button>
        <Button variant="destructive" onClick={onConfirm} disabled={isConfirming}>
          {isConfirming ? "Processing..." : confirmText}
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
