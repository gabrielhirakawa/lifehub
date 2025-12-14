import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { CheckCircle, XCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type?: ToastType;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({
  message,
  type = "info",
  onClose,
  duration = 3000,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle size={18} className="text-emerald-500" />;
      case "error":
        return <XCircle size={18} className="text-rose-500" />;
      default:
        return <Info size={18} className="text-blue-500" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case "success":
        return "bg-emerald-50 dark:bg-emerald-900 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200";
      case "error":
        return "bg-rose-50 dark:bg-rose-900 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200";
      default:
        return "bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200";
    }
  };

  return createPortal(
    <div
      className={`fixed top-4 right-4 z-[9999] flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border animate-in slide-in-from-top-5 fade-in duration-300 ${getStyles()}`}
    >
      {getIcon()}
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors"
      >
        <X size={14} />
      </button>
    </div>,
    document.body
  );
};

export default Toast;
