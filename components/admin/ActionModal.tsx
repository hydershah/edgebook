"use client";

import { useState } from "react";
import Modal from "./Modal";

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { reason: string; duration?: number; notes?: string }) => void;
  title: string;
  description: string;
  requireReason?: boolean;
  requireDuration?: boolean;
  requireNotes?: boolean;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "success";
  isLoading?: boolean;
}

export default function ActionModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  requireReason = true,
  requireDuration = false,
  requireNotes = false,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "warning",
  isLoading = false,
}: ActionModalProps) {
  const [reason, setReason] = useState("");
  const [duration, setDuration] = useState("7");
  const [notes, setNotes] = useState("");

  const handleConfirm = () => {
    if (requireReason && !reason.trim()) {
      alert("Please provide a reason");
      return;
    }

    onConfirm({
      reason: reason.trim(),
      duration: requireDuration ? parseInt(duration) : undefined,
      notes: requireNotes ? notes.trim() : undefined,
    });

    // Reset form
    setReason("");
    setDuration("7");
    setNotes("");
  };

  const handleClose = () => {
    setReason("");
    setDuration("7");
    setNotes("");
    onClose();
  };

  const variantStyles = {
    danger: "bg-red-600 hover:bg-red-700 text-white",
    warning: "bg-yellow-600 hover:bg-yellow-700 text-white",
    success: "bg-primary hover:bg-primary-dark text-white",
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title} maxWidth="lg">
      <div className="space-y-4">
        {/* Description */}
        <p className="text-sm text-gray-600">{description}</p>

        {/* Reason Input */}
        {requireReason && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Explain the reason for this action..."
              disabled={isLoading}
            />
          </div>
        )}

        {/* Duration Input */}
        {requireDuration && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration (days)
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent"
              disabled={isLoading}
            >
              <option value="1">1 day</option>
              <option value="3">3 days</option>
              <option value="7">7 days</option>
              <option value="14">14 days</option>
              <option value="30">30 days</option>
              <option value="90">90 days</option>
              <option value="365">1 year</option>
              <option value="-1">Permanent</option>
            </select>
          </div>
        )}

        {/* Notes Input */}
        {requireNotes && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Add any additional notes..."
              disabled={isLoading}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 space-y-3 space-y-reverse sm:space-y-0 pt-4 border-t border-gray-200">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`w-full sm:w-auto px-4 py-2 text-sm font-medium rounded-lg ${variantStyles[variant]} disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center`}
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
