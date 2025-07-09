import React, { useState, useEffect } from "react";
import ModuleToggles from "./ModuleToggles";
import { Button, Card, Input, Label } from "../../../../ui-library/src";
import { Eye, EyeOff } from "lucide-react"; // optional icons if you're using Lucide

// Adjust the import path based on your project structure
// We import all our UI building blocks from the shared library

/**
 * A comprehensive form for both creating and editing a Tenant.
 * @param {object} props
 * @param {object} [props.tenantToEdit] - If provided, the form will be in "Edit" mode.
 * @param {Function} props.onComplete - A callback function to run after a successful submission (e.g., to close a modal and refetch data).
 */
const TenantForm = ({ tenantToEdit, availableModules = [], onSave, onCancel }) => {
  const initialFormData = React.useMemo(
    () => ({
      // companyName: "",
      // subdomain: "",
      // licenseExpiry: "",
      // adminEmail: "",
      // adminPassword: "",
      // enabledModules: ["pos", "inventory"], // Sensible default for new tenants

      tenantInfo: {
        companyName: "",
        subdomain: "",
        licenseExpiry: "",
        enabledModules: ["pos", "inventory"],
      },
      primaryBranch: { name: "", address: { city: "" } },
      owner: { name: "", email: "", password: "" },
    }),
    []
  );

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState(initialFormData);
  const [isSaving, setIsSaving] = useState(false);
  const isEditMode = Boolean(tenantToEdit);

  useEffect(() => {
    if (isEditMode && tenantToEdit) {
      setFormData({
        tenantInfo: {
          companyName: tenantToEdit.companyName || "",
          subdomain: tenantToEdit.subdomain || "",
          licenseExpiry: tenantToEdit.licenseExpiry ? new Date(tenantToEdit.licenseExpiry).toISOString().split("T")[0] : "",
          enabledModules: tenantToEdit.enabledModules || [],
        },
        primaryBranch: {}, // Not editable here
        owner: {}, // Not editable here
      });
    } else {
      setFormData(initialFormData);
    }
  }, [tenantToEdit, isEditMode, initialFormData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const keys = name.split(".");

    setFormData((prev) => {
      const newData = { ...prev };
      let current = newData;

      // Navigate and build nested structure
      keys.forEach((key, index) => {
        if (index === keys.length - 1) {
          current[key] = value; // Set value at last key
        } else {
          current[key] = { ...current[key] }; // Ensure immutability
          current = current[key];
        }
      });

      return newData;
    });
  };

  const handleModuleChange = (newModules) => {
    setFormData((prev) => ({
      ...prev,
      tenantInfo: { ...prev.tenantInfo, enabledModules: newModules },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    // onSave now receives the full, nested object
    const error = await onSave(isEditMode ? formData.tenantInfo : formData);
    if (error) setIsSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Section 1: Company Details */}
      <div className="flex items-center justify-start space-x-4 mb-6">
        <div>
          <Card>
            <div className="p-6 space-y-6">
              <h3 className="font-semibold text-lg">1. Company Details</h3>
              <div>
                <Label>Company Name</Label>
                <Input name="tenantInfo.companyName" value={formData.tenantInfo.companyName} onChange={handleChange} required />
              </div>
              <div>
                <Label>Subdomain</Label>

                <div className="mt-1 flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-600 bg-gray-600 text-gray-300 sm:text-sm">
                    https://
                  </span>
                  <input
                    type="text"
                    id="subdomain"
                    name="tenantInfo.subdomain"
                    value={formData.tenantInfo.subdomain}
                    onChange={handleChange}
                    disabled={isEditMode}
                    pattern="^[a-z0-9-]+$"
                    title="Only lowercase letters, numbers, and hyphens are allowed."
                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md bg-gray-700 border-gray-600 text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="your-shop-name"
                  />
                </div>
              </div>
              <div>
                <Label>License Expiry</Label>
                <Input name="tenantInfo.licenseExpiry" type="date" value={formData.tenantInfo.licenseExpiry} onChange={handleChange} required />
              </div>
              <ModuleToggles
                selectedModules={formData.tenantInfo.enabledModules}
                onSelectionChange={handleModuleChange}
                availableModules={availableModules}
              />
            </div>
          </Card>
        </div>
        <div>
          {/* Section 2 & 3: Only for Create Mode */}
          {!isEditMode && (
            <>
              <Card>
                <div className="p-6 space-y-4">
                  <h3 className="font-semibold text-lg">2. Primary Branch Information</h3>
                  <div>
                    <Label>Branch Name</Label>
                    <Input
                      name="primaryBranch.name"
                      value={formData.primaryBranch.name}
                      onChange={handleChange}
                      required
                      placeholder="e.g., Main Store"
                    />
                  </div>
                  <div>
                    <Label>City</Label>

                    <Input
                      name="primaryBranch.address.city"
                      value={formData.primaryBranch.address.city}
                      onChange={handleChange}
                      placeholder="e.g., Colombo"
                      required
                    />
                  </div>
                </div>
              </Card>

              <Card>
                <div className="p-6 space-y-6">
                  <h3 className="font-semibold text-lg">3. Owner Account</h3>
                  <div>
                    <Label>Owner Full Name</Label>
                    <Input name="owner.name" value={formData.owner.name} onChange={handleChange} required />
                  </div>
                  <div>
                    <Label>Owner Email</Label>
                    <Input name="owner.email" type="email" value={formData.owner.email} onChange={handleChange} required />
                  </div>
                  <div className="relative">
                    <Label>Password</Label>
                    <Input
                      name="owner.password"
                      type={showPassword ? "text" : "password"}
                      value={formData.owner.password}
                      onChange={handleChange}
                      required
                      minLength="6"
                      className="pr-10" // Add space for the icon/button
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-2 top-8 text-slate-400 hover:text-white"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="pt-4 flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{isSaving ? "Saving..." : isEditMode ? "Save Changes" : "Create Tenant"}</Button>
      </div>
    </form>
  );
};

export default TenantForm;
