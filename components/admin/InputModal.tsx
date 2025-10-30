"use client";

import { useState } from "react";
import Modal from "./Modal";

interface InputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
  title: string;
  description: string;
  placeholder?: string;
  inputType?: "text" | "select";
  selectOptions?: { value: string; label: string }[];
  defaultValue?: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export default function InputModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  placeholder = "",
  inputType = "text",
  selectOptions = [],
  defaultValue = "",
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
}: InputModalProps) {
  const [value, setValue] = useState(defaultValue);

  const handleConfirm = () => {
    if (!value.trim()) {
      alert("Please enter a value");
      return;
    }
    onConfirm(value.trim());
    setValue("");
  };

  const handleClose = () => {
    setValue(defaultValue);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title} maxWidth="md">
      <div className="space-y-4">
        {/* Description */}
        <p className="text-sm text-gray-600">{description}</p>

        {/* Input */}
        {inputType === "text" ? (
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={isLoading}
            onKeyPress={(e) => {
              if (e.key === "Enter" && value.trim()) {
                handleConfirm();
              }
            }}
          />
        ) : (
          <select
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={isLoading}
          >
            <option value="">Select an option</option>
            {selectOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 space-y-3 space-y-reverse sm:space-y-0 pt-4">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading || !value.trim()}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
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
