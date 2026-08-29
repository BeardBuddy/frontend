"use client";

import React, { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingDisplayProps {
  rating: number;
  size?: "sm" | "md";
}

const ratings = [1, 2, 3, 4, 5];

interface StarRatingInputProps {
  value: number;
  onChange: (rating: number) => void;
  size?: "sm" | "md";
}

const LABELS: Record<number, string> = {
  1: "Very Bad (1/5)",
  2: "Disappointed (2/5)",
  3: "Okay (3/5)",
  4: "Good (4/5)",
  5: "Excellent (5/5)",
};

export const StarRatingDisplay: React.FC<StarRatingDisplayProps> = ({ rating, size = "sm" }) => {
  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  return (
    <div className="flex items-center gap-1">
      {ratings.map(s => (
        <Star
          key={s}
          className={`${iconSize} ${s <= rating ? "text-amber-500 fill-amber-500" : "text-zinc-700"}`}
        />
      ))}
    </div>
  );
};

export const StarRatingInput: React.FC<StarRatingInputProps> = ({ value, onChange, size = "md" }) => {
  const [hovered, setHovered] = useState<number | null>(null);
  const iconSize = size === "sm" ? "h-6 w-6" : "h-8 w-8";
  const active = hovered ?? value;

  return (
    <div className="flex items-center gap-2">
      {ratings.map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(null)}
          className="p-1 hover:scale-110 transition-transform"
        >
          <Star
            className={`${iconSize} ${star <= active ? "text-amber-500 fill-amber-500" : "text-zinc-700"}`}
          />
        </button>
      ))}
      <span className="text-sm font-bold text-amber-500 ml-2">{LABELS[value]}</span>
    </div>
  );
};
