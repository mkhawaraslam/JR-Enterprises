import { createClient } from "@/lib/supabase/server";

export type Description = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export async function listDescriptions(): Promise<Description[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("descriptions")
    .select("id, name, created_at, updated_at")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Description[];
}
