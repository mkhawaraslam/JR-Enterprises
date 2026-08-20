"use client";

import { NameCombobox, type NamedOption } from "@/components/NameCombobox";

export type CustomerOption = NamedOption;

export function CustomerCombobox({
  value,
  customers,
  onChange,
  required = false,
}: {
  value: string;
  customers: CustomerOption[];
  onChange: (name: string) => void;
  required?: boolean;
}) {
  return (
    <NameCombobox
      value={value}
      options={customers}
      onChange={onChange}
      required={required}
      placeholder="Type to search or create"
      emptyLabel="Start typing a customer name."
    />
  );
}
