import React, { useState, useEffect } from "react";
import { tenantService } from "../../services/api";
import { toast } from "react-hot-toast";
import ModuleToggles from "./ModuleToggles";
import { Modal, Input, Label, Button } from "ui-library";

const EditTenantModal = ({ tenant, isOpen, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({ companyName: "", subdomain: "" });
  const [enabledModules, setEnabledModules] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (tenant) {
      setFormData({
        companyName: tenant.companyName,
        subdomain: tenant.subdomain,
      });
      setEnabledModules(tenant.enabledModules || []);
    }
  }, [tenant]);

  const handleSave = async () => {
    setIsSaving(true);
    const detailsPromise = tenantService.updateDetails(tenant._id, formData);
    const modulesPromise = tenantService.updateModules(
      tenant._id,
      enabledModules
    );

    try {
      await toast.promise(Promise.all([detailsPromise, modulesPromise]), {
        loading: "Saving tenant...",
        success: "Tenant updated successfully!",
        error: "Failed to update tenant.",
      });
      onUpdate(); // Callback to parent to refetch data
      onClose();
    } catch (error) {
      // Toast promise handles the error message
      console.error("Failed to save tenant:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Tenant">
      <div className="space-y-6">
        <div>
          <Label htmlFor="companyName">Company Name</Label>
          <Input
            id="companyName"
            value={formData.companyName}
            onChange={(e) =>
              setFormData({ ...formData, companyName: e.target.value })
            }
          />
        </div>
        {/* ... other general fields ... */}
        <hr className="border-slate-700" />
        <ModuleToggles
          selectedModules={enabledModules}
          onSelectionChange={setEnabledModules}
        />
      </div>
      <div className="mt-8 flex justify-end space-x-4">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </Modal>
  );
};

export default EditTenantModal;
