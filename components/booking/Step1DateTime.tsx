"use client";

import React from "react";
import { Calendar } from "@/common/components/Calendar";
import { TimeSlotGrid } from "@/common/components/TimeSlotGrid";

interface Props {
  selectedDate: string;
  selectedTime: string;
  availableSlots: string[];
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
}

export const Step1DateTime: React.FC<Props> = ({
  selectedDate,
  selectedTime,
  availableSlots,
  onDateChange,
  onTimeChange,
}) => (
  <div className="flex flex-col gap-6">
    <div>
      <h2 className="text-2xl font-black text-zinc-100 tracking-tight">Select Date & Time</h2>
      <p className="text-xs text-zinc-500 mt-1">
        Only the slots your barber is actually free for are shown.
      </p>
    </div>
    <div className="flex flex-col md:flex-row gap-8 items-start justify-center">
      <div className="mx-auto md:mx-0">
        <Calendar selectedDate={selectedDate} onSelectDate={onDateChange} />
      </div>
      <div className="flex-1 w-full">
        {!selectedDate ? (
          <div className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center text-xs text-zinc-500">
            Pick a date to see open time slots.
          </div>
        ) : availableSlots.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center text-xs text-zinc-500">
            Your barber is not working on this day, or is fully booked. Try another date.
          </div>
        ) : (
          <TimeSlotGrid
            slots={availableSlots}
            selectedTime={selectedTime}
            onSelectTime={onTimeChange}
          />
        )}
      </div>
    </div>
  </div>
);
