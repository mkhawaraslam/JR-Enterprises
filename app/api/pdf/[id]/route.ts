import { NextResponse } from "next/server";
import { getDocumentById } from "@/lib/documents/queries";
import { renderBillPdf } from "@/lib/pdf/render";
import { isUuid } from "@/lib/utils/id";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  if (!isUuid(id)) {
    return NextResponse.json({ error: "Invalid document id." }, { status: 400 });
  }

  const url = new URL(request.url);
  const date = url.searchParams.get("date") ?? "";
  const download = url.searchParams.get("download") === "1";

  try {
    const document = await getDocumentById(id);
    if (!document) {
      return NextResponse.json({ error: "Document not found." }, { status: 404 });
    }

    const buffer = await renderBillPdf(document, date);
    const filename = `${document.document_number}.pdf`;

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "PDF generation failed.";
    const status = message.includes("not found") ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
