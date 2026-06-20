"use client";

interface FilterBarProps {
  filters: string[];
  active: string;
  onChange: (filter: string) => void;
}

export function FilterBar({ filters, active, onChange }: FilterBarProps) {
  return (
    <div className="flex gap-1.5 flex-wrap mb-4">
      {filters.map((f) => (
        <button
          key={f}
          onClick={() => onChange(f)}
          className={`px-3.5 py-1.5 rounded-full text-sm font-semibold border transition-all ${
            active === f
              ? "bg-[var(--blue)] text-white border-[var(--blue)]"
              : "bg-white text-gray-500 border-gray-200 hover:border-[var(--blue)] hover:text-[var(--blue)]"
          }`}
        >
          {f}
        </button>
      ))}
    </div>
  );
}
