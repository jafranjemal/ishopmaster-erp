import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { tenantProfileService } from "../../services/api";

import LocalizationForm from "../../components/settings/LocalizationForm";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "ui-library";
import useAuth from "../../context/useAuth";

const LocalizationPage = () => {
  // We get the profile and a function to refresh it from our auth context
  const { refreshTenantProfile, tenantProfile, loadSession, token } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (formData) => {
    setIsSaving(true);
    try {
      await toast.promise(tenantProfileService.updateLocalization(formData), {
        loading: "Saving localization settings...",
        success: "Settings updated successfully!",
        error: (err) => err.response?.data?.error || "Failed to save settings.",
      });
      // After successful save, refresh the auth context to get the latest data app-wide
      //if (loadSession) await loadSession(token);
      await refreshTenantProfile();
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!tenantProfile) {
    return <p>Loading settings...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Localization & Currency</h1>
        <p className="mt-1 text-slate-400">
          Manage your business's default language, currency, and timezone.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Global Settings</CardTitle>
          <CardDescription>
            These settings affect how numbers, dates, and currency are displayed
            across the app.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LocalizationForm
            currentSettings={tenantProfile.settings.localization}
            onSave={handleSave}
            isSaving={isSaving}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default LocalizationPage;
