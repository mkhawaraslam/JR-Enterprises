import Link from "next/link";
import { DocumentTable } from "@/components/documents/DocumentTable";
import { getDocumentStats } from "@/lib/documents/queries";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border-subtle bg-surface p-4">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

export default async function HomePage() {
  if (!isSupabaseConfigured()) {
    return (
      <section className="rounded-xl border border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40 p-6">
        <h1 className="text-xl font-semibold">Supabase is not configured</h1>
        <p className="mt-2 text-sm text-amber-950 dark:text-amber-100">
          Copy <code>.env.example</code> to <code>.env.local</code>, add your project URL and
          anon key, then run the SQL in <code>supabase/migrations/001_create_documents.sql</code>.
          Do not put a service-role key in this app.
        </p>
      </section>
    );
  }

  let stats;
  try {
    stats = await getDocumentStats();
  } catch (error) {
    return (
      <section className="rounded-xl border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/50 p-6">
        <h1 className="text-xl font-semibold">Could not load documents</h1>
        <p className="mt-2 text-sm text-red-800 dark:text-red-300">
          {error instanceof Error ? error.message : "Database error."}
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold sm:text-2xl">Dashboard</h1>
          <p className="text-sm text-muted">
            Invoices, quotations, and challans for J.R. Enterprises.
          </p>
        </div>
        <Link
          href="/documents/new"
          className="min-h-11 w-full rounded-md bg-[#9b1c1c] px-4 py-2 text-center text-sm font-medium text-white hover:bg-[#7f1717] sm:w-auto"
        >
          Create New Document
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total documents" value={stats.total} />
        <StatCard label="Invoices" value={stats.invoice} />
        <StatCard label="Quotations" value={stats.quotation} />
        <StatCard label="Challans" value={stats.challan} />
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent documents</h2>
          <Link href="/documents" className="text-sm text-[#9b1c1c] dark:text-[#f87171] hover:underline">
            View all
          </Link>
        </div>
        <DocumentTable documents={stats.recent} />
      </section>
    </div>
  );
}
