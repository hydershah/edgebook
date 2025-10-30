"use client";

import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import Modal from "./Modal";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "success" | "info";
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "info",
  isLoading = false,
}: ConfirmModalProps) {
  const handleConfirm = () => {
    onConfirm();
  };

  const variantStyles = {
    danger: {
      icon: <XCircle className="h-6 w-6 text-red-600" />,
      bg: "bg-red-100",
      button: "bg-red-600 hover:bg-red-700 text-white",
    },
    warning: {
      icon: <AlertTriangle className="h-6 w-6 text-yellow-600" />,
      bg: "bg-yellow-100",
      button: "bg-yellow-600 hover:bg-yellow-700 text-white",
    },
    success: {
      icon: <CheckCircle className="h-6 w-6 text-primary" />,
      bg: "bg-primary/10",
      button: "bg-primary hover:bg-primary-dark text-white",
    },
    info: {
      icon: <CheckCircle className="h-6 w-6 text-primary" />,
      bg: "bg-primary/10",
      button: "bg-primary hover:bg-primary-dark text-white",
    },
  };

  const style = variantStyles[variant];

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm">
      <div className="text-center">
        {/* Icon */}
        <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${style.bg}`}>
          {style.icon}
        </div>

        {/* Title */}
        <h3 className="mt-4 text-lg font-semibold text-gray-900">
          {title}
        </h3>

        {/* Message */}
        <p className="mt-2 text-sm text-gray-600">
          {message}
        </p>

        {/* Actions */}
        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:space-x-3 space-y-3 space-y-reverse sm:space-y-0">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`w-full sm:w-auto px-4 py-2 text-sm font-medium rounded-lg ${style.button} disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center`}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
