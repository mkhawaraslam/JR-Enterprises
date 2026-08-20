import { writeFileSync } from "node:fs";
import path from "node:path";
import { pdf } from "@react-pdf/renderer";
import { BillPdf } from "../components/pdf/BillPdf";
import type { DocumentType, DocumentWithItems } from "../lib/types";

const mock = (type: DocumentType, number: string): DocumentWithItems => ({
  id: "00000000-0000-4000-8000-000000000001",
  document_number: number,
  document_type: type,
  customer_name: "ABC Industrial Supplies",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  items: [
    {
      id: "1",
      document_id: "00000000-0000-4000-8000-000000000001",
      serial_number: 1,
      description: "Pneumatic cylinder ISO 6432",
      quantity: 2,
      unit_price: 4500,
      total: 9000,
      created_at: new Date().toISOString(),
    },
    {
      id: "2",
      document_id: "00000000-0000-4000-8000-000000000001",
      serial_number: 2,
      description: "SS ball valve 1/2 inch with PTFE seats",
      quantity: 4,
      unit_price: 1250,
      total: 5000,
      created_at: new Date().toISOString(),
    },
    {
      id: "3",
      document_id: "00000000-0000-4000-8000-000000000001",
      serial_number: 3,
      description: "Hydraulic hose assembly",
      quantity: 1,
      unit_price: 3200,
      total: 3200,
      created_at: new Date().toISOString(),
    },
  ],
});

async function run() {
  const outDir = path.join(process.cwd(), "tmp-pdf");
  const { mkdirSync } = await import("node:fs");
  mkdirSync(outDir, { recursive: true });

  const jobs: Array<[DocumentType, string]> = [
    ["invoice", "DC-00001"],
    ["quotation", "QTN-00001"],
    ["challan", "DC-00002"],
  ];

  for (const [type, number] of jobs) {
    const templateSrc = path.join(process.cwd(), "public/templates", `${type}.jpg`);
    const blob = await pdf(
      <BillPdf
        type={type}
        document={mock(type, number)}
        printDate="2026-08-19"
        templateSrc={templateSrc}
      />,
    ).toBlob();
    const file = path.join(outDir, `${type}.pdf`);
    writeFileSync(file, Buffer.from(await blob.arrayBuffer()));
    console.log("wrote", file);
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
