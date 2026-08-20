export const DOCUMENT_TYPES = ["invoice", "quotation", "challan"] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export type DocumentItem = {
  id: string;
  document_id: string;
  serial_number: number;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  created_at: string;
};

export type DocumentRecord = {
  id: string;
  document_number: string;
  document_type: DocumentType;
  customer_name: string;
  created_at: string;
  updated_at: string;
};

export type DocumentWithItems = DocumentRecord & {
  items: DocumentItem[];
};

export type LineItemInput = {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
};

export type DocumentInput = {
  customer_name: string;
  document_type: DocumentType;
  items: LineItemInput[];
};
