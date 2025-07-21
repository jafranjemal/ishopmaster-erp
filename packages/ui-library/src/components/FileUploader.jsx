import axios from "axios";
import { Camera, LoaderCircle, UploadCloud, X } from "lucide-react";
import PropTypes from "prop-types";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { useCustomDropzone } from "../hooks/useCustomDropzone";
import { cn } from "../lib/utils";
import { Button } from "./Button";
import { CameraCaptureModal } from "./CameraCaptureModal";

export const FileUploader = ({
  onUploadComplete,
  initialFiles = [],
  getSignatureFunc,
  accept = ["image/png", "image/jpeg", "image/webp", "application/pdf"],
  maxSize = 10 * 1024 * 1024,
  multiple = false,
}) => {
  const [files, setFiles] = useState([
    // {
    //   name: "9H Steve Glass Strong Full Screen Protector (1)",
    //   url: "https://res.cloudinary.com/dpkxck2uh/image/upload/v1752984796/xtppxarqlfvcpnzz4saw.jpg",
    // },
  ]);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  useEffect(() => {
    if (initialFiles.length > 0)
      setFiles((prev) => {
        const isSame = JSON.stringify(prev) === JSON.stringify(initialFiles);
        return isSame ? prev : initialFiles;
      });
  }, [initialFiles]);

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
          name: data.original_filename || "untitled",
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

        const newFiles = multiple ? [...files, ...uploadedFiles] : uploadedFiles;
        setFiles(newFiles);
        onUploadComplete?.(newFiles);
        console.log(newFiles);
        toast.success("Upload complete", { id: toastId });
      } catch (error) {
        toast.error(error?.response?.data?.error?.message || error.message || "Upload failed", {
          id: toastId,
        });
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
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        <div
          {...getRootProps()}
          onClick={openFileDialog}
          className={cn(
            "p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors h-full flex flex-col justify-center",
            isDraggingOver
              ? "border-indigo-500 bg-indigo-900/10"
              : "border-slate-700 hover:border-indigo-600",
            isUploading && "cursor-wait opacity-50"
          )}
          aria-disabled={isUploading}
          role="button"
          tabIndex={0}
        >
          <input {...getInputProps()} ref={inputRef} />
          <div className="text-center">
            {isUploading ? (
              <LoaderCircle className="mx-auto h-8 w-8 animate-spin" />
            ) : (
              <UploadCloud className="mx-auto h-8 w-8" />
            )}
            <p className="mt-2 text-sm">Drag & drop or click to upload</p>
            <p className="text-xs text-slate-500">Max {Math.round(maxSize / (1024 * 1024))}MB</p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          className="h-full"
          onClick={() => setIsCameraOpen(true)}
          disabled={isUploading}
        >
          <div className="text-center">
            <Camera className="mx-auto h-8 w-8" />
            <p className="mt-2 text-sm">Take a Picture</p>
            <p className="text-xs text-slate-500">Use your device's camera</p>
          </div>
        </Button>
      </div>

      {files.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {files.map((file) => (
            <div
              key={file.url}
              className="relative group rounded overflow-hidden border border-slate-700 bg-slate-800"
            >
              <img
                src={file.url}
                alt={file.name || "Uploaded image"}
                className="object-cover w-full h-40"
              />
              <div className="p-2 text-xs text-slate-300 truncate text-center">
                {file.name || "Unnamed"}
              </div>
              <button
                onClick={() => removeFile(file.url)}
                className="absolute top-1 right-1 bg-slate-900/60 rounded-full p-1 hover:bg-red-600 transition"
                aria-label={`Remove ${file.name || "image"}`}
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCaptureComplete={(file) => {
          handleFilesUpload([file]); // Pass the captured file to your existing upload logic
        }}
      />
    </>
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
