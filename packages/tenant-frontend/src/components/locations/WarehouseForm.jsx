import React, { useState, useEffect } from "react";

// We import all our UI building blocks from the shared library
import { Button } from "ui-library";
import { Input } from "ui-library";
import { Label } from "ui-library";

/**
 * A controlled form component for creating or editing warehouses.
 * The actual API call is handled by the `onSave` prop passed by the parent.
 * @param {object} props
 * @param {object} [props.warehouseToEdit] - If provided, the form will be in "Edit" mode.
 * @param {Function} props.onSave - Async function to handle the form submission. It receives the form data.
 * @param {Function} props.onCancel - Function to call to close the modal.
 */
const WarehouseForm = ({ warehouseToEdit, onSave, onCancel }) => {
  // Define the full structure for the form's state
  const initialFormData = {
    name: "",
    isPrimary: false,
    address: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
    },
  };

  const [formData, setFormData] = useState(initialFormData);
  const [isSaving, setIsSaving] = useState(false);
  const isEditMode = Boolean(warehouseToEdit);

  // Use useEffect to populate the form when the warehouseToEdit prop is available
  useEffect(() => {
    if (isEditMode && warehouseToEdit) {
      setFormData({
        name: warehouseToEdit.name || "",
        isPrimary: warehouseToEdit.isPrimary || false,
        address: {
          street: warehouseToEdit.address?.street || "",
          city: warehouseToEdit.address?.city || "",
          state: warehouseToEdit.address?.state || "",
          postalCode: warehouseToEdit.address?.postalCode || "",
        },
      });
    } else {
      // Reset form for "Create" mode
      setFormData(initialFormData);
    }
  }, [warehouseToEdit, isEditMode]);

  // A generic handler to update form state, handling nested address object
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    // The onSave function is passed from the parent page and handles the API call
    const error = await onSave("warehouse", formData);
    // If there was an error, the parent toast will show it, and we just re-enable the form.
    if (error) {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Warehouse Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex items-center space-x-2 pt-2">
          <input
            id="isPrimary"
            name="isPrimary"
            type="checkbox"
            checked={formData.isPrimary}
            onChange={handleChange}
            className="h-4 w-4 rounded border-slate-500 bg-slate-600 text-indigo-600 focus:ring-indigo-500"
          />
          <Label htmlFor="isPrimary" className="mb-0">
            Set as Primary Warehouse
          </Label>
        </div>

        <hr className="border-slate-700 !mt-6" />

        <h4 className="text-sm font-medium text-slate-300">Address Details</h4>

        <div>
          <Label htmlFor="address.street">Street</Label>
          <Input
            id="address.street"
            name="address.street"
            value={formData.address.street}
            onChange={handleChange}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="address.city">City</Label>
            <Input
              id="address.city"
              name="address.city"
              value={formData.address.city}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="address.state">State / Province</Label>
            <Input
              id="address.state"
              name="address.state"
              value={formData.address.state}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      <div className="pt-4 flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Warehouse"}
        </Button>
      </div>
    </form>
  );
};

export default WarehouseForm;
