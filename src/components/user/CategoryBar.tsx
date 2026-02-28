import { categories } from "@/lib/mock-data";

interface CategoryBarProps {
  selected: string;
  onSelect: (id: string) => void;
}

export function CategoryBar({ selected, onSelect }: CategoryBarProps) {
  return (
    <div className="flex gap-3 overflow-x-auto py-4 px-1 scrollbar-hide">
      <button
        onClick={() => onSelect("all")}
        className={`flex flex-col items-center gap-1.5 min-w-[72px] rounded-xl p-3 transition-all ${
          selected === "all"
            ? "bg-primary text-primary-foreground shadow-md"
            : "bg-card text-foreground snap-card-shadow hover:bg-secondary"
        }`}
      >
        <span className="text-2xl">🏪</span>
        <span className="text-xs font-medium whitespace-nowrap">All</span>
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={`flex flex-col items-center gap-1.5 min-w-[72px] rounded-xl p-3 transition-all ${
            selected === cat.id
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-card text-foreground snap-card-shadow hover:bg-secondary"
          }`}
        >
          <span className="text-2xl">{cat.icon}</span>
          <span className="text-xs font-medium whitespace-nowrap">{cat.name}</span>
        </button>
      ))}
    </div>
  );
}
