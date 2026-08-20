"use client";

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  busy = false,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-2 text-sm text-neutral-600">{message}</p>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="min-h-11 rounded-md border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-50"
            onClick={onClose}
            disabled={busy}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`min-h-11 rounded-md px-3 py-2 text-sm text-white ${
              danger ? "bg-red-700 hover:bg-red-800" : "bg-[#9b1c1c] hover:bg-[#7f1717]"
            } disabled:opacity-60`}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
