import { DocumentForm } from "@/components/documents/DocumentForm";
import { listCustomers } from "@/lib/customers/queries";
import { listDescriptions } from "@/lib/descriptions/queries";

export const dynamic = "force-dynamic";

export default async function NewDocumentPage() {
  const [customers, descriptions] = await Promise.all([
    listCustomers().catch(() => []),
    listDescriptions().catch(() => []),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold sm:text-2xl">Create document</h1>
      <DocumentForm customers={customers} descriptions={descriptions} />
    </div>
  );
}
