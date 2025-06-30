import React, { useState, useEffect } from "react";
import { Button, Input, Label, Card, CardContent, CardHeader, CardTitle } from "ui-library";
import FileUploader from "ui-library/components/FileUploader";
import { tenantUploadService } from "../../services/api";

const CompanyProfileForm = ({ profile, onSave, isSaving }) => {
  const [formData, setFormData] = useState({
    companyName: "",
    companyProfile: {
      address: { street: "", city: "", state: "", postalCode: "", country: "" },
      socialHandles: { facebook: "", instagram: "", x_twitter: "", linkedin: "" },
      phone: "",
      email: "",
      registrationNumber: "",
      taxId: "",
      logoUrl: "",
    },
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        companyName: profile.companyName || "",
        companyProfile: {
          ...initialFormData.companyProfile,
          ...profile.companyProfile,
          address: {
            ...initialFormData.companyProfile?.address,
            ...profile.companyProfile?.address,
          },
        },
      });
    }
  }, [profile]);

  const handleSocialChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      companyProfile: {
        ...prev.companyProfile,
        socialHandles: {
          ...prev.companyProfile.socialHandles,
          [name]: value,
        },
      },
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, companyProfile: { ...prev.companyProfile, [name]: value } }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, companyProfile: { ...prev.companyProfile, address: { ...prev.companyProfile.address, [name]: value } } }));
  };

  const handleLogoUpload = (files) => {
    // Assuming single logo upload for now
    const logoUrl = files.length > 0 ? files[0].url : "";
    setFormData((prev) => ({ ...prev, companyProfile: { ...prev.companyProfile, logoUrl } }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const initialFormData = {
    /* as defined above */
  }; // For reset logic if needed

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Company Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="companyName">Company Name</Label>
            <Input id="companyName" name="companyName" value={formData.companyName} onChange={handleChange} required />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="registrationNumber">Registration Number</Label>
              <Input
                id="registrationNumber"
                name="registrationNumber"
                value={formData.companyProfile.registrationNumber}
                onChange={handleProfileChange}
              />
            </div>
            <div>
              <Label htmlFor="taxId">Tax ID (VAT/GST)</Label>
              <Input id="taxId" name="taxId" value={formData.companyProfile.taxId} onChange={handleProfileChange} />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Company Phone</Label>
              <Input id="phone" name="phone" type="tel" value={formData.companyProfile.phone} onChange={handleProfileChange} />
            </div>
            <div>
              <Label htmlFor="email">Company Email</Label>
              <Input id="email" name="email" type="email" value={formData.companyProfile.email} onChange={handleProfileChange} />
            </div>
          </div>
          <div>
            <Label>Address</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
              <Input name="street" placeholder="Street" value={formData.companyProfile.address.street} onChange={handleAddressChange} />
              <Input name="city" placeholder="City" value={formData.companyProfile.address.city} onChange={handleAddressChange} />
              <Input name="state" placeholder="State / Province" value={formData.companyProfile.address.state} onChange={handleAddressChange} />
              <Input name="postalCode" placeholder="Postal Code" value={formData.companyProfile.address.postalCode} onChange={handleAddressChange} />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Company Logo</CardTitle>
        </CardHeader>
        <CardContent>
          <FileUploader
            initialFiles={formData.companyProfile.logoUrl ? [{ name: "Company Logo", url: formData.companyProfile.logoUrl }] : []}
            onUploadComplete={handleLogoUpload}
            getSignatureFunc={tenantUploadService.getCloudinarySignature}
            multiple={false} // Only allow one logo
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Social Media & Web Presence</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="facebook">Facebook URL</Label>
              <Input
                id="facebook"
                name="facebook"
                value={formData.companyProfile?.socialHandles?.facebook}
                onChange={handleSocialChange}
                placeholder="e.g., https://facebook.com/yourpage"
              />
            </div>
            <div>
              <Label htmlFor="instagram">Instagram Handle</Label>
              <Input
                id="instagram"
                name="instagram"
                value={formData.companyProfile?.socialHandles?.instagram}
                onChange={handleSocialChange}
                placeholder="e.g., @yourhandle"
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="x_twitter">X (Twitter) Handle</Label>
              <Input
                id="x_twitter"
                name="x_twitter"
                value={formData.companyProfile?.socialHandles?.x_twitter}
                onChange={handleSocialChange}
                placeholder="e.g., @yourhandle"
              />
            </div>
            <div>
              <Label htmlFor="linkedin">LinkedIn URL</Label>
              <Input
                id="linkedin"
                name="linkedin"
                value={formData.companyProfile?.socialHandles?.linkedin}
                onChange={handleSocialChange}
                placeholder="e.g., https://linkedin.com/company/yourpage"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="pt-4 flex justify-end">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
};
export default CompanyProfileForm;
