import { useState, useCallback } from "react";

/**
 * A headless, production-quality dropzone hook.
 * @param {object} options
 * @param {function(File[]): void} options.onDrop - callback when files are dropped or selected.
 * @param {boolean} options.multiple - allow multiple files.
 * @param {string[]} options.acceptedTypes - array of accepted MIME types (e.g. ['image/png', 'application/pdf']).
 * @param {number} options.maxSize - max file size in bytes.
 */
export const useCustomDropzone = ({
  onDrop,
  multiple = false,
  acceptedTypes = [],
  maxSize = 10 * 1024 * 1024, // 10MB default
} = {}) => {
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const validateFiles = (files) => {
    const validFiles = [];
    const errors = [];

    for (const file of files) {
      if (acceptedTypes.length && !acceptedTypes.includes(file.type)) {
        errors.push(`File type not accepted: ${file.name}`);
        continue;
      }

      if (file.size > maxSize) {
        errors.push(`File too large: ${file.name}`);
        continue;
      }

      validFiles.push(file);
    }

    return { validFiles, errors };
  };

  const handleFiles = (files) => {
    const { validFiles, errors } = validateFiles(files);
    if (errors.length > 0) {
      errors.forEach((err) => console.warn(err)); // Or emit a toast/error handler
    }
    if (validFiles.length > 0 && onDrop) {
      onDrop(validFiles);
    }
  };

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDraggingOver(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFiles(Array.from(e.dataTransfer.files));
        e.dataTransfer.clearData();
      }
    },
    [handleFiles]
  );

  const handleInputChange = useCallback((e) => {
    handleFiles(Array.from(e.target.files));
  }, []);

  const getRootProps = useCallback(
    () => ({
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDragOver: handleDragOver,
      onDrop: handleDrop,
    }),
    [handleDragEnter, handleDragLeave, handleDragOver, handleDrop]
  );

  const getInputProps = useCallback(
    () => ({
      type: "file",
      multiple,
      accept: acceptedTypes.join(","),
      onChange: handleInputChange,
      style: { display: "none" },
    }),
    [multiple, acceptedTypes, handleInputChange]
  );

  return {
    isDraggingOver,
    getRootProps,
    getInputProps,
  };
};
