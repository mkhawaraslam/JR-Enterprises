"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { PrintDateModal } from "@/components/documents/PrintDateModal";
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

function formatDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}

export function DocumentTable({ documents }: { documents: DocumentWithItems[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [type, setType] = useState<DocumentType | "all">("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [pdfTarget, setPdfTarget] = useState<{
    id: string;
    mode: "print" | "download";
    type: DocumentType;
    documentNumber: string;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return documents.filter((doc) => {
      const matchesType = type === "all" || doc.document_type === type;
      const matchesSearch =
        !term ||
        doc.document_number.toLowerCase().includes(term) ||
        doc.customer_name.toLowerCase().includes(term);
      return matchesType && matchesSearch;
    });
  }, [documents, search, type]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <input
          className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm"
          placeholder="Search number or customer"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select
          className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm sm:w-48"
          value={type}
          onChange={(event) => setType(event.target.value as DocumentType | "all")}
        >
          <option value="all">All statuses</option>
          <option value="invoice">Invoice</option>
          <option value="quotation">Quotation</option>
          <option value="challan">Challan</option>
        </select>
      </div>
      {error ? <p className="text-sm text-red-700 dark:text-red-400">{error}</p> : null}

      <div className="space-y-3 md:hidden">
        {filtered.length === 0 ? (
          <p className="rounded-lg border border-border-subtle bg-surface px-4 py-8 text-center text-muted">
            No documents match these filters.
          </p>
        ) : (
          filtered.map((doc) => (
            <article
              key={doc.id}
              className="rounded-lg border border-border-subtle bg-surface p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wide text-muted">
                    {TYPE_LABELS[doc.document_type]}
                  </p>
                  <p className="text-lg font-semibold">
                    {displayDocumentNumber(doc.document_number)}
                  </p>
                  <p className="mt-1 truncate text-sm text-muted-strong">{doc.customer_name}</p>
                </div>
                <p className="shrink-0 text-sm font-medium">
                  {formatMoney(sumLineTotals(doc.items))}
                </p>
              </div>
              <p className="mt-2 text-xs text-muted">
                {formatDate(doc.created_at)} · {doc.items.length} item
                {doc.items.length === 1 ? "" : "s"}
              </p>
              <div className="mt-3 flex flex-wrap gap-x-3 gap-y-2 text-sm text-[#9b1c1c] dark:text-[#f87171]">
                <Link className="min-h-10 py-1.5" href={`/documents/${doc.id}`}>
                  View
                </Link>
                <Link className="min-h-10 py-1.5" href={`/documents/${doc.id}/edit`}>
                  Edit
                </Link>
                <button
                  type="button"
                  className="min-h-10 py-1.5"
                  onClick={() =>
                    setPdfTarget({
                      id: doc.id,
                      mode: "print",
                      type: doc.document_type,
                      documentNumber: doc.document_number,
                    })
                  }
                >
                  Print
                </button>
                <button
                  type="button"
                  className="min-h-10 py-1.5"
                  onClick={() =>
                    setPdfTarget({
                      id: doc.id,
                      mode: "download",
                      type: doc.document_type,
                      documentNumber: doc.document_number,
                    })
                  }
                >
                  Download
                </button>
                <button
                  type="button"
                  className="min-h-10 py-1.5 text-red-700 dark:text-red-400"
                  onClick={() => setDeleteId(doc.id)}
                >
                  Delete
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      <div className="hidden overflow-x-auto rounded-lg border border-border-subtle bg-surface md:block">
        <table className="min-w-full text-sm">
          <thead className="bg-surface-muted text-left">
            <tr>
              <th className="px-3 py-2 font-medium">Document number</th>
              <th className="px-3 py-2 font-medium">Type</th>
              <th className="px-3 py-2 font-medium">Customer</th>
              <th className="px-3 py-2 font-medium">Date</th>
              <th className="px-3 py-2 font-medium">Items</th>
              <th className="px-3 py-2 font-medium">Grand total</th>
              <th className="px-3 py-2 font-medium">Created</th>
              <th className="px-3 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-muted">
                  No documents match these filters.
                </td>
              </tr>
            ) : (
              filtered.map((doc) => (
                <tr key={doc.id} className="border-t border-border-subtle">
                  <td className="px-3 py-2 font-medium">
                    {displayDocumentNumber(doc.document_number)}
                  </td>
                  <td className="px-3 py-2">{TYPE_LABELS[doc.document_type]}</td>
                  <td className="px-3 py-2">{doc.customer_name}</td>
                  <td className="px-3 py-2">{formatDate(doc.created_at)}</td>
                  <td className="px-3 py-2">{doc.items.length}</td>
                  <td className="px-3 py-2">{formatMoney(sumLineTotals(doc.items))}</td>
                  <td className="px-3 py-2">{formatDate(doc.created_at)}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-2 text-[#9b1c1c] dark:text-[#f87171]">
                      <Link className="hover:underline" href={`/documents/${doc.id}`}>
                        View
                      </Link>
                      <Link className="hover:underline" href={`/documents/${doc.id}/edit`}>
                        Edit
                      </Link>
                      <button
                        type="button"
                        className="hover:underline"
                        onClick={() =>
                          setPdfTarget({
                            id: doc.id,
                            mode: "print",
                            type: doc.document_type,
                            documentNumber: doc.document_number,
                          })
                        }
                      >
                        Print
                      </button>
                      <button
                        type="button"
                        className="hover:underline"
                        onClick={() =>
                          setPdfTarget({
                            id: doc.id,
                            mode: "download",
                            type: doc.document_type,
                            documentNumber: doc.document_number,
                          })
                        }
                      >
                        Download PDF
                      </button>
                      <button
                        type="button"
                        className="text-red-700 dark:text-red-400 hover:underline"
                        onClick={() => setDeleteId(doc.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete this document?"
        message="This will permanently delete the document and its line items."
        confirmLabel="Delete"
        danger
        busy={busy}
        onClose={() => setDeleteId(null)}
        onConfirm={async () => {
          if (!deleteId) return;
          setBusy(true);
          setError(null);
          const result = await deleteDocument(deleteId);
          setBusy(false);
          if (!result.ok) {
            setError(result.error);
            return;
          }
          setDeleteId(null);
          router.refresh();
        }}
      />

      <PrintDateModal
        open={Boolean(pdfTarget)}
        title={pdfTarget?.mode === "print" ? "Print document" : "Download PDF"}
        confirmLabel={pdfTarget?.mode === "print" ? "Preview" : "Download"}
        busy={busy}
        onClose={() => setPdfTarget(null)}
        onConfirm={async (date) => {
          if (!pdfTarget) return;
          if (pdfTarget.mode === "print") {
            const id = pdfTarget.id;
            setPdfTarget(null);
            router.push(`/documents/${id}/print?date=${date}`);
            return;
          }
          setBusy(true);
          setError(null);
          try {
            await downloadPdfFile(
              `/api/pdf/${pdfTarget.id}?date=${date}&download=1`,
              `${pdfTarget.documentNumber}.pdf`,
            );
            setPdfTarget(null);
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
