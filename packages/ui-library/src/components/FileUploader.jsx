import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-hot-toast";
import axios from "axios";
import { UploadCloud, File as FileIcon, X, LoaderCircle } from "lucide-react";
import { Button } from "./Button";
import { cn } from "../lib/utils";

// In a real application, you would import this from the tenant-frontend's services.
// For a library component, it's better to pass the function as a prop.
// async () => { const res = await api.post('/tenant/uploads/signature', ...); return res.data; }
const FileUploader = ({
  onUploadComplete,
  initialFiles = [],
  getSignatureFunc,
}) => {
  const [files, setFiles] = useState(initialFiles);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setIsUploading(true);
      const uploadToast = toast.loading("Uploading file...");

      try {
        if (!getSignatureFunc) {
          throw new Error("getSignatureFunc prop is required for uploading.");
        }

        // 1. Get signature from our backend via the passed-in function
        const signatureResponse = await getSignatureFunc();
        const { signature, timestamp } = signatureResponse;
        const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY;
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const url = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

        // 2. Upload file directly to Cloudinary
        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", apiKey);
        formData.append("timestamp", timestamp);
        formData.append("signature", signature);

        const response = await axios.post(url, formData);

        const newFile = {
          name: response.data.original_filename,
          url: response.data.secure_url,
        };
        const updatedFiles = [...files, newFile];
        setFiles(updatedFiles);
        onUploadComplete(updatedFiles); // Notify parent form of the change

        toast.success("Upload complete!", { id: uploadToast });
      } catch (error) {
        console.error("Upload failed", error);
        toast.error(error.response?.data?.error || "Upload failed.", {
          id: uploadToast,
        });
      } finally {
        setIsUploading(false);
      }
    },
    [files, onUploadComplete, getSignatureFunc]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [],
      "image/png": [],
      "application/pdf": [],
    },
    multiple: false,
    disabled: isUploading,
  });

  const removeFile = (urlToRemove) => {
    const updatedFiles = files.filter((f) => f.url !== urlToRemove);
    setFiles(updatedFiles);
    onUploadComplete(updatedFiles);
  };

  return (
    <div>
      <div
        {...getRootProps()}
        className={cn(
          "p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
          isDragActive
            ? "border-indigo-500 bg-indigo-900/10"
            : "border-slate-700 hover:border-indigo-600",
          isUploading && "cursor-wait opacity-50"
        )}
      >
        <input {...getInputProps()} />
        <div className="text-center">
          {isUploading ? (
            <LoaderCircle className="mx-auto h-12 w-12 text-slate-400 animate-spin" />
          ) : (
            <UploadCloud className="mx-auto h-12 w-12 text-slate-400" />
          )}
          <p className="mt-2 text-sm text-slate-400">
            {isUploading
              ? "Uploading..."
              : "Drag & drop a file here, or click to select"}
          </p>
          <p className="text-xs text-slate-500">PDF, PNG, JPG up to 10MB</p>
        </div>
      </div>
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium">Uploaded Files:</p>
          {files.map((file) => (
            <div
              key={file.url}
              className="flex items-center justify-between p-2 bg-slate-800 rounded-md"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <FileIcon className="h-5 w-5 text-slate-500 flex-shrink-0" />
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-indigo-400 hover:underline truncate"
                  title={file.name}
                >
                  {file.name}
                </a>
              </div>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => removeFile(file.url)}
              >
                <X className="h-4 w-4 text-slate-400 hover:text-white" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUploader;
