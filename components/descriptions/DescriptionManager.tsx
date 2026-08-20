"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  createDescription,
  deleteDescription,
  updateDescription,
} from "@/lib/descriptions/mutations";
import type { Description } from "@/lib/descriptions/queries";

export function DescriptionManager({ descriptions }: { descriptions: Description[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return descriptions;
    return descriptions.filter((item) => item.name.toLowerCase().includes(term));
  }, [descriptions, search]);

  async function onAdd(event: React.FormEvent) {
    event.preventDefault();
    const next = name.trim();
    if (!next) {
      setError("Description name is required.");
      return;
    }
    if (descriptions.some((item) => item.name.toLowerCase() === next.toLowerCase())) {
      setError("That description already exists.");
      return;
    }

    setBusy(true);
    setError(null);
    const result = await createDescription(next);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setName("");
    router.refresh();
  }

  async function onSaveEdit(id: string) {
    const next = editingName.trim();
    if (!next) {
      setError("Description name is required.");
      return;
    }

    setBusy(true);
    setError(null);
    const result = await updateDescription(id, next);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setEditingId(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <form onSubmit={onAdd} className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-4 sm:flex-row sm:items-end">
        <label className="block flex-1 text-sm font-medium">
          New description
          <input
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Pneumatic cylinder"
            disabled={busy}
          />
        </label>
        <button
          type="submit"
          className="min-h-11 rounded-md bg-[#9b1c1c] px-4 py-2 text-sm font-medium text-white hover:bg-[#7f1717] disabled:opacity-60"
          disabled={busy}
        >
          {busy ? "Saving…" : "Add"}
        </button>
      </form>

      <input
        className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2.5 text-sm"
        placeholder="Search descriptions"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
        {filtered.length === 0 ? (
          <p className="px-4 py-8 text-center text-neutral-500">
            {descriptions.length === 0
              ? "No descriptions yet. Add one here or create it from a document."
              : "No descriptions match this search."}
          </p>
        ) : (
          <ul>
            {filtered.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-3 border-t border-neutral-200 px-4 py-3 first:border-t-0 sm:flex-row sm:items-center sm:justify-between"
              >
                {editingId === item.id ? (
                  <input
                    className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm sm:max-w-md"
                    value={editingName}
                    onChange={(event) => setEditingName(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        onSaveEdit(item.id);
                      }
                    }}
                    autoFocus
                    disabled={busy}
                  />
                ) : (
                  <p className="font-medium">{item.name}</p>
                )}
                <div className="flex gap-3 text-sm">
                  {editingId === item.id ? (
                    <>
                      <button
                        type="button"
                        className="min-h-10 text-[#9b1c1c] hover:underline disabled:opacity-60"
                        disabled={busy}
                        onClick={() => onSaveEdit(item.id)}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className="min-h-10 text-neutral-600 hover:underline"
                        disabled={busy}
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="min-h-10 text-[#9b1c1c] hover:underline"
                        onClick={() => {
                          setEditingId(item.id);
                          setEditingName(item.name);
                          setError(null);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="min-h-10 text-red-700 hover:underline"
                        onClick={() => setDeleteId(item.id)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete this description?"
        message="Saved documents keep the old text. This only removes it from the dropdown list."
        confirmLabel="Delete"
        danger
        busy={busy}
        onClose={() => setDeleteId(null)}
        onConfirm={async () => {
          if (!deleteId) return;
          setBusy(true);
          setError(null);
          const result = await deleteDescription(deleteId);
          setBusy(false);
          if (!result.ok) {
            setError(result.error);
            return;
          }
          setDeleteId(null);
          router.refresh();
        }}
      />
    </div>
  );
}
