import { notFound } from "next/navigation";
import { DocumentDetails } from "@/components/documents/DocumentDetails";
import { getDocumentById } from "@/lib/documents/queries";
import { isUuid } from "@/lib/utils/id";

export const dynamic = "force-dynamic";

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isUuid(id)) notFound();

  let document;
  try {
    document = await getDocumentById(id);
  } catch {
    notFound();
  }

  if (!document) notFound();

  return <DocumentDetails document={document} />;
}
