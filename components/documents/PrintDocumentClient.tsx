"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PrintDateModal } from "@/components/documents/PrintDateModal";
import { displayDocumentNumber } from "@/lib/documents/document-number";
import { downloadPdfFile, openPdfForPrint } from "@/lib/utils/pdf-actions";
import type { DocumentWithItems } from "@/lib/types";

export function PrintDocumentClient({
  document,
  initialDate,
}: {
  document: DocumentWithItems;
  initialDate: string;
}) {
  const router = useRouter();
  const [date, setDate] = useState(initialDate);
  const [busy, setBusy] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const src = date ? `/api/pdf/${document.id}?date=${date}` : "";
  const downloadSrc = src ? `${src}&download=1` : "";

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold sm:text-2xl">
            Print {displayDocumentNumber(document.document_number)}
          </h1>
          <p className="text-sm text-neutral-600">
            Preview the A4 PDF, then print or download. Date shown: {date || "not selected"}.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <button
            type="button"
            className="min-h-10 rounded-md border border-neutral-300 px-3 py-2 text-sm"
            onClick={() => setDate("")}
          >
            Change date
          </button>
          <button
            type="button"
            className="min-h-10 rounded-md bg-[#9b1c1c] px-3 py-2 text-sm text-white disabled:opacity-50"
            disabled={!src || busy}
            onClick={() => {
              if (!src) return;
              openPdfForPrint(src);
            }}
          >
            Print
          </button>
          <button
            type="button"
            className="col-span-2 min-h-10 rounded-md border border-neutral-300 px-3 py-2 text-sm disabled:opacity-50 sm:col-span-1"
            disabled={!downloadSrc || busy}
            onClick={async () => {
              if (!downloadSrc) return;
              setBusy(true);
              setLoadError(null);
              try {
                await downloadPdfFile(downloadSrc, `${document.document_number}.pdf`);
              } catch (err) {
                setLoadError(err instanceof Error ? err.message : "PDF download failed.");
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? "Downloading…" : "Download PDF"}
          </button>
        </div>
      </div>

      {loadError ? <p className="text-sm text-red-700">{loadError}</p> : null}

      {src ? (
        <iframe
          title="Document PDF preview"
          className="h-[70vh] w-full rounded-lg border border-neutral-300 bg-white sm:h-[80vh]"
          src={src}
          onError={() => setLoadError("Could not load the PDF preview.")}
        />
      ) : (
        <div className="rounded-lg border border-dashed border-neutral-300 p-10 text-center text-neutral-500">
          Select a print date to generate the preview.
        </div>
      )}

      <PrintDateModal
        open={!date}
        title="Select print date"
        confirmLabel="Generate preview"
        onClose={() => router.push(`/documents/${document.id}`)}
        onConfirm={(nextDate) => {
          setDate(nextDate);
          router.replace(`/documents/${document.id}/print?date=${nextDate}`);
        }}
      />
    </div>
  );
}
