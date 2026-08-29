"use client";

import React from "react";
import { Appointment } from "@/business-objects/Appointment";
import { SpotlightCard } from "@/common/components/SpotlightCard";
import { StatusBadge } from "@/common/components/StatusBadge";
import { StarRatingDisplay } from "@/common/components/StarRating";
import { Calendar, User } from "lucide-react";

interface Props {
  appointments: Appointment[];
  onSelect: (appt: Appointment) => void;
  onWriteReview: (appt: Appointment) => void;
}

export const CompletedList: React.FC<Props> = ({ appointments, onSelect, onWriteReview }) => {
  if (appointments.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-900 bg-zinc-950/20 p-8 text-center text-zinc-500">
        No past appointment records found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {appointments.map(appt => (
        <SpotlightCard
          key={appt.id}
          onClick={() => onSelect(appt)}
          className="cursor-pointer border-zinc-900 hover:border-zinc-800 transition-all"
        >
          <div className="flex justify-between items-start mb-3">
            <StatusBadge status={appt.status} />
            <span className="text-xs text-zinc-600 font-medium">${appt.getTotalPrice()}</span>
          </div>
          <h4 className="text-lg font-bold text-zinc-200">{appt.getService()?.name}</h4>
          <p className="text-sm text-zinc-400 mt-1 flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-amber-500" />
            Barber: {appt.getBarber()?.firstName} {appt.getBarber()?.lastName}
          </p>
          <div className="mt-4 pt-3 border-t border-zinc-900 flex items-center justify-between">
            <span className="text-xs text-zinc-500 flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> {appt.date}
            </span>
            {appt.getReview() ? (
              <div className="flex items-center gap-1 text-amber-500 font-bold text-xs bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                <StarRatingDisplay rating={appt.getReview()!.rating} size="sm" />
                <span className="ml-1">{appt.getReview()!.rating}.0</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={e => { e.stopPropagation(); onWriteReview(appt); }}
                className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs px-2.5 py-1 rounded transition-colors"
              >
                Write Review
              </button>
            )}
          </div>
        </SpotlightCard>
      ))}
    </div>
  );
};
