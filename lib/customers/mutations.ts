"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function normalizeCustomerName(name: string) {
  return name.trim().replace(/\s+/g, " ");
}

export async function ensureCustomer(name: string) {
  const normalized = normalizeCustomerName(name);
  if (!normalized) {
    return { ok: false as const, error: "Customer / M/s. is required." };
  }

  try {
    const supabase = await createClient();

    const { data: existing, error: lookupError } = await supabase
      .from("customers")
      .select("id, name")
      .ilike("name", normalized)
      .limit(1)
      .maybeSingle();

    if (lookupError) {
      return { ok: false as const, error: lookupError.message };
    }

    if (existing) {
      return { ok: true as const, id: existing.id as string, name: existing.name as string };
    }

    const { data: created, error: insertError } = await supabase
      .from("customers")
      .insert({ name: normalized })
      .select("id, name")
      .single();

    if (insertError) {
      // Another request may have inserted the same name concurrently.
      if (insertError.code === "23505") {
        const { data: raced } = await supabase
          .from("customers")
          .select("id, name")
          .ilike("name", normalized)
          .limit(1)
          .maybeSingle();
        if (raced) {
          return { ok: true as const, id: raced.id as string, name: raced.name as string };
        }
      }
      return { ok: false as const, error: insertError.message };
    }

    revalidatePath("/documents/new");
    revalidatePath("/documents");
    return { ok: true as const, id: created.id as string, name: created.name as string };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Could not save the customer.",
    };
  }
}
