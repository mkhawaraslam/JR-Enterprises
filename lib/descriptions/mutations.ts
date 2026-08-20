"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function normalizeName(name: string) {
  return name.trim().replace(/\s+/g, " ");
}

function revalidateDescriptionPaths() {
  revalidatePath("/descriptions");
  revalidatePath("/documents/new");
  revalidatePath("/documents", "layout");
  revalidatePath("/");
}

export async function ensureDescription(name: string) {
  const normalized = normalizeName(name);
  if (!normalized) {
    return { ok: false as const, error: "Each item needs a description." };
  }

  try {
    const supabase = await createClient();

    const { data: existing, error: lookupError } = await supabase
      .from("descriptions")
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
      .from("descriptions")
      .insert({ name: normalized })
      .select("id, name")
      .single();

    if (insertError) {
      if (insertError.code === "23505") {
        const { data: raced } = await supabase
          .from("descriptions")
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

    revalidateDescriptionPaths();
    return { ok: true as const, id: created.id as string, name: created.name as string };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Could not save the description.",
    };
  }
}

export async function createDescription(name: string) {
  return ensureDescription(name);
}

export async function updateDescription(id: string, name: string) {
  if (!id) {
    return { ok: false as const, error: "Missing description id." };
  }

  const normalized = normalizeName(name);
  if (!normalized) {
    return { ok: false as const, error: "Description name is required." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("descriptions").update({ name: normalized }).eq("id", id);
    if (error) {
      if (error.code === "23505") {
        return { ok: false as const, error: "That description already exists." };
      }
      return { ok: false as const, error: error.message };
    }

    revalidateDescriptionPaths();
    return { ok: true as const };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Could not update the description.",
    };
  }
}

export async function deleteDescription(id: string) {
  if (!id) {
    return { ok: false as const, error: "Missing description id." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("descriptions").delete().eq("id", id);
    if (error) {
      return { ok: false as const, error: error.message };
    }

    revalidateDescriptionPaths();
    return { ok: true as const };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Could not delete the description.",
    };
  }
}
