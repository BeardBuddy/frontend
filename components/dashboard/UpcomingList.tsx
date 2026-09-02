"use client";

import React from "react";
import type { AppointmentDto } from "@/lib/api/types";
import { SpotlightCard } from "@/common/components/SpotlightCard";
import { StatusBadge } from "@/common/components/StatusBadge";
import { Calendar, Clock, User } from "lucide-react";

interface Props {
  appointments: AppointmentDto[];
  onSelect: (appt: AppointmentDto) => void;
}

export const UpcomingList: React.FC<Props> = ({ appointments, onSelect }) => {
  if (appointments.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-900 bg-zinc-950/20 p-8 text-center text-zinc-500">
        No upcoming visits scheduled.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {appointments.map(appt => (
        <SpotlightCard
          key={appt.id}
          onClick={() => onSelect(appt)}
          className="cursor-pointer hover:border-zinc-700 transition-all"
        >
          <div className="flex justify-between items-start mb-3">
            <StatusBadge status={appt.status} />
            <span className="text-xs text-zinc-500">ID: {appt.id.slice(-6)}</span>
          </div>
          <h4 className="text-lg font-bold text-zinc-200">{appt.serviceName}</h4>
          <p className="text-sm text-zinc-400 mt-1 flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-amber-500" />
            Barber: {appt.barberName}
          </p>
          <div className="mt-4 pt-3 border-t border-zinc-900 flex items-center justify-between text-xs text-zinc-500">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-zinc-400" /> {appt.date}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-zinc-400" /> {appt.startTime}
            </span>
          </div>
        </SpotlightCard>
      ))}
    </div>
  );
};
