"use client";

import Button from "@/components/ui/Button";

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "primary",
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-card">
        <h3 className="text-lg font-bold text-sunlo-text">{title}</h3>
        <p className="mt-2 text-sm text-sunlo-muted">{message}</p>
        <div className="mt-6 flex gap-3">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            {cancelText}
          </Button>
          <Button
            variant={confirmVariant}
            onClick={onConfirm}
            className="flex-1"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
