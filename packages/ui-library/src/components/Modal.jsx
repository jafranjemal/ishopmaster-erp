// --- Modal.js (Production-grade) ---
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Expand, ExpandIcon, LucideExpand, Maximize2, Maximize2Icon, X } from "lucide-react";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import FocusTrap from "focus-trap-react";
import Button from "./Button";

const sizeClasses = {
  full: "w-full h-full rounded-none",
  xl: "max-w-4xl",
  l: "min-w-3xl max-w-4xl",
  sm: "min-w-xs max-w-sm",
  xs: "min-w-xs max-w-sm",
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
  const modalRef = useRef(null);
  const [defaultSize, setDefaultSize] = useState(size);
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden"; // prevent background scroll
    }
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onMouseDown={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            ref={modalRef}
            className={cn(
              "relative w-auto max-w-full border border-slate-700 bg-slate-800 shadow-lg text-slate-100 flex flex-col overflow-hidden",
              sizeClasses[defaultSize],
              className
            )}
            style={{ maxHeight: "90vh", margin: "2rem" }}
            onMouseDown={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex flex-col space-y-1.5 p-6 border-b border-slate-700">
              <h3 id="modal-title" className="text-2xl font-semibold leading-none tracking-tight">
                {title}
              </h3>
              {description && (
                <p id="modal-description" className="text-sm text-slate-400">
                  {description}
                </p>
              )}
            </div>

            <div className="p-6 overflow-y-auto" style={{ flex: 1, minHeight: 0 }}>
              {children}
            </div>

            {footer && (
              <div className="flex items-center p-6 border-t border-slate-700">{footer}</div>
            )}

            <div
              style={{ right: "0.5rem" }}
              className="w-[60px] absolute flex items-center gap-1  z-10"
            >
              <Button
                className=" text-slate-400 hover:text-white"
                size="icon"
                variant="ghost"
                onClick={() => setDefaultSize(defaultSize === "l" ? "full" : "l")}
                aria-label="Close modal"
              >
                <Maximize2Icon className="border h-7 w-7 p-1" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-slate-400 hover:text-white"
                aria-label="Close modal"
              >
                <X className="border h-7 w-7" />
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.getElementById("modal-root")
  );
};

export default Modal;
