"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { updateDocumentStatus } from "@/lib/documents/mutations";
import { DOCUMENT_TYPES, type DocumentType } from "@/lib/types";

const LABELS: Record<DocumentType, string> = {
  invoice: "Invoice",
  quotation: "Quotation",
  challan: "Challan",
};

export function StatusSelector({
  documentId,
  value,
}: {
  documentId: string;
  value: DocumentType;
}) {
  const router = useRouter();
  const [pendingType, setPendingType] = useState<DocumentType | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      <label className="block text-sm font-medium">
        Status / type
        <select
          className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2"
          value={value}
          onChange={(event) => setPendingType(event.target.value as DocumentType)}
        >
          {DOCUMENT_TYPES.map((type) => (
            <option key={type} value={type}>
              {LABELS[type]}
            </option>
          ))}
        </select>
      </label>
      {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
      <ConfirmDialog
        open={pendingType !== null && pendingType !== value}
        title="Change document status?"
        message={`This will change the current document to ${pendingType ? LABELS[pendingType] : ""}. A new document will not be created.`}
        confirmLabel="Change status"
        busy={busy}
        onClose={() => setPendingType(null)}
        onConfirm={async () => {
          if (!pendingType) return;
          setBusy(true);
          setError(null);
          const result = await updateDocumentStatus(documentId, pendingType);
          setBusy(false);
          if (!result.ok) {
            setError(result.error);
            return;
          }
          setPendingType(null);
          router.refresh();
        }}
      />
    </>
  );
}
