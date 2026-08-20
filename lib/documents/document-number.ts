import type { DocumentType } from "@/lib/types";

export function prefixForDocumentType(type: DocumentType): "DC" | "QTN" {
  return type === "quotation" ? "QTN" : "DC";
}

export function displayDocumentNumber(documentNumber: string): string {
  return documentNumber.replace(/^(DC|QTN)-/i, "");
}

export async function generateDocumentNumber(
  client: {
    rpc: (
      fn: string,
      args: { p_prefix: string },
    ) => PromiseLike<{ data: string | null; error: { message: string } | null }>;
  },
  type: DocumentType,
): Promise<string> {
  const prefix = prefixForDocumentType(type);
  const { data, error } = await client.rpc("next_document_number", {
    p_prefix: prefix,
  });

  if (error || !data) {
    throw new Error(error?.message ?? "Could not generate a document number.");
  }

  return data;
}
