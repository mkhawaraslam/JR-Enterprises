import { createClient } from "@/lib/supabase/server";

export type Customer = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export async function listCustomers(): Promise<Customer[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customers")
    .select("id, name, created_at, updated_at")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Customer[];
}
