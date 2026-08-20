import Link from "next/link";

export default function NotFound() {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-8">
      <h1 className="text-xl font-semibold">Document not found</h1>
      <p className="mt-2 text-sm text-neutral-600">
        The id is invalid or the document was deleted.
      </p>
      <Link href="/documents" className="mt-4 inline-block text-sm text-[#9b1c1c] hover:underline">
        Back to documents
      </Link>
    </div>
  );
}
