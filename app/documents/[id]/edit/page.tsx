import { notFound } from "next/navigation";
import { DocumentForm } from "@/components/documents/DocumentForm";
import { listCustomers } from "@/lib/customers/queries";
import { listDescriptions } from "@/lib/descriptions/queries";
import { getDocumentById } from "@/lib/documents/queries";
import { displayDocumentNumber } from "@/lib/documents/document-number";
import { isUuid } from "@/lib/utils/id";

export const dynamic = "force-dynamic";

export default async function EditDocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isUuid(id)) notFound();

  const document = await getDocumentById(id);
  if (!document) notFound();

  const [customers, descriptions] = await Promise.all([
    listCustomers().catch(() => []),
    listDescriptions().catch(() => []),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold sm:text-2xl">
          Edit {displayDocumentNumber(document.document_number)}
        </h1>
        <p className="text-sm text-muted">
          Line totals stay as entered. Grand total is the sum of those totals.
        </p>
      </div>
      <DocumentForm document={document} customers={customers} descriptions={descriptions} />
    </div>
  );
}
