import React, { useState, useCallback, useRef } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { toast } from "react-hot-toast";
import { UploadCloud, File as FileIcon, X, LoaderCircle } from "lucide-react";
import { Button } from "./Button";
import { cn } from "../lib/utils";
import { useCustomDropzone } from "../hooks/useCustomDropzone";

export const FileUploader = ({
  onUploadComplete,
  initialFiles = [],
  getSignatureFunc,
  accept = ["image/png", "image/jpeg", "application/pdf"],
  maxSize = 10 * 1024 * 1024,
  multiple = false,
}) => {
  const [files, setFiles] = useState(initialFiles);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef(null);

  const uploadFile = useCallback(
    async (file) => {
      if (!getSignatureFunc) {
        throw new Error("getSignatureFunc is required");
      }

      const toastId = toast.loading(`Uploading ${file.name}...`);
      setIsUploading(true);

      try {
        const _signature = await getSignatureFunc();
        console.log("Signature data:", _signature?.data);
        const { signature, timestamp } = _signature?.data;

        if (!signature || !timestamp) {
          throw new Error("Missing signature or timestamp");
        }

        const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY;
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const url = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", apiKey);
        formData.append("timestamp", timestamp);
        formData.append("signature", signature);

        const { data } = await axios.post(url, formData);

        const uploadedFile = {
          name: data.original_filename,
          url: data.secure_url,
        };

        return uploadedFile;
      } catch (error) {
        console.error("Upload failed:", error);
        throw error;
      } finally {
        toast.dismiss(toastId);
        setIsUploading(false);
      }
    },
    [getSignatureFunc]
  );

  const handleFilesUpload = useCallback(
    async (acceptedFiles) => {
      const toastId = toast.loading("Uploading files...");
      setIsUploading(true);

      try {
        const uploadedFiles = [];
        for (const file of acceptedFiles) {
          const uploaded = await uploadFile(file);
          uploadedFiles.push(uploaded);
        }

        const newFiles = multiple
          ? [...files, ...uploadedFiles]
          : uploadedFiles;
        setFiles(newFiles);
        onUploadComplete?.(newFiles);
        toast.success("Upload complete", { id: toastId });
      } catch (error) {
        toast.error(
          error?.response?.data?.error?.message ||
            error.message ||
            "Upload failed",
          { id: toastId }
        );
      } finally {
        setIsUploading(false);
      }
    },
    [uploadFile, files, onUploadComplete, multiple]
  );

  const { getRootProps, getInputProps, isDraggingOver } = useCustomDropzone({
    onDrop: handleFilesUpload,
    multiple,
    acceptedTypes: accept,
    maxSize,
  });

  const removeFile = (url) => {
    const updatedFiles = files.filter((file) => file.url !== url);
    setFiles(updatedFiles);
    onUploadComplete?.(updatedFiles);
  };

  const openFileDialog = () => {
    if (!isUploading) {
      inputRef.current?.click();
    }
  };

  return (
    <div>
      <div
        {...getRootProps()}
        onClick={openFileDialog}
        className={cn(
          "p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
          isDraggingOver
            ? "border-indigo-500 bg-indigo-900/10"
            : "border-slate-700 hover:border-indigo-600",
          isUploading && "cursor-wait opacity-50"
        )}
        aria-disabled={isUploading}
        role="button"
        tabIndex={0}
      >
        <input {...getInputProps()} ref={inputRef} aria-hidden="true" />
        <div className="text-center">
          {isUploading ? (
            <LoaderCircle className="mx-auto h-12 w-12 animate-spin text-slate-400" />
          ) : (
            <UploadCloud className="mx-auto h-12 w-12 text-slate-400" />
          )}
          <p className="mt-2 text-sm text-slate-400">
            {isUploading ? "Uploading..." : "Drag & drop or click to upload"}
          </p>
          <p className="text-xs text-slate-500">
            Max {Math.round(maxSize / (1024 * 1024))}MB
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file) => (
            <div
              key={file.url}
              className="flex items-center justify-between p-2 bg-slate-800 rounded"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <FileIcon className="h-4 w-4 text-slate-500 flex-shrink-0" />
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate text-indigo-400 hover:underline"
                  title={file.name}
                >
                  {file.name}
                </a>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => removeFile(file.url)}
                aria-label={`Remove file ${file.name}`}
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

FileUploader.propTypes = {
  onUploadComplete: PropTypes.func.isRequired,
  initialFiles: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
    })
  ),
  getSignatureFunc: PropTypes.func.isRequired,
  accept: PropTypes.arrayOf(PropTypes.string),
  maxSize: PropTypes.number,
  multiple: PropTypes.bool,
};
