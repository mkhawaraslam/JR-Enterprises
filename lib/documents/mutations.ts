"use server";

import { revalidatePath } from "next/cache";
import { ensureCustomer } from "@/lib/customers/mutations";
import { ensureDescription } from "@/lib/descriptions/mutations";
import { generateDocumentNumber } from "@/lib/documents/document-number";
import { documentSchema, flattenZodError } from "@/lib/documents/validation";
import { createClient } from "@/lib/supabase/server";
import type { DocumentInput, DocumentType } from "@/lib/types";

function revalidateDocumentPaths(id?: string) {
  revalidatePath("/");
  revalidatePath("/documents");
  revalidatePath("/documents/new");
  revalidatePath("/descriptions");
  if (id) {
    revalidatePath(`/documents/${id}`);
    revalidatePath(`/documents/${id}/edit`);
    revalidatePath(`/documents/${id}/print`);
  }
}

async function resolveCustomerName(rawName: string) {
  const customer = await ensureCustomer(rawName);
  if (!customer.ok) {
    return { ok: false as const, error: customer.error };
  }
  return { ok: true as const, name: customer.name };
}

async function resolveDescriptions(items: { description: string }[]) {
  const names: string[] = [];
  for (const item of items) {
    const description = await ensureDescription(item.description);
    if (!description.ok) {
      return { ok: false as const, error: description.error };
    }
    names.push(description.name);
  }
  return { ok: true as const, names };
}

export async function createDocument(input: DocumentInput) {
  const parsed = documentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: flattenZodError(parsed.error) };
  }

  try {
    const customer = await resolveCustomerName(parsed.data.customer_name);
    if (!customer.ok) {
      return customer;
    }

    const descriptions = await resolveDescriptions(parsed.data.items);
    if (!descriptions.ok) {
      return descriptions;
    }

    const supabase = await createClient();
    const documentNumber = await generateDocumentNumber(supabase, parsed.data.document_type);

    const { data: document, error: documentError } = await supabase
      .from("documents")
      .insert({
        document_number: documentNumber,
        document_type: parsed.data.document_type,
        customer_name: customer.name,
      })
      .select("id")
      .single();

    if (documentError || !document) {
      return { ok: false as const, error: documentError?.message ?? "Could not save the document." };
    }

    const items = parsed.data.items.map((item, index) => ({
      document_id: document.id,
      serial_number: index + 1,
      description: descriptions.names[index],
      quantity: item.quantity,
      unit_price: item.unit_price,
      total: item.total,
    }));

    const { error: itemsError } = await supabase.from("document_items").insert(items);
    if (itemsError) {
      await supabase.from("documents").delete().eq("id", document.id);
      return { ok: false as const, error: itemsError.message };
    }

    revalidateDocumentPaths(document.id);
    return { ok: true as const, id: document.id as string };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Could not save the document.",
    };
  }
}

export async function updateDocument(id: string, input: DocumentInput) {
  if (!id) {
    return { ok: false as const, error: "Missing document id." };
  }

  const parsed = documentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: flattenZodError(parsed.error) };
  }

  try {
    const customer = await resolveCustomerName(parsed.data.customer_name);
    if (!customer.ok) {
      return customer;
    }

    const descriptions = await resolveDescriptions(parsed.data.items);
    if (!descriptions.ok) {
      return descriptions;
    }

    const supabase = await createClient();
    const { error: documentError } = await supabase
      .from("documents")
      .update({
        document_type: parsed.data.document_type,
        customer_name: customer.name,
      })
      .eq("id", id);

    if (documentError) {
      return { ok: false as const, error: documentError.message };
    }

    const { error: deleteError } = await supabase.from("document_items").delete().eq("document_id", id);
    if (deleteError) {
      return { ok: false as const, error: deleteError.message };
    }

    const items = parsed.data.items.map((item, index) => ({
      document_id: id,
      serial_number: index + 1,
      description: descriptions.names[index],
      quantity: item.quantity,
      unit_price: item.unit_price,
      total: item.total,
    }));

    const { error: itemsError } = await supabase.from("document_items").insert(items);
    if (itemsError) {
      return { ok: false as const, error: itemsError.message };
    }

    revalidateDocumentPaths(id);
    return { ok: true as const, id };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Could not update the document.",
    };
  }
}

export async function updateDocumentStatus(id: string, documentType: DocumentType) {
  const parsed = documentSchema.shape.document_type.safeParse(documentType);
  if (!parsed.success) {
    return { ok: false as const, error: "Choose a valid document type." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("documents")
      .update({ document_type: parsed.data })
      .eq("id", id);

    if (error) {
      return { ok: false as const, error: error.message };
    }

    revalidateDocumentPaths(id);
    return { ok: true as const };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Could not change status.",
    };
  }
}

export async function deleteDocument(id: string) {
  if (!id) {
    return { ok: false as const, error: "Missing document id." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("documents").delete().eq("id", id);
    if (error) {
      return { ok: false as const, error: error.message };
    }

    revalidateDocumentPaths(id);
    return { ok: true as const };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Could not delete the document.",
    };
  }
}
