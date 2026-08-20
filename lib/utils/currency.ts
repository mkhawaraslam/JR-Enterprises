export function formatMoney(value: number): string {
  if (!Number.isFinite(value)) return "0";
  const rounded = roundMoney(value);
  const isWhole = Math.abs(rounded - Math.round(rounded)) < 0.001;
  return new Intl.NumberFormat("en-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: isWhole ? 0 : 2,
  }).format(rounded);
}

export function parseMoney(value: string): number {
  const cleaned = value.replace(/,/g, "").trim();
  if (cleaned === "" || cleaned === "-") return 0;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function suggestedLineTotal(quantity: number, unitPrice: number): number {
  return roundMoney(quantity * unitPrice);
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function sumLineTotals(items: { total: number }[]): number {
  return roundMoney(items.reduce((sum, item) => sum + (Number(item.total) || 0), 0));
}
