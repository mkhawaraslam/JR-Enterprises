import { existsSync } from "node:fs";
import path from "node:path";
import { pdf } from "@react-pdf/renderer";
import { BillPdf } from "@/components/pdf/BillPdf";
import { TEMPLATE_CONFIG, templatePublicPath } from "@/components/pdf/template-config";
import type { DocumentWithItems } from "@/lib/types";

export function getTemplateFilePath(type: DocumentWithItems["document_type"]) {
  return path.join(process.cwd(), "public", "templates", TEMPLATE_CONFIG[type].fileName);
}

export function assertPdfReady(document: DocumentWithItems, printDate: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(printDate)) {
    throw new Error("Choose a valid print date.");
  }

  const filePath = getTemplateFilePath(document.document_type);
  if (!existsSync(filePath)) {
    throw new Error(
      `Missing PDF template for ${document.document_type}. Expected ${templatePublicPath(document.document_type)}.`,
    );
  }

  return filePath;
}

export async function renderBillPdf(document: DocumentWithItems, printDate: string) {
  const templateSrc = assertPdfReady(document, printDate);

  try {
    const instance = pdf(
      <BillPdf
        type={document.document_type}
        document={document}
        printDate={printDate}
        templateSrc={templateSrc}
      />,
    );
    const blob = await instance.toBlob();
    return Buffer.from(await blob.arrayBuffer());
  } catch (error) {
    throw new Error(
      error instanceof Error ? `PDF generation failed: ${error.message}` : "PDF generation failed.",
    );
  }
}
