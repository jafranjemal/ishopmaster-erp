import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { Modal, Button, FileUploader } from "ui-library"; // Using your FileUploader
import { Loader2, Save } from "lucide-react";
import { tenantUploadService, tenantProductService } from "../../services/api";

/**
 * @desc A modal that uses the shared FileUploader component to manage
 * a specific product variant's images.
 */
const VariantImageManager = ({ isOpen, onClose, variant, onUploadSuccess }) => {
  const [isSaving, setIsSaving] = useState(false);
  // The local state for the list of files, initialized from the variant prop
  const [currentFiles, setCurrentFiles] = useState(variant.images || []);

  // This function will be passed to the FileUploader.
  // It gets the secure signature from our backend.
  const getSignatureForUpload = async () => {
    const response = await tenantUploadService.getCloudinarySignature();
    // The FileUploader expects the data in a specific format
    return { data: response.data.data };
  };

  // This function is called by the FileUploader whenever the list of files changes
  // (either by adding a new one or removing an existing one).
  const handleUploadComplete = (newFiles) => {
    console.log("new files ", newFiles);
    setCurrentFiles(newFiles);
  };

  // This function saves the final state of the file list to our variant.
  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      await toast.promise(tenantProductService.updateVariantImages(variant._id, { images: currentFiles }), {
        loading: "Saving image list...",
        success: "Images updated successfully!",
        error: "Failed to save images.",
      });
      onUploadSuccess(); // Notify parent to refresh data
      onClose();
    } catch (error) {
      console.log(error);
      // Error is handled by the toast
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Manage Images for ${variant?.variantName}`}>
      <div className="space-y-6">
        <FileUploader
          onUploadComplete={handleUploadComplete}
          initialFiles={currentFiles}
          getSignatureFunc={tenantUploadService.getCloudinarySignature}
          multiple={true} // Allow multiple images
        />
        <div className="flex justify-end gap-4 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSaveChanges} disabled={isSaving}>
            {isSaving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save size={16} className="mr-2" />}
            Save Changes
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default VariantImageManager;
