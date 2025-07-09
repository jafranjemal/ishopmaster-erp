import React, { useState, useMemo } from "react";
import { Modal, Button, Input, Checkbox } from "ui-library";
import { Search } from "lucide-react";

const AssignCustomerModal = ({ isOpen, onClose, onAssign, allCustomers, groupMembers }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomerIds, setSelectedCustomerIds] = useState([]);

  const availableCustomers = useMemo(() => {
    const memberIds = new Set(groupMembers.map((m) => m._id));
    return allCustomers.filter((c) => !memberIds.has(c._id) && c.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [allCustomers, groupMembers, searchTerm]);

  const handleToggle = (customerId) => {
    setSelectedCustomerIds((prev) => (prev.includes(customerId) ? prev.filter((id) => id !== customerId) : [...prev, customerId]));
  };

  const handleAssign = () => {
    onAssign(selectedCustomerIds);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign Customers to Group">
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Search available customers..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
        </div>

        <div className="border border-slate-700 rounded-lg max-h-80 overflow-y-auto p-2 space-y-1">
          {availableCustomers.map((customer) => (
            <label key={customer._id} className="flex items-center space-x-3 p-2 rounded hover:bg-slate-700/50 cursor-pointer">
              <Checkbox
                id={`cust-${customer._id}`}
                checked={selectedCustomerIds.includes(customer._id)}
                onCheckedChange={() => handleToggle(customer._id)}
              />
              <span>{customer.name}</span>
            </label>
          ))}
        </div>
        <div className="pt-4 flex justify-end">
          <Button onClick={handleAssign} disabled={selectedCustomerIds.length === 0}>
            Assign Selected
          </Button>
        </div>
      </div>
    </Modal>
  );
};
export default AssignCustomerModal;
