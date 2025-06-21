import React from "react";
import { toast } from "react-hot-toast";
import { tenantProfileService } from "../services/api";

import CompanyProfileForm from "../components/settings/CompanyProfileForm";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "ui-library";
import useAuth from "../context/useAuth";

const CompanyProfilePage = () => {
  // We get the initial profile data from our auth context
  const { tenantProfile, refreshSession } = useAuth(); // Assume refreshSession exists to update context

  const handleSave = async (formData) => {
    // formData here would contain companyName and the companyProfile object
    try {
      await toast.promise(tenantProfileService.updateMyProfile(formData), {
        loading: "Saving profile...",
        success: "Company profile updated successfully!",
        error: (err) => err.response?.data?.error || "Failed to save profile.",
      });
      // After successful save, refresh the auth context to get the latest data
      if (refreshSession) await refreshSession();
    } catch (error) {
      console.error("Save failed:", error);
    }
  };

  if (!tenantProfile) {
    return <p>Loading profile...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Company Profile & Settings</h1>
        <p className="mt-1 text-slate-400">
          Manage your main business information and branding.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
          <CardDescription>
            This information may appear on your invoices and receipts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CompanyProfileForm
            currentProfile={tenantProfile}
            onSave={handleSave}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyProfilePage;
