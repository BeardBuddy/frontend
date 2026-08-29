"use client";

import React from "react";
import { User } from "@/business-objects/User";
import { Service } from "@/business-objects/Service";
import { SpotlightCard } from "@/common/components/SpotlightCard";
import { Check, Clock, Scissors, Star } from "lucide-react";

interface Props {
  availableBarbers: User[];
  selectedBarber: User | null;
  selectedService: Service | null;
  onSelect: (barber: User) => void;
  compact?: boolean;
}

export const Step3Barber: React.FC<Props> = ({
  availableBarbers,
  selectedBarber,
  selectedService,
  onSelect,
  compact = false,
}) => (
  <div className="flex flex-col gap-6">
    <div>
      <h2 className="text-2xl font-black text-zinc-100 tracking-tight">Choose Your Barber</h2>
      <p className="text-xs text-zinc-500 mt-1">All barbers below are certified to perform your selected service.</p>
    </div>

    {selectedService && (
      <div className="flex items-center gap-4 rounded-2xl border border-amber-500/20 bg-amber-500/[0.03] px-5 py-3.5">
        <div className="bg-amber-500/15 border border-amber-500/20 text-amber-500 rounded-xl h-9 w-9 flex items-center justify-center shrink-0">
          <Scissors className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-bold text-amber-500/70 uppercase tracking-wider block">Selected Service</span>
          <span className="text-sm font-bold text-zinc-200">{selectedService.name}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0 text-xs text-zinc-500">
          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {selectedService.duration} min</span>
          <span className="font-bold text-amber-500 text-sm">${selectedService.getPrice()}</span>
        </div>
      </div>
    )}

    {!selectedService ? (
      <div className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center text-xs text-zinc-500">
        Select a service to see available barbers.
      </div>
    ) : availableBarbers.length === 0 ? (
      <div className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center text-xs text-zinc-500">
        No barbers available for this service.
      </div>
    ) : (
      <div className={`grid gap-4 ${compact ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"}`}>
        {availableBarbers.map(barber => {
          const isSelected = selectedBarber?.id === barber.id;
          return (
            <SpotlightCard
              key={barber.id}
              onClick={() => onSelect(barber)}
              className={`cursor-pointer transition-all ${isSelected ? "border-amber-500 bg-amber-500/[0.02]" : "border-zinc-800 hover:border-zinc-700"}`}
              spotlightColor={isSelected ? "rgba(245,158,11,0.08)" : undefined}
            >
              <div className="flex gap-3 items-start">
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl h-10 w-10 flex items-center justify-center font-black text-sm text-amber-500 shrink-0">
                  {barber.firstName[0]}{barber.lastName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-zinc-200">{barber.firstName} {barber.lastName}</span>
                      {isSelected && (
                        <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded flex items-center gap-1">
                          <Check className="h-3 w-3 stroke-[3]" /> Selected
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-amber-500 flex items-center gap-0.5 shrink-0">
                      <Star className="h-3 w-3 fill-amber-500" /> {barber.getAverageRating() || "—"}
                    </span>
                  </div>
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border mt-0.5 inline-block ${
                    barber.seniorityLevel === "SENIOR"
                      ? "bg-amber-950/40 border-amber-900/60 text-amber-400"
                      : "bg-zinc-900 border-zinc-800 text-zinc-400"
                  }`}>
                    {barber.seniorityLevel} Barber
                  </span>
                  <p className="text-xs text-zinc-500 mt-1.5 line-clamp-2">{barber.description}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {barber.getBarberServices()
                      .filter((bs, i, arr) => arr.findIndex(x => x.specializationType === bs.specializationType) === i)
                      .map(bs => (
                        <span key={bs.specializationType} className="bg-zinc-950 text-zinc-500 border border-zinc-900 text-[10px] font-semibold px-2 py-0.5 rounded-lg uppercase">
                          {bs.specializationType}
                        </span>
                      ))}
                    {barber.getBarberServices().some(bs => bs.isExpert()) && (
                      <span className="bg-amber-950/30 text-amber-400 border border-amber-900/50 text-[10px] font-bold px-2 py-0.5 rounded-lg">EXPERT</span>
                    )}
                  </div>
                </div>
              </div>
            </SpotlightCard>
          );
        })}
      </div>
    )}
  </div>
);
