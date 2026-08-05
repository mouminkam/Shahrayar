"use client";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, Trash2 } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName?: string | null;
}

/**
 * Delete Confirmation Modal Component
 * Modal for confirming item deletion from cart
 */
export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  itemName,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  // Use portal to render modal at document body level
  if (typeof window === "undefined") return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md"
          onClick={onClose}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 100000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md bg-linear-to-br from-bgimg/98 via-bgimg/95 to-bgimg/90 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-2xl border border-red-500/30 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-red-500/20 border border-red-500/30">
                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
              </div>
              <h2 className="text-white text-lg sm:text-xl font-bold">
                Confirm Deletion
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors shrink-0"
              aria-label="Close"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6">
            <p className="text-text text-sm sm:text-base mb-2">
              Are you sure you want to remove this item from your cart?
            </p>
            {itemName && (
              <div className="mt-3 p-3 bg-white/5 rounded-lg border border-white/10">
                <p className="text-white text-sm sm:text-base font-semibold truncate">
                  {itemName}
                </p>
              </div>
            )}
            <p className="text-text/70 text-xs sm:text-sm mt-4">
              This action cannot be undone.
            </p>
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 p-4 sm:p-6 border-t border-white/10 bg-white/5">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-3 bg-transparent border-2 border-white/20 text-white rounded-xl hover:border-white/40 transition-colors font-semibold text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="w-full sm:w-auto px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors font-semibold flex items-center justify-center gap-2 text-sm sm:text-base shadow-lg hover:shadow-xl hover:shadow-red-500/30"
            >
              <Trash2 className="w-4 h-4" />
              Delete Item
            </button>
          </div>
        </motion.div>
      </motion.div>
      )}
    </AnimatePresence>
  );
}
