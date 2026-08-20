"use client";

import { useState } from "react";

export function PrintDateModal({
  open,
  title,
  confirmLabel,
  busy = false,
  error,
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  confirmLabel: string;
  busy?: boolean;
  error?: string | null;
  onClose: () => void;
  onConfirm: (date: string) => void;
}) {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-surface p-5 shadow-xl">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-2 text-sm text-muted">
          Choose the date that should appear on the printed document.
        </p>
        <label className="mt-4 block text-sm font-medium">
          Print / download date
          <input
            type="date"
            className="mt-1 w-full rounded-md border border-border px-3 py-2"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </label>
        {error ? <p className="mt-3 text-sm text-red-700 dark:text-red-400">{error}</p> : null}
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="min-h-11 rounded-md border border-border px-3 py-2 text-sm hover:bg-surface-muted"
            onClick={onClose}
            disabled={busy}
          >
            Cancel
          </button>
          <button
            type="button"
            className="min-h-11 rounded-md bg-[#9b1c1c] px-3 py-2 text-sm text-white hover:bg-[#7f1717] disabled:opacity-60"
            disabled={busy || !date}
            onClick={() => {
              void onConfirm(date);
            }}
          >
            {busy ? "Generating…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
