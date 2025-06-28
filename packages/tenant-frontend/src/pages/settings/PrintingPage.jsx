import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { tenantLabelTemplateService } from "../../services/api";
import { Button, Modal, Card, CardContent } from "ui-library";
import { PlusCircle, ShieldAlert } from "lucide-react";
import LabelTemplateList from "../../components/settings/printing/LabelTemplateList";
import LabelTemplateForm from "../../components/settings/printing/LabelTemplateForm";

const PrintingPage = () => {
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await tenantLabelTemplateService.getAll();
      setTemplates(response.data.data);
    } catch (error) {
      toast.error("Failed to fetch label templates.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async (formData) => {
    setIsSaving(true);
    try {
      const response = await toast.promise(
        tenantLabelTemplateService.create(formData),
        {
          loading: "Creating new template...",
          success: "Template created successfully! Redirecting to designer...",
          error: (err) =>
            err.response?.data?.error || "Failed to create template.",
        }
      );
      // On success, automatically navigate to the designer page for the new template
      if (response.data.success) {
        navigate(`/settings/printing/${response.data.data._id}`);
      }
    } catch (error) {
      /* handled by toast */
    } finally {
      setIsSaving(false);
      setIsModalOpen(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await toast.promise(
        tenantLabelTemplateService.delete(deleteConfirm._id),
        {
          loading: `Deleting "${deleteConfirm.name}"...`,
          success: "Template deleted.",
          error: (err) =>
            err.response?.data?.error || "Failed to delete template.",
        }
      );
      fetchData();
    } catch (error) {
      /* handled by toast */
    } finally {
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Label & Print Settings</h1>
          <p className="mt-1 text-slate-400">
            Design and manage custom label templates for your products.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> New Template
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="p-8 text-center text-slate-400">
              Loading templates...
            </p>
          ) : (
            <LabelTemplateList
              templates={templates}
              onDelete={setDeleteConfirm}
            />
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Label Template"
      >
        <LabelTemplateForm
          onSave={handleSave}
          onCancel={() => setIsModalOpen(false)}
          isSaving={isSaving}
        />
      </Modal>

      <Modal
        isOpen={Boolean(deleteConfirm)}
        onClose={() => setDeleteConfirm(null)}
        title="Confirm Deletion"
      >
        <div className="text-center">
          <ShieldAlert className="mx-auto h-12 w-12 text-red-500" />
          <p className="mt-4">
            Are you sure you want to delete the template "{deleteConfirm?.name}
            "?
          </p>
          <p className="text-sm text-slate-400 mt-2">
            This action cannot be undone.
          </p>
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete Template
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default PrintingPage;
