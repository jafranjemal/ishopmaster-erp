import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { tenantProfileService } from "../../services/api";
import useAuth from "../../context/useAuth";
import MyProfileForm from "../../components/settings/profile/MyProfileForm";

const MyProfilePage = () => {
  const { user, logout } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (formData) => {
    setIsSaving(true);
    try {
      const response = await toast.promise(tenantProfileService.updateMyProfile(formData), {
        loading: "Saving your profile...",
        success: "Profile updated successfully!",
        error: (err) => err.response?.data?.error || "Failed to save profile.",
      });

      // If password was changed, it's good practice to log the user out for security.
      if (formData.newPassword) {
        toast.success("Password changed. Please log in again.");
        logout();
      }
    } catch (error) {
      // Error is handled by the toast
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return <div className="p-8 text-center">Loading your profile...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="mt-1 text-slate-400">Update your personal display name and password.</p>
      </div>
      <div className="max-w-2xl">
        <MyProfileForm user={user} onSave={handleSave} isSaving={isSaving} />
      </div>
    </div>
  );
};

export default MyProfilePage;
