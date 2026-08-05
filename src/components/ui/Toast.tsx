"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import useToastStore from "../../store/toastStore";

type ToastType = "success" | "error" | "warning" | "info";

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
  duration?: number;
}

const Toast = () => {
  const toasts: ToastItem[] = useToastStore((state: { toasts: ToastItem[] }) => state.toasts);
  const removeToast = useToastStore((state: { removeToast: (id: number) => void }) => state.removeToast);

  const getIcon = (type: ToastType) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5" />;
      case "error":
        return <AlertCircle className="w-5 h-5" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getColors = (type: ToastType) => {
    switch (type) {
      case "success":
        return "bg-green-500/20 border-green-500/50 text-green-300";
      case "error":
        return "bg-red-500/20 border-red-500/50 text-red-300";
      case "warning":
        return "bg-yellow-500/20 border-yellow-500/50 text-yellow-300";
      default:
        return "bg-blue-500/20 border-blue-500/50 text-blue-300";
    }
  };

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-md w-full sm:w-auto pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 300, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`pointer-events-auto bg-linear-to-br from-bgimg/95 via-bgimg to-bgimg/90 backdrop-blur-md rounded-xl shadow-2xl border ${getColors(
              toast.type
            )} p-4 flex items-start gap-3`}
          >
            <div className="flex-shrink-0 mt-0.5">{getIcon(toast.type)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm  font-medium break-words">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 text-current opacity-70 hover:opacity-100 transition-opacity duration-200"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Toast;
