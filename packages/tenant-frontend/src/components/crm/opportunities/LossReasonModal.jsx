import React, { useState } from "react";
import { Modal, Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Label } from "ui-library";

const LOSS_REASONS = ["Price Too High", "Lost to Competitor", "Bad Timing / No Budget", "Missing Features"];

const LossReasonModal = ({ isOpen, onClose, onConfirm }) => {
  const [reason, setReason] = useState("");
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Opportunity Loss">
      <div className="space-y-4">
        <Label>Please select a reason for losing this opportunity.</Label>
        <Select onValueChange={setReason} value={reason} required>
          <SelectTrigger>
            <SelectValue placeholder="Select a loss reason..." />
          </SelectTrigger>
          <SelectContent>
            {LOSS_REASONS.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="pt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={() => onConfirm(reason)} disabled={!reason}>
            Confirm Loss
          </Button>
        </div>
      </div>
    </Modal>
  );
};
export default LossReasonModal;
