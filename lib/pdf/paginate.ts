import type { TemplateLayout } from "@/components/pdf/template-config";
import { measureItemRowHeight } from "@/lib/pdf/text";
import type { DocumentItem } from "@/lib/types";

export type PagedLineItem = DocumentItem & {
  rowHeight: number;
};

export function paginateLineItems(
  items: DocumentItem[],
  layout: TemplateLayout,
): PagedLineItem[][] {
  const available = layout.table.bodyBottom - layout.table.headerBottom;
  const descriptionWidth = layout.table.columns.description.width;
  const pages: PagedLineItem[][] = [];
  let current: PagedLineItem[] = [];
  let used = 0;

  for (const item of items) {
    const description = item.description.toUpperCase();
    const naturalHeight = Math.max(
      layout.table.minRowHeight,
      measureItemRowHeight(description, descriptionWidth),
    );
    const rowHeight = Math.min(naturalHeight, available);

    if (current.length > 0 && used + rowHeight > available + 0.01) {
      pages.push(current);
      current = [];
      used = 0;
    }

    current.push({ ...item, description, rowHeight });
    used += rowHeight;
  }

  if (current.length > 0) {
    pages.push(current);
  }

  return pages.length > 0 ? pages : [];
}
