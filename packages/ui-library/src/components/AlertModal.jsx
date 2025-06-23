import React from "react";
import Modal from "./Modal";
import Button from "./Button";
import { AlertTriangle } from "lucide-react";

/**
 * A specialized modal for displaying alerts and confirmation messages.
 * @param {object} props
 * @param {boolean} props.isOpen - Whether the modal is visible.
 * @param {function} props.onClose - Function to call when the modal should be closed.
 * @param {string} props.title - The title of the alert.
 * @param {string} props.message - The main message/body of the alert.
 */
export const AlertModal = ({ isOpen, onClose, title, message }) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <AlertTriangle className="h-12 w-12 text-amber-400" />
        </div>
        <p className="text-slate-300">{message}</p>
      </div>
      <div className="mt-6 flex justify-center">
        <Button onClick={onClose}>OK</Button>
      </div>
    </Modal>
  );
};

export default AlertModal;
