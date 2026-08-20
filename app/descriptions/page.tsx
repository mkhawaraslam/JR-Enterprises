import { DescriptionManager } from "@/components/descriptions/DescriptionManager";
import { listDescriptions } from "@/lib/descriptions/queries";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export default async function DescriptionsPage() {
  if (!isSupabaseConfigured()) {
    return <p>Configure Supabase in .env.local to manage descriptions.</p>;
  }

  let descriptions;
  try {
    descriptions = await listDescriptions();
  } catch (error) {
    return (
      <section className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h1 className="text-xl font-semibold">Could not load descriptions</h1>
        <p className="mt-2 text-sm text-red-800">
          {error instanceof Error ? error.message : "Database error."} Run{" "}
          <code>supabase/migrations/004_create_descriptions.sql</code> in the Supabase SQL editor.
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold sm:text-2xl">Descriptions</h1>
        <p className="text-sm text-neutral-600">
          These names appear in the line-item dropdown. Documents store the text only.
        </p>
      </div>
      <DescriptionManager descriptions={descriptions} />
    </div>
  );
}
