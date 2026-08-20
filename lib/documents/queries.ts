import { createClient } from "@/lib/supabase/server";
import type { DocumentType, DocumentWithItems } from "@/lib/types";

type ItemRow = {
  id: string;
  document_id: string;
  serial_number: number;
  description: string;
  quantity: number | string;
  unit_price: number | string;
  total: number | string;
  created_at: string;
};

type DocumentRow = {
  id: string;
  document_number: string;
  document_type: DocumentType;
  customer_name: string;
  created_at: string;
  updated_at: string;
  document_items?: ItemRow[] | null;
};

function toNumber(value: number | string): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function mapDocument(row: DocumentRow): DocumentWithItems {
  const items = (row.document_items ?? [])
    .slice()
    .sort((a, b) => a.serial_number - b.serial_number)
    .map((item) => ({
      ...item,
      quantity: toNumber(item.quantity),
      unit_price: toNumber(item.unit_price),
      total: toNumber(item.total),
    }));

  return {
    id: row.id,
    document_number: row.document_number,
    document_type: row.document_type,
    customer_name: row.customer_name,
    created_at: row.created_at,
    updated_at: row.updated_at,
    items,
  };
}

export async function listDocuments(options?: {
  search?: string;
  type?: DocumentType | "all";
}): Promise<DocumentWithItems[]> {
  const supabase = await createClient();
  let query = supabase
    .from("documents")
    .select("*, document_items(*)")
    .order("created_at", { ascending: false });

  if (options?.type && options.type !== "all") {
    query = query.eq("document_type", options.type);
  }

  if (options?.search?.trim()) {
    const term = options.search.trim();
    query = query.or(`document_number.ilike.%${term}%,customer_name.ilike.%${term}%`);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as DocumentRow[]).map(mapDocument);
}

export async function getDocumentById(id: string): Promise<DocumentWithItems | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("documents")
    .select("*, document_items(*)")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapDocument(data as DocumentRow) : null;
}

export async function getDocumentStats() {
  const documents = await listDocuments();
  return {
    total: documents.length,
    invoice: documents.filter((doc) => doc.document_type === "invoice").length,
    quotation: documents.filter((doc) => doc.document_type === "quotation").length,
    challan: documents.filter((doc) => doc.document_type === "challan").length,
    recent: documents.slice(0, 8),
  };
}
