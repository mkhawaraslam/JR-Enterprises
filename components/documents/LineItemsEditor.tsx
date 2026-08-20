"use client";

import { useEffect, useState } from "react";
import { NameCombobox, type NamedOption } from "@/components/NameCombobox";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { suggestedLineTotal } from "@/lib/utils/currency";
import type { LineItemInput } from "@/lib/types";

type EditorItem = LineItemInput & { key: string };

function parseNumber(value: string) {
  if (value.trim() === "") return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function upsertOption(options: NamedOption[], name: string) {
  const trimmed = name.trim();
  if (!trimmed) return options;
  if (options.some((option) => option.name.toLowerCase() === trimmed.toLowerCase())) {
    return options;
  }
  return [...options, { id: `local-${trimmed}`, name: trimmed }].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
}

export function LineItemsEditor({
  items,
  descriptions = [],
  onChange,
}: {
  items: EditorItem[];
  descriptions?: NamedOption[];
  onChange: (items: EditorItem[]) => void;
}) {
  const isMobile = useIsMobile();
  const [catalog, setCatalog] = useState(descriptions);

  useEffect(() => {
    setCatalog(descriptions);
  }, [descriptions]);

  function update(index: number, patch: Partial<LineItemInput>) {
    onChange(
      items.map((item, i) => {
        if (i !== index) return item;
        const next = { ...item, ...patch };
        if ("quantity" in patch || "unit_price" in patch) {
          next.total = suggestedLineTotal(next.quantity, next.unit_price);
        }
        return next;
      }),
    );
  }

  function rememberDescription(name: string) {
    setCatalog((current) => upsertOption(current, name));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">Line items</h2>
        <button
          type="button"
          className="min-h-10 rounded-md border border-border px-3 py-2 text-sm hover:bg-surface-muted"
          onClick={() =>
            onChange([
              ...items,
              {
                key: crypto.randomUUID(),
                description: "",
                quantity: 1,
                unit_price: 0,
                total: 0,
              },
            ])
          }
        >
          Add item
        </button>
      </div>

      {isMobile ? (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={item.key} className="rounded-lg border border-border-subtle bg-surface p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-muted">Item {index + 1}</span>
                <button
                  type="button"
                  className="min-h-10 text-sm text-red-700 dark:text-red-400 disabled:text-muted"
                  disabled={items.length === 1}
                  onClick={() => onChange(items.filter((_, i) => i !== index))}
                >
                  Remove
                </button>
              </div>
              <label className="block text-sm font-medium">
                Description
                <NameCombobox
                  value={item.description}
                  options={catalog}
                  onChange={(name) => update(index, { description: name })}
                  onSelect={rememberDescription}
                  required
                  placeholder="Type to search or create"
                  emptyLabel="Start typing a description."
                />
              </label>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <label className="text-sm font-medium">
                  Qty
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    className="mt-1 w-full rounded-md border border-border px-3 py-2"
                    value={item.quantity}
                    onChange={(event) =>
                      update(index, { quantity: parseNumber(event.target.value) })
                    }
                    required
                  />
                </label>
                <label className="text-sm font-medium">
                  Unit price
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    className="mt-1 w-full rounded-md border border-border px-3 py-2"
                    value={item.unit_price}
                    onChange={(event) =>
                      update(index, { unit_price: parseNumber(event.target.value) })
                    }
                    required
                  />
                </label>
              </div>
              <label className="mt-3 block text-sm font-medium">
                Total
                <input
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  className="mt-1 w-full rounded-md border border-border px-3 py-2"
                  value={item.total}
                  onChange={(event) => update(index, { total: parseNumber(event.target.value) })}
                  required
                />
              </label>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-border-subtle bg-surface">
          <table className="min-w-full text-sm">
            <thead className="bg-neutral-900 text-white">
              <tr>
                <th className="px-2 py-2 text-left font-medium">Sr. #</th>
                <th className="px-2 py-2 text-left font-medium">Description</th>
                <th className="px-2 py-2 text-left font-medium">Qty</th>
                <th className="px-2 py-2 text-left font-medium">Unit price</th>
                <th className="px-2 py-2 text-left font-medium">Total</th>
                <th className="px-2 py-2" />
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.key} className="border-t border-border-subtle align-top">
                  <td className="px-2 py-2 text-muted">{index + 1}</td>
                  <td className="relative z-10 px-2 py-2 min-w-64">
                    <NameCombobox
                      value={item.description}
                      options={catalog}
                      onChange={(name) => update(index, { description: name })}
                      onSelect={rememberDescription}
                      required
                      placeholder="Type to search or create"
                      emptyLabel="Start typing a description."
                      className="w-full rounded-md border border-border px-2 py-1"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-24 rounded-md border border-border px-2 py-1"
                      value={item.quantity}
                      onChange={(event) =>
                        update(index, { quantity: parseNumber(event.target.value) })
                      }
                      required
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-28 rounded-md border border-border px-2 py-1"
                      value={item.unit_price}
                      onChange={(event) =>
                        update(index, { unit_price: parseNumber(event.target.value) })
                      }
                      required
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      step="0.01"
                      className="w-28 rounded-md border border-border px-2 py-1"
                      value={item.total}
                      onChange={(event) =>
                        update(index, { total: parseNumber(event.target.value) })
                      }
                      required
                    />
                  </td>
                  <td className="px-2 py-2">
                    <button
                      type="button"
                      className="text-sm text-red-700 dark:text-red-400 hover:underline disabled:text-muted"
                      disabled={items.length === 1}
                      onClick={() => onChange(items.filter((_, i) => i !== index))}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
