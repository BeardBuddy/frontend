"use client";

import React from "react";
import { Calendar } from "@/common/components/Calendar";
import { TimeSlotGrid } from "@/common/components/TimeSlotGrid";
import { DEFAULT_TIME_SLOTS } from "@/common/constants";

interface Props {
  selectedDate: string;
  selectedTime: string;
  occupiedSlots: string[];
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
}

export const Step1DateTime: React.FC<Props> = ({
  selectedDate,
  selectedTime,
  occupiedSlots,
  onDateChange,
  onTimeChange,
}) => (
  <div className="flex flex-col gap-6">
    <div>
      <h2 className="text-2xl font-black text-zinc-100 tracking-tight">Select Date & Time</h2>
      <p className="text-xs text-zinc-500 mt-1">Pick a convenient day and a preferred time slot.</p>
    </div>
    <div className="flex flex-col md:flex-row gap-8 items-start justify-center">
      <div className="mx-auto md:mx-0">
        <Calendar
          selectedDate={selectedDate}
          onSelectDate={d => { onDateChange(d); onTimeChange(""); }}
        />
      </div>
      <div className="flex-1 w-full">
        <TimeSlotGrid
          slots={DEFAULT_TIME_SLOTS}
          selectedTime={selectedTime}
          onSelectTime={onTimeChange}
          disabled={!selectedDate}
          occupiedSlots={occupiedSlots}
        />
      </div>
    </div>
  </div>
);
