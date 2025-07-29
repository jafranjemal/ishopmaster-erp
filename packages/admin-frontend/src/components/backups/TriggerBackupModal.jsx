import { Loader2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Button, Label, Modal, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "ui-library";

const TriggerBackupModal = ({ isOpen, onClose, onConfirm, isTriggering, tenants }) => {
  const [selectedTenant, setSelectedTenant] = useState("");

  const handleConfirm = () => onConfirm(selectedTenant);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Trigger Manual Backup">
      <div className="space-y-4">
        <p className="text-sm text-slate-400">Select a tenant to create an immediate backup</p>

        <TenantSelector tenants={tenants} selectedTenant={selectedTenant} onSelect={setSelectedTenant} />
      </div>

      <ModalActions onClose={onClose} onConfirm={handleConfirm} isTriggering={isTriggering} isDisabled={!selectedTenant} />
    </Modal>
  );
};

const TenantSelector = ({ tenants, selectedTenant, onSelect }) => (
  <div>
    <Label htmlFor="tenant-select">Tenant</Label>
    <Select value={selectedTenant} onValueChange={onSelect}>
      <SelectTrigger id="tenant-select">
        <SelectValue placeholder="Select a tenant..." />
      </SelectTrigger>
      <SelectContent>
        {tenants.map((tenant) => (
          <SelectItem key={tenant._id} value={tenant._id}>
            {tenant.companyName} ({tenant.subdomain})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

const ModalActions = ({ onClose, onConfirm, isTriggering, isDisabled }) => (
  <div className="mt-6 flex justify-end space-x-4">
    <Button variant="outline" onClick={onClose} disabled={isTriggering}>
      Cancel
    </Button>
    <Button onClick={onConfirm} disabled={isTriggering || isDisabled}>
      {isTriggering ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <ShieldCheck size={16} className="mr-2" />}
      Confirm & Start Backup
    </Button>
  </div>
);

export default TriggerBackupModal;
