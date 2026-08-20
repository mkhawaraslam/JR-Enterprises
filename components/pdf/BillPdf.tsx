import { Document, Image, Page, Text, View } from "@react-pdf/renderer";
import { pdfStyles } from "@/components/pdf/pdfStyles";
import { TEMPLATE_CONFIG, type Rect, type TemplateLayout } from "@/components/pdf/template-config";
import { displayDocumentNumber } from "@/lib/documents/document-number";
import { paginateLineItems, type PagedLineItem } from "@/lib/pdf/paginate";
import type { DocumentType, DocumentWithItems } from "@/lib/types";
import { formatMoney } from "@/lib/utils/currency";

export type BillPdfProps = {
  type: DocumentType;
  document: DocumentWithItems;
  printDate: string;
  templateSrc: string;
};

function Field({
  box,
  children,
  bold = false,
  align = "left",
}: {
  box: Rect;
  children: string;
  bold?: boolean;
  align?: "left" | "center" | "right";
}) {
  return (
    <View
      style={[
        pdfStyles.field,
        { left: box.x, top: box.y, width: box.width, height: box.height },
      ]}
    >
      <Text
        style={[
          bold ? pdfStyles.fieldTextBold : pdfStyles.fieldText,
          { textAlign: align },
        ]}
      >
        {children}
      </Text>
    </View>
  );
}

export function formatPrintDate(isoDate: string) {
  const [year, month, day] = isoDate.split("-");
  if (!year || !month || !day) return isoDate;
  return `${day}-${month}-${year}`;
}

function LineItemRow({
  item,
  y,
  layout,
}: {
  item: PagedLineItem;
  y: number;
  layout: TemplateLayout;
}) {
  const cols = layout.table.columns;
  const height = item.rowHeight;

  return (
    <View>
      <View style={[pdfStyles.cell, { left: cols.sr.x, top: y, width: cols.sr.width, height }]}>
        <Text style={[pdfStyles.cellText, pdfStyles.cellCenter]}>{item.serial_number}</Text>
      </View>
      <View
        style={[
          pdfStyles.cell,
          { left: cols.description.x, top: y, width: cols.description.width, height },
        ]}
      >
        <Text style={pdfStyles.cellText}>{item.description}</Text>
      </View>
      <View style={[pdfStyles.cell, { left: cols.qty.x, top: y, width: cols.qty.width, height }]}>
        <Text style={[pdfStyles.cellText, pdfStyles.cellCenter]}>{formatMoney(item.quantity)}</Text>
      </View>
      <View
        style={[
          pdfStyles.cell,
          { left: cols.unitPrice.x, top: y, width: cols.unitPrice.width, height },
        ]}
      >
        <Text style={[pdfStyles.cellText, pdfStyles.cellRight]}>
          {formatMoney(item.unit_price)}
        </Text>
      </View>
      <View
        style={[pdfStyles.cell, { left: cols.total.x, top: y, width: cols.total.width, height }]}
      >
        <Text style={[pdfStyles.cellText, pdfStyles.cellRight]}>{formatMoney(item.total)}</Text>
      </View>
    </View>
  );
}

export function BillPdf({ type, document, printDate, templateSrc }: BillPdfProps) {
  const layout = TEMPLATE_CONFIG[type];
  const pages = paginateLineItems(document.items, layout);
  const sheetCount = Math.max(1, pages.length);
  const grandTotal = document.items.reduce((sum, item) => sum + item.total, 0);

  return (
    <Document
      title={`${document.document_number} ${type}`}
      author="J.R. Enterprises"
    >
      {Array.from({ length: sheetCount }, (_, pageIndex) => {
        const pageItems = pages[pageIndex] ?? [];
        const isLastPage = pageIndex === sheetCount - 1;
        let y = layout.table.headerBottom;

        return (
          <Page key={pageIndex} size="A4" style={pdfStyles.page} wrap={false}>
            <View style={pdfStyles.canvas} />
            <Image src={templateSrc} style={pdfStyles.background} />

            <Field box={layout.number} bold>
              {displayDocumentNumber(document.document_number)}
            </Field>
            <Field box={layout.date} bold>
              {formatPrintDate(printDate)}
            </Field>
            <Field box={layout.customer} bold>
              {document.customer_name}
            </Field>
            {sheetCount > 1 ? (
              <Field box={layout.pageLabel} bold align="right">
                {`Page ${pageIndex + 1} of ${sheetCount}`}
              </Field>
            ) : null}

            <View style={{ position: "absolute", left: 0, top: 0 }}>
              {pageItems.map((item) => {
                const top = y;
                y += item.rowHeight;
                return (
                  <LineItemRow
                    key={`${item.id}-${pageIndex}`}
                    item={item}
                    y={top}
                    layout={layout}
                  />
                );
              })}
            </View>

            {isLastPage ? (
              <Field box={layout.grandTotal.value} bold align="right">
                {formatMoney(grandTotal)}
              </Field>
            ) : (
              <View
                style={[
                  pdfStyles.cover,
                  {
                    left: layout.belowTableCover.x,
                    top: layout.belowTableCover.y,
                    width: layout.belowTableCover.width,
                    height: layout.belowTableCover.height,
                  },
                ]}
              />
            )}
          </Page>
        );
      })}
    </Document>
  );
}
