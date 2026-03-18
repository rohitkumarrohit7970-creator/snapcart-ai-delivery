import { useState } from "react";
import { Apple, Dumbbell, Heart, Leaf, Scale, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type DietMode = "none" | "gym" | "diabetic" | "veg" | "weight_loss" | "heart_healthy";

const DIET_OPTIONS: { value: DietMode; label: string; icon: React.ElementType; color: string }[] = [
  { value: "gym", label: "Gym / Protein", icon: Dumbbell, color: "bg-orange-100 text-orange-700 border-orange-200" },
  { value: "diabetic", label: "Diabetic", icon: Heart, color: "bg-red-100 text-red-700 border-red-200" },
  { value: "veg", label: "Vegetarian", icon: Leaf, color: "bg-green-100 text-green-700 border-green-200" },
  { value: "weight_loss", label: "Weight Loss", icon: Scale, color: "bg-blue-100 text-blue-700 border-blue-200" },
  { value: "heart_healthy", label: "Heart Healthy", icon: Apple, color: "bg-pink-100 text-pink-700 border-pink-200" },
];

interface DietModeSelectorProps {
  selected: DietMode;
  onSelect: (mode: DietMode) => void;
}

export function DietModeSelector({ selected, onSelect }: DietModeSelectorProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {DIET_OPTIONS.map((opt) => {
        const active = selected === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onSelect(active ? "none" : opt.value)}
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-all ${
              active ? opt.color + " ring-1 ring-offset-1" : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted"
            }`}
          >
            <opt.icon className="h-3 w-3" />
            {opt.label}
            {active && <X className="h-2.5 w-2.5 ml-0.5" />}
          </button>
        );
      })}
    </div>
  );
}
