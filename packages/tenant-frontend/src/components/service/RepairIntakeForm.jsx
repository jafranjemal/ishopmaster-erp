import React, { useState, useMemo } from "react";
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "ui-library";
import { User, Smartphone, ClipboardList } from "lucide-react";

const CHECKLIST_ITEMS = [
  { key: "screenCondition", label: "Screen Condition", options: ["Pristine", "Minor Scratches", "Deep Scratches", "Cracked"] },
  { key: "bodyCondition", label: "Body/Housing", options: ["Pristine", "Scuffed", "Dented", "Bent"] },
  { key: "powersOn", label: "Powers On?", options: ["Yes", "No", "Intermittent"] },
  { key: "buttons", label: "All Buttons Functional?", options: ["Yes", "No"] },
  { key: "camera", label: "Camera(s) OK?", options: ["Yes", "No", "Cracked Lens"] },
  { key: "waterDamage", label: "Water Damage Indicator", options: ["Not Tripped", "Tripped"] },
];

const RepairIntakeForm = ({ customers = [], onSave, onCancel, isSaving }) => {
  const initialFormState = {
    customerId: "",
    customerName: "",
    deviceDetails: { type: "", manufacturer: "", model: "", serialNumber: "", passwordOrPattern: "" },
    customerComplaint: "",
    preRepairChecklist: CHECKLIST_ITEMS.reduce((acc, item) => ({ ...acc, [item.key]: item.options[0] }), {}),
  };
  const [formData, setFormData] = useState(initialFormState);
  const [customerSearch, setCustomerSearch] = useState("");

  const filteredCustomers = useMemo(
    () => (customerSearch ? customers.filter((c) => c.name.toLowerCase().includes(customerSearch.toLowerCase())) : []),
    [customerSearch, customers]
  );

  const handleSelectCustomer = (customer) => {
    setFormData((prev) => ({ ...prev, customerId: customer._id, customerName: customer.name }));
    setCustomerSearch("");
  };

  const handleChange = (e, section) => {
    const { name, value } = e.target;
    if (section) {
      setFormData((prev) => ({ ...prev, [section]: { ...prev[section], [name]: value } }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleChecklistChange = (key, value) => {
    setFormData((prev) => ({ ...prev, preRepairChecklist: { ...prev.preRepairChecklist, [key]: value } }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User /> Customer Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          {formData.customerId ? (
            <div className="flex items-center justify-between p-3 bg-slate-800 rounded-md">
              <span className="font-medium">{formData.customerName}</span>
              <Button size="sm" variant="link" onClick={() => setFormData((prev) => ({ ...prev, customerId: "", customerName: "" }))}>
                Change
              </Button>
            </div>
          ) : (
            <div className="relative">
              <Input
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                placeholder="Search for existing customer by name..."
              />
              {filteredCustomers.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {filteredCustomers.map((c) => (
                    <div key={c._id} onClick={() => handleSelectCustomer(c)} className="p-3 hover:bg-indigo-600/20 cursor-pointer">
                      {c.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone /> Device & Complaint
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <Input
              name="type"
              value={formData.deviceDetails.type}
              onChange={(e) => handleChange(e, "deviceDetails")}
              label="Device Type"
              placeholder="e.g., Phone"
            />
            <Input
              name="manufacturer"
              value={formData.deviceDetails.manufacturer}
              onChange={(e) => handleChange(e, "deviceDetails")}
              label="Manufacturer"
              placeholder="e.g., Apple"
            />
            <Input
              name="model"
              value={formData.deviceDetails.model}
              onChange={(e) => handleChange(e, "deviceDetails")}
              label="Model"
              placeholder="e.g., iPhone 14 Pro"
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              name="serialNumber"
              value={formData.deviceDetails.serialNumber}
              onChange={(e) => handleChange(e, "deviceDetails")}
              label="Serial / IMEI"
            />
            <Input
              name="passwordOrPattern"
              value={formData.deviceDetails.passwordOrPattern}
              onChange={(e) => handleChange(e, "deviceDetails")}
              label="Password / Pattern"
            />
          </div>
          <div>
            <Label htmlFor="customerComplaint">Customer's Reported Issue</Label>
            <Input
              as="textarea"
              id="customerComplaint"
              name="customerComplaint"
              value={formData.customerComplaint}
              onChange={handleChange}
              required
            />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList /> Pre-Repair Checklist
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-x-6 gap-y-4">
          {CHECKLIST_ITEMS.map((item) => (
            <div key={item.key}>
              <Label>{item.label}</Label>
              <Select onValueChange={(val) => handleChecklistChange(item.key, val)} value={formData.preRepairChecklist[item.key]}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {item.options.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </CardContent>
      </Card>
      <div className="pt-4 flex justify-end">
        <Button type="submit" disabled={isSaving || !formData.customerId}>
          {isSaving ? "Saving..." : "Create Repair Ticket"}
        </Button>
      </div>
    </form>
  );
};
export default RepairIntakeForm;
