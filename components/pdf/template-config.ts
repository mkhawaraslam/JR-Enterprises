import type { DocumentType } from "@/lib/types";

export const PAGE = {
  width: 595.28,
  height: 841.89,
} as const;

export const TEMPLATE_IMAGE = {
  width: 1032,
  height: 1375,
} as const;

export function fromPx(x: number, y: number) {
  return {
    x: (x / TEMPLATE_IMAGE.width) * PAGE.width,
    y: (y / TEMPLATE_IMAGE.height) * PAGE.height,
  };
}

export function fromPxSize(width: number, height: number) {
  return {
    width: (width / TEMPLATE_IMAGE.width) * PAGE.width,
    height: (height / TEMPLATE_IMAGE.height) * PAGE.height,
  };
}

export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type TemplateLayout = {
  fileName: "invoice.jpg" | "quotation.jpg" | "challan.jpg";
  numberLabel: "DC #" | "Quotation #";
  number: Rect;
  date: Rect;
  customer: Rect;
  pageLabel: Rect;
  table: {
    headerBottom: number;
    bodyBottom: number;
    minRowHeight: number;
    columns: {
      sr: Rect;
      description: Rect;
      qty: Rect;
      unitPrice: Rect;
      total: Rect;
    };
  };
  belowTableCover: Rect;
  grandTotal: {
    variant: "table-row" | "stacked";
    label?: Rect;
    value: Rect;
  };
};

const headerBottomY = 504;
const tableBottomY = 1073;
const itemRowHeight = 36;

const columns = {
  sr: { x: 85, width: 56 },
  description: { x: 141, width: 395 },
  qty: { x: 536, width: 88 },
  unitPrice: { x: 624, width: 138 },
  total: { x: 762, width: 183 },
};

function colRect(
  col: { x: number; width: number },
  y: number,
  height: number,
): Rect {
  const pos = fromPx(col.x, y);
  const size = fromPxSize(col.width, height);
  return { x: pos.x, y: pos.y, width: size.width, height: size.height };
}

function sharedFields(): Pick<
  TemplateLayout,
  "number" | "date" | "customer" | "pageLabel" | "table" | "belowTableCover"
> {
  return {
    number: { ...fromPx(175, 356), ...fromPxSize(270, 24) },
    date: { ...fromPx(705, 356), ...fromPxSize(220, 24) },
    customer: { ...fromPx(155, 416), ...fromPxSize(770, 24) },
    pageLabel: { ...fromPx(762, 438), ...fromPxSize(183, 20) },
    table: {
      headerBottom: fromPx(0, headerBottomY).y,
      bodyBottom: fromPx(0, tableBottomY).y,
      minRowHeight: fromPxSize(0, itemRowHeight).height,
      columns: {
        sr: colRect(columns.sr, headerBottomY, itemRowHeight),
        description: colRect(columns.description, headerBottomY, itemRowHeight),
        qty: colRect(columns.qty, headerBottomY, itemRowHeight),
        unitPrice: colRect(columns.unitPrice, headerBottomY, itemRowHeight),
        total: colRect(columns.total, headerBottomY, itemRowHeight),
      },
    },
    belowTableCover: {
      ...fromPx(85, tableBottomY + 1),
      ...fromPxSize(860, 88),
    },
  };
}

export const TEMPLATE_CONFIG: Record<DocumentType, TemplateLayout> = {
  invoice: {
    fileName: "invoice.jpg",
    numberLabel: "DC #",
    ...sharedFields(),
    grandTotal: {
      variant: "stacked",
      value: colRect(columns.total, 1116, 34),
    },
  },
  quotation: {
    fileName: "quotation.jpg",
    numberLabel: "Quotation #",
    ...sharedFields(),
    number: { ...fromPx(255, 356), ...fromPxSize(240, 24) },
    grandTotal: {
      variant: "stacked",
      value: colRect(columns.total, 1116, 34),
    },
  },
  challan: {
    fileName: "challan.jpg",
    numberLabel: "DC #",
    ...sharedFields(),
    grandTotal: {
      variant: "stacked",
      value: colRect(columns.total, 1116, 34),
    },
  },
};

export function templatePublicPath(type: DocumentType) {
  return `/templates/${TEMPLATE_CONFIG[type].fileName}`;
}
