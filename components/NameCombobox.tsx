"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type NamedOption = {
  id: string;
  name: string;
};

export function NameCombobox({
  value,
  options,
  onChange,
  onSelect,
  required = false,
  placeholder = "Type to search or create",
  emptyLabel = "Start typing a name.",
  className = "mt-1 w-full rounded-md border border-border px-3 py-2",
}: {
  value: string;
  options: NamedOption[];
  onChange: (name: string) => void;
  onSelect?: (name: string) => void;
  required?: boolean;
  placeholder?: string;
  emptyLabel?: string;
  className?: string;
}) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number; width: number } | null>(
    null,
  );

  const query = value.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!query) return options.slice(0, 20);
    return options.filter((option) => option.name.toLowerCase().includes(query)).slice(0, 20);
  }, [options, query]);

  const exactMatch = options.some((option) => option.name.toLowerCase() === query);
  const showCreateOption = query.length > 0 && !exactMatch;

  const rows = useMemo(() => {
    const list: Array<{
      key: string;
      label: string;
      value: string;
      kind: "existing" | "create";
    }> = filtered.map((option) => ({
      key: option.id,
      label: option.name,
      value: option.name,
      kind: "existing",
    }));
    if (showCreateOption) {
      list.push({
        key: "__create__",
        label: `Create “${value.trim()}”`,
        value: value.trim(),
        kind: "create",
      });
    }
    return list;
  }, [filtered, showCreateOption, value]);

  useEffect(() => {
    setHighlight(0);
  }, [query, open]);

  useEffect(() => {
    function updatePos() {
      const rect = rootRef.current?.getBoundingClientRect();
      if (!rect) return;
      setMenuPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }

    if (!open) return;
    updatePos();
    window.addEventListener("scroll", updatePos, true);
    window.addEventListener("resize", updatePos);
    return () => {
      window.removeEventListener("scroll", updatePos, true);
      window.removeEventListener("resize", updatePos);
    };
  }, [open]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || menuRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    }
    window.document.addEventListener("mousedown", onPointerDown);
    return () => window.document.removeEventListener("mousedown", onPointerDown);
  }, []);

  function choose(next: string) {
    onChange(next);
    onSelect?.(next);
    setOpen(false);
  }

  const menu =
    open && menuPos ? (
      <div
        ref={menuRef}
        id={listId}
        style={{
          position: "fixed",
          top: menuPos.top,
          left: menuPos.left,
          width: menuPos.width,
          zIndex: 60,
        }}
      >
        {rows.length > 0 ? (
          <ul
            role="listbox"
            className="max-h-56 overflow-auto rounded-md border border-border-subtle bg-surface py-1 shadow-lg"
          >
            {rows.map((row, index) => (
              <li key={row.key} role="option" aria-selected={index === highlight}>
                <button
                  type="button"
                  className={`flex w-full px-3 py-2 text-left text-sm ${
                    index === highlight ? "bg-surface-muted" : "hover:bg-surface-muted"
                  }`}
                  onMouseEnter={() => setHighlight(index)}
                  onClick={() => choose(row.value)}
                >
                  {row.kind === "create" ? (
                    <span>
                      Create <span className="font-medium">“{row.value}”</span>
                    </span>
                  ) : (
                    row.label
                  )}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-md border border-border-subtle bg-surface px-3 py-2 text-sm text-muted shadow-lg">
            {emptyLabel}
          </div>
        )}
      </div>
    ) : null;

  return (
    <div ref={rootRef} className="relative">
      <input
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        className={className}
        value={value}
        required={required}
        autoComplete="off"
        placeholder={placeholder}
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          onChange(event.target.value);
          setOpen(true);
        }}
        onKeyDown={(event) => {
          if (!open && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
            setOpen(true);
            return;
          }
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setHighlight((current) => Math.min(current + 1, Math.max(rows.length - 1, 0)));
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setHighlight((current) => Math.max(current - 1, 0));
          } else if (event.key === "Enter" && open && rows[highlight]) {
            event.preventDefault();
            choose(rows[highlight].value);
          } else if (event.key === "Escape") {
            setOpen(false);
          }
        }}
      />
      {menu && typeof document !== "undefined" ? createPortal(menu, document.body) : null}
    </div>
  );
}
