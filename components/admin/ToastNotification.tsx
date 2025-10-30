"use client";

import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { useEffect } from "react";

interface ToastProps {
  type: "success" | "error" | "warning" | "info";
  message: string;
  onClose: () => void;
  duration?: number;
}

export default function ToastNotification({
  type,
  message,
  onClose,
  duration = 5000,
}: ToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const typeStyles = {
    success: {
      icon: <CheckCircle className="h-5 w-5" />,
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-800",
      iconColor: "text-green-600",
    },
    error: {
      icon: <XCircle className="h-5 w-5" />,
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-800",
      iconColor: "text-red-600",
    },
    warning: {
      icon: <AlertTriangle className="h-5 w-5" />,
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      text: "text-yellow-800",
      iconColor: "text-yellow-600",
    },
    info: {
      icon: <Info className="h-5 w-5" />,
      bg: "bg-primary/10",
      border: "border-primary/20",
      text: "text-primary",
      iconColor: "text-primary",
    },
  };

  const style = typeStyles[type];

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center p-4 border rounded-lg shadow-lg ${style.bg} ${style.border} animate-slide-in`}
    >
      <div className={style.iconColor}>{style.icon}</div>
      <p className={`ml-3 text-sm font-medium ${style.text}`}>{message}</p>
      <button
        onClick={onClose}
        className={`ml-4 ${style.iconColor} hover:opacity-70 transition-opacity`}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
