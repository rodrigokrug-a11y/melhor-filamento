"use client";

import { useRouter } from "next/navigation";

export function SortSelect({
  value,
  options,
}: {
  value: string;
  options: { value: string; label: string; href: string }[];
}) {
  const router = useRouter();
  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <span className="hidden text-muted-foreground sm:inline">Ordenar:</span>
      <select
        value={value}
        onChange={(e) => {
          const o = options.find((opt) => opt.value === e.target.value);
          if (o) router.push(o.href);
        }}
        className="cursor-pointer rounded-full border border-input bg-card px-4 py-2 font-medium text-foreground outline-none transition-colors hover:border-brand focus-visible:border-brand"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
