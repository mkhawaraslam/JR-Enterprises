"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CustomerCombobox,
  type CustomerOption,
} from "@/components/documents/CustomerCombobox";
import { LineItemsEditor } from "@/components/documents/LineItemsEditor";
import { createDocument, updateDocument } from "@/lib/documents/mutations";
import { documentSchema } from "@/lib/documents/validation";
import { DOCUMENT_TYPES, type DocumentType, type DocumentWithItems } from "@/lib/types";
import { formatMoney, sumLineTotals } from "@/lib/utils/currency";
import { displayDocumentNumber } from "@/lib/documents/document-number";
import type { NamedOption } from "@/components/NameCombobox";

type FormItem = {
  key: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
};

const TYPE_LABELS: Record<DocumentType, string> = {
  invoice: "Invoice",
  quotation: "Quotation",
  challan: "Challan",
};

function emptyItem(key = "item-1"): FormItem {
  return {
    key,
    description: "",
    quantity: 1,
    unit_price: 0,
    total: 0,
  };
}

export function DocumentForm({
  document,
  customers = [],
  descriptions = [],
}: {
  document?: DocumentWithItems;
  customers?: CustomerOption[];
  descriptions?: NamedOption[];
}) {
  const router = useRouter();
  const [customerName, setCustomerName] = useState(document?.customer_name ?? "");
  const [documentType, setDocumentType] = useState<DocumentType>(
    document?.document_type ?? "invoice",
  );
  const [items, setItems] = useState<FormItem[]>(
    document?.items.length
      ? document.items.map((item) => ({
          key: item.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total: item.total,
        }))
      : [emptyItem()],
  );
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const grandTotal = useMemo(() => sumLineTotals(items), [items]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const payload = {
      customer_name: customerName,
      document_type: documentType,
      items: items.map(({ description, quantity, unit_price, total }) => ({
        description,
        quantity,
        unit_price,
        total,
      })),
    };

    const parsed = documentSchema.safeParse(payload);
    if (!parsed.success) {
      setError(parsed.error.issues.map((issue) => issue.message).join(" "));
      return;
    }

    setBusy(true);
    try {
      const result = document
        ? await updateDocument(document.id, parsed.data)
        : await createDocument(parsed.data);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      router.push("/documents");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the document.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium">
          Customer / M/s.
          <CustomerCombobox
            value={customerName}
            customers={customers}
            onChange={setCustomerName}
            required
          />
        </label>
        <label className="text-sm font-medium">
          Document type
          <select
            className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2"
            value={documentType}
            onChange={(event) => setDocumentType(event.target.value as DocumentType)}
            required
          >
            {DOCUMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </label>
      </div>

      {document ? (
        <p className="text-sm text-muted">
          Document number{" "}
          <span className="font-medium">{displayDocumentNumber(document.document_number)}</span> is
          assigned automatically and stays with this record.
        </p>
      ) : (
        <p className="text-sm text-muted">
          Numbers are assigned when you save. Extra items print on additional pages.
          Descriptions wrap inside the table and do not overlap the footer.
        </p>
      )}

      <LineItemsEditor items={items} descriptions={descriptions} onChange={setItems} />

      <div className="flex items-center justify-between rounded-lg border border-border-subtle bg-surface px-4 py-3">
        <span className="text-sm font-medium">Grand total</span>
        <span className="text-lg font-semibold">{formatMoney(grandTotal)}</span>
      </div>

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/50 px-3 py-2 text-sm text-red-800 dark:text-red-300">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="submit"
          className="min-h-11 w-full rounded-md bg-[#9b1c1c] px-4 py-2 text-sm font-medium text-white hover:bg-[#7f1717] disabled:opacity-60 sm:w-auto"
          disabled={busy}
        >
          {busy ? "Saving…" : document ? "Update document" : "Save document"}
        </button>
        <button
          type="button"
          className="min-h-11 w-full rounded-md border border-border px-4 py-2 text-sm hover:bg-surface-muted sm:w-auto"
          onClick={() => router.back()}
          disabled={busy}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
