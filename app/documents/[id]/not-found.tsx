import Link from "next/link";

export default function NotFound() {
  return (
    <div className="rounded-xl border border-border-subtle bg-surface p-8">
      <h1 className="text-xl font-semibold">Document not found</h1>
      <p className="mt-2 text-sm text-muted">
        The id is invalid or the document was deleted.
      </p>
      <Link href="/documents" className="mt-4 inline-block text-sm text-[#9b1c1c] dark:text-[#f87171] hover:underline">
        Back to documents
      </Link>
    </div>
  );
}
