import { useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

export const useFileUploader = ({ getSignatureFunc, onUploadComplete }) => {
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = useCallback(
    async (file) => {
      if (!getSignatureFunc) throw new Error("getSignatureFunc is required");

      setIsUploading(true);
      const toastId = toast.loading(`Uploading ${file.name}...`);

      try {
        // Get signature
        const sigData = await getSignatureFunc();
        if (!sigData?.signature || !sigData?.timestamp) {
          throw new Error("Signature or timestamp missing");
        }

        const { signature, timestamp } = sigData;
        const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY;
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const url = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", apiKey);
        formData.append("timestamp", timestamp);
        formData.append("signature", signature);

        const res = await axios.post(url, formData);
        const uploaded = {
          name: res.data.original_filename,
          url: res.data.secure_url,
        };

        const updatedFiles = [...files, uploaded];
        setFiles(updatedFiles);
        onUploadComplete?.(updatedFiles);

        toast.success("Upload successful!", { id: toastId });
      } catch (err) {
        console.error(err);
        toast.error(
          err?.response?.data?.error?.message || err.message || "Upload failed",
          {
            id: toastId,
          }
        );
      } finally {
        setIsUploading(false);
      }
    },
    [files, getSignatureFunc, onUploadComplete]
  );

  const removeFile = useCallback(
    (url) => {
      const updated = files.filter((f) => f.url !== url);
      setFiles(updated);
      onUploadComplete?.(updated);
    },
    [files, onUploadComplete]
  );

  return {
    files,
    isUploading,
    uploadFile,
    removeFile,
  };
};
