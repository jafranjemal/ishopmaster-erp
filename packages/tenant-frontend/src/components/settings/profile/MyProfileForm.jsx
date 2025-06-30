import React, { useState, useEffect } from "react";
import { Button, Input, Label, Card, CardContent, CardHeader, CardTitle } from "ui-library";

const MyProfileForm = ({ user, onSave, isSaving }) => {
  const [name, setName] = useState("");
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  useEffect(() => {
    if (user) {
      setName(user.name);
    }
  }, [user]);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { name };
    if (passwordData.newPassword) {
      if (passwordData.newPassword !== passwordData.confirmNewPassword) {
        alert("New passwords do not match."); // In a real app, use a proper error message component
        return;
      }
      payload.currentPassword = passwordData.currentPassword;
      payload.newPassword = passwordData.newPassword;
    }
    onSave(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Personal Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="name">Display Name</Label>
            <Input id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              placeholder="Leave blank to keep current password"
            />
          </div>
          <div>
            <Label htmlFor="newPassword">New Password</Label>
            <Input id="newPassword" name="newPassword" type="password" value={passwordData.newPassword} onChange={handlePasswordChange} />
          </div>
          <div>
            <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
            <Input
              id="confirmNewPassword"
              name="confirmNewPassword"
              type="password"
              value={passwordData.confirmNewPassword}
              onChange={handlePasswordChange}
            />
          </div>
        </CardContent>
      </Card>

      <div className="pt-4 flex justify-end">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Profile Changes"}
        </Button>
      </div>
    </form>
  );
};

export default MyProfileForm;
