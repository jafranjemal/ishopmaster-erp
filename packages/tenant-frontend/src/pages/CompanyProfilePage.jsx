import React, { useState } from "react";
import { toast } from "react-hot-toast";

import CompanyProfileForm from "../components/settings/CompanyProfileForm";
import { tenantProfileService } from "../services/api";
import useAuth from "../context/useAuth";

const CompanyProfilePage = () => {
  const { tenantProfile, refreshTenantProfile } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (formData) => {
    setIsSaving(true);
    try {
      await toast.promise(tenantProfileService.updateCompanyProfile(formData), {
        loading: "Saving company profile...",
        success: "Profile updated successfully!",
        error: (err) => err.response?.data?.error || "Failed to save profile.",
      });
      // After a successful save, refresh the global context to get the new data
      await refreshTenantProfile();
    } catch (error) {
      console.log(error);
      // Error is handled by the toast
    } finally {
      setIsSaving(false);
    }
  };

  if (!tenantProfile) {
    return <div className="p-8 text-center">Loading company profile...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Company Profile</h1>
        <p className="mt-1 text-slate-400">Manage your business's legal name, address, logo, and other details.</p>
      </div>
      <CompanyProfileForm profile={tenantProfile} onSave={handleSave} isSaving={isSaving} />
    </div>
  );
};
export default CompanyProfilePage;
