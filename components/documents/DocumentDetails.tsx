"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { PrintDateModal } from "@/components/documents/PrintDateModal";
import { StatusSelector } from "@/components/documents/StatusSelector";
import { deleteDocument } from "@/lib/documents/mutations";
import type { DocumentType, DocumentWithItems } from "@/lib/types";
import { displayDocumentNumber } from "@/lib/documents/document-number";
import { formatMoney, sumLineTotals } from "@/lib/utils/currency";
import { downloadPdfFile } from "@/lib/utils/pdf-actions";

const TYPE_LABELS: Record<DocumentType, string> = {
  invoice: "Invoice",
  quotation: "Quotation",
  challan: "Challan",
};

export function DocumentDetails({ document }: { document: DocumentWithItems }) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pdfMode, setPdfMode] = useState<"print" | "download" | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm uppercase tracking-wide text-muted">
            {TYPE_LABELS[document.document_type]}
          </p>
          <h1 className="text-xl font-semibold sm:text-2xl">
            {displayDocumentNumber(document.document_number)}
          </h1>
          <p className="mt-1 break-words text-muted-strong">M/s. {document.customer_name}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <Link
            href={`/documents/${document.id}/edit`}
            className="min-h-10 rounded-md border border-border px-3 py-2 text-center text-sm hover:bg-surface-muted"
          >
            Edit
          </Link>
          <button
            type="button"
            className="min-h-10 rounded-md bg-[#9b1c1c] px-3 py-2 text-sm text-white hover:bg-[#7f1717]"
            onClick={() => setPdfMode("print")}
          >
            Print
          </button>
          <button
            type="button"
            className="min-h-10 rounded-md border border-border px-3 py-2 text-sm hover:bg-surface-muted"
            onClick={() => setPdfMode("download")}
          >
            Download PDF
          </button>
          <button
            type="button"
            className="min-h-10 rounded-md border border-red-200 dark:border-red-900 px-3 py-2 text-sm text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
            onClick={() => setDeleteOpen(true)}
          >
            Delete
          </button>
        </div>
      </div>

      <div className="w-full max-w-sm rounded-lg border border-border-subtle bg-surface p-4">
        <StatusSelector documentId={document.id} value={document.document_type} />
      </div>

      {error ? <p className="text-sm text-red-700 dark:text-red-400">{error}</p> : null}

      <div className="space-y-3 md:hidden">
        {document.items.map((item) => (
          <div key={item.id} className="rounded-lg border border-border-subtle bg-surface p-3">
            <p className="text-xs text-muted">Item {item.serial_number}</p>
            <p className="mt-1 whitespace-pre-wrap text-sm">{item.description}</p>
            <dl className="mt-3 grid grid-cols-3 gap-2 text-sm">
              <div>
                <dt className="text-muted">Qty</dt>
                <dd className="font-medium">{formatMoney(item.quantity)}</dd>
              </div>
              <div>
                <dt className="text-muted">Price</dt>
                <dd className="font-medium">{formatMoney(item.unit_price)}</dd>
              </div>
              <div>
                <dt className="text-muted">Total</dt>
                <dd className="font-medium">{formatMoney(item.total)}</dd>
              </div>
            </dl>
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-lg border border-border-subtle bg-surface md:block">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-900 text-white">
            <tr>
              <th className="px-3 py-2 text-left">Sr. #</th>
              <th className="px-3 py-2 text-left">Description</th>
              <th className="px-3 py-2 text-right">Qty</th>
              <th className="px-3 py-2 text-right">Unit price</th>
              <th className="px-3 py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {document.items.map((item) => (
              <tr key={item.id} className="border-t border-border-subtle">
                <td className="px-3 py-2">{item.serial_number}</td>
                <td className="px-3 py-2 whitespace-pre-wrap">{item.description}</td>
                <td className="px-3 py-2 text-right">{formatMoney(item.quantity)}</td>
                <td className="px-3 py-2 text-right">{formatMoney(item.unit_price)}</td>
                <td className="px-3 py-2 text-right">{formatMoney(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-stretch sm:justify-end">
        <div className="flex w-full items-center justify-between rounded-lg border border-border-subtle bg-surface px-4 py-3 sm:w-auto sm:gap-6">
          <span className="mr-6 text-sm font-medium">Grand total</span>
          <span className="text-lg font-semibold">
            {formatMoney(sumLineTotals(document.items))}
          </span>
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete this document?"
        message="This will permanently delete the document and its line items."
        confirmLabel="Delete"
        danger
        busy={busy}
        onClose={() => setDeleteOpen(false)}
        onConfirm={async () => {
          setBusy(true);
          const result = await deleteDocument(document.id);
          setBusy(false);
          if (!result.ok) {
            setError(result.error);
            return;
          }
          router.push("/documents");
          router.refresh();
        }}
      />

      <PrintDateModal
        open={pdfMode !== null}
        title={pdfMode === "print" ? "Print document" : "Download PDF"}
        confirmLabel={pdfMode === "print" ? "Preview" : "Download"}
        busy={busy}
        onClose={() => setPdfMode(null)}
        onConfirm={async (date) => {
          if (pdfMode === "print") {
            setPdfMode(null);
            router.push(`/documents/${document.id}/print?date=${date}`);
            return;
          }
          setBusy(true);
          setError(null);
          try {
            await downloadPdfFile(
              `/api/pdf/${document.id}?date=${date}&download=1`,
              `${document.document_number}.pdf`,
            );
            setPdfMode(null);
          } catch (err) {
            setError(err instanceof Error ? err.message : "PDF download failed.");
          } finally {
            setBusy(false);
          }
        }}
      />
    </div>
  );
}
