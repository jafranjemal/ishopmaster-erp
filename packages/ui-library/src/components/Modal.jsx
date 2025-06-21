import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "../lib/utils";

const sizeClasses = {
  full: "w-full h-full rounded-none",
  xl: "w-full max-w-4xl",
  l: "w-full max-w-2xl",
  sm: "w-full max-w-sm",
  xs: "w-full max-w-xs",
};

const Modal = ({
  isOpen,
  onClose,
  children,
  title,
  description,
  footer,
  className,
  size = "l", // default size
}) => {
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
    }
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div
        className={cn(
          "relative border border-slate-700 bg-slate-800 shadow-lg text-slate-100 flex flex-col",
          sizeClasses[size],
          className
        )}
        style={{ maxHeight: "90vh", margin: "2rem" }} // limit height to 90% of viewport
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col space-y-1.5 p-6 border-b border-slate-700">
          <h3 className="text-2xl font-semibold leading-none tracking-tight">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-slate-400">{description}</p>
          )}
        </div>

        {/* Scrollable content */}
        <div className="p-6 overflow-y-auto" style={{ flex: 1, minHeight: 0 }}>
          {children}
        </div>

        {footer && (
          <div className="flex items-center p-6 border-t border-slate-700">
            {footer}
          </div>
        )}

        <button
          onClick={onClose}
          style={{ top: "1rem", right: "1rem" }}
          className="absolute right-0 border  text-slate-400 hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>,
    document.getElementById("modal-root")
  );
};

export default Modal;
