"use client";

import React from "react";
import { Clock } from "lucide-react";

interface TimeSlotGridProps {
  slots: string[];
  selectedTime: string;
  onSelectTime: (time: string) => void;
  disabled?: boolean;
  occupiedSlots?: string[];
}

export const TimeSlotGrid: React.FC<TimeSlotGridProps> = ({
  slots,
  selectedTime,
  onSelectTime,
  disabled = false,
  occupiedSlots = [],
}) => {
  if (disabled || slots.length === 0) {
    return (
      <div className="h-[230px] rounded-2xl border border-dashed border-zinc-850 flex items-center justify-center text-xs text-zinc-600">
        {disabled ? "Select a date above to display available times" : "No available slots for this day"}
      </div>
    );
  }

  return (
    <div>
      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3.5 flex items-center gap-1.5">
        <Clock className="h-3.5 w-3.5" /> Available Time Slots
      </label>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {slots.map(t => {
          const isSelected = selectedTime === t;
          const isOccupied = occupiedSlots.includes(t);
          return (
            <button
              key={t}
              type="button"
              disabled={isOccupied}
              onClick={() => !isOccupied && onSelectTime(t)}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                isOccupied
                  ? "bg-zinc-950 border-zinc-900 text-zinc-700 cursor-not-allowed line-through"
                  : isSelected
                    ? "bg-amber-500 border-amber-500 text-zinc-950 scale-[1.03] shadow-md shadow-amber-500/10"
                    : "bg-zinc-950 border-zinc-850 text-zinc-400 hover:border-amber-500/40 hover:text-amber-500"
              }`}
            >
              {t}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TimeSlotGrid;
