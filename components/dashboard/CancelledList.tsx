"use client";

import React from "react";
import type { AppointmentDto } from "@/lib/api/types";
import { StatusBadge } from "@/common/components/StatusBadge";

interface Props {
  appointments: AppointmentDto[];
  onSelect: (appt: AppointmentDto) => void;
}

export const CancelledList: React.FC<Props> = ({ appointments, onSelect }) => {
  if (appointments.length === 0) return null;

  return (
    <div>
      <h3 className="text-lg font-bold text-zinc-400 mb-3 tracking-tight">Cancelled Visits</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 opacity-50">
        {appointments.map(appt => (
          <div
            key={appt.id}
            onClick={() => onSelect(appt)}
            className="cursor-pointer border border-zinc-950 bg-zinc-950/20 p-5 rounded-2xl flex justify-between items-center transition-all hover:bg-zinc-900/30"
          >
            <div>
              <h4 className="font-bold text-zinc-300 text-sm line-through">{appt.serviceName}</h4>
              <p className="text-xs text-zinc-500 mt-0.5">Barber: {appt.barberName}</p>
            </div>
            <StatusBadge status={appt.status} />
          </div>
        ))}
      </div>
    </div>
  );
};
