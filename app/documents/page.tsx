import Link from "next/link";
import { DocumentTable } from "@/components/documents/DocumentTable";
import { listDocuments } from "@/lib/documents/queries";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
  if (!isSupabaseConfigured()) {
    return <p>Configure Supabase in .env.local to list documents.</p>;
  }

  let documents;
  try {
    documents = await listDocuments();
  } catch (error) {
    return (
      <p className="text-red-700 dark:text-red-400">
        {error instanceof Error ? error.message : "Could not load documents."}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold sm:text-2xl">Documents</h1>
        <Link
          href="/documents/new"
          className="min-h-11 w-full rounded-md bg-[#9b1c1c] px-4 py-2 text-center text-sm font-medium text-white hover:bg-[#7f1717] sm:w-auto"
        >
          Create New Document
        </Link>
      </div>
      <DocumentTable documents={documents} />
    </div>
  );
}
