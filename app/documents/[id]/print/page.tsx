import { notFound } from "next/navigation";
import { PrintDocumentClient } from "@/components/documents/PrintDocumentClient";
import { getDocumentById } from "@/lib/documents/queries";
import { isUuid } from "@/lib/utils/id";

export const dynamic = "force-dynamic";

export default async function PrintDocumentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ date?: string }>;
}) {
  const { id } = await params;
  const { date } = await searchParams;
  if (!isUuid(id)) notFound();

  const document = await getDocumentById(id);
  if (!document) notFound();

  return <PrintDocumentClient document={document} initialDate={date ?? ""} />;
}
