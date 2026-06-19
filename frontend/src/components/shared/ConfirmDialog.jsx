import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

export function ConfirmDialog({ open, onClose, onConfirm, title = "Are you sure?", description = "This action cannot be undone.", confirmText = "Confirm", loading = false }) {
  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative z-50 w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xl"
        >
          <button onClick={onClose} className="absolute right-4 top-4 text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer">
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-[var(--destructive)]/10 p-2">
              <AlertTriangle className="h-5 w-5 text-[var(--destructive)]" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">{description}</p>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button variant="destructive" onClick={onConfirm} disabled={loading}>
              {loading ? "Processing..." : confirmText}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
