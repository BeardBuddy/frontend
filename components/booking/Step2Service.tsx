"use client";

import React from "react";
import type { ServiceDto } from "@/lib/api/types";
import { SpotlightCard } from "@/common/components/SpotlightCard";
import { Check, Clock } from "lucide-react";

interface Props {
  services: ServiceDto[];
  selectedService: ServiceDto | null;
  onSelect: (svc: ServiceDto) => void;
  compact?: boolean;
}

export const Step2Service: React.FC<Props> = ({ services, selectedService, onSelect, compact = false }) => (
  <div className="flex flex-col gap-6">
    <div>
      <h2 className="text-2xl font-black text-zinc-100 tracking-tight">Choose Styling Service</h2>
      <p className="text-xs text-zinc-500 mt-1">Select a haircut, beard service, or a hybrid combo package.</p>
    </div>
    <div className={`grid gap-4 ${compact ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"}`}>
      {services.map(svc => {
        const isSelected = selectedService?.id === svc.id;
        return (
          <SpotlightCard
            key={svc.id}
            onClick={() => onSelect(svc)}
            className={`cursor-pointer transition-all ${isSelected ? "border-amber-500 bg-amber-500/[0.02]" : "border-zinc-800 hover:border-zinc-700"}`}
            spotlightColor={isSelected ? "rgba(245,158,11,0.08)" : undefined}
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border inline-block ${
                    svc.type === "HYBRID"   ? "bg-amber-950/40 border-amber-900 text-amber-400"
                    : svc.type === "HAIRCUT" ? "bg-blue-950/40 border-blue-900 text-blue-400"
                                            : "bg-indigo-950/40 border-indigo-900 text-indigo-400"
                  }`}>
                    {svc.type === "HYBRID" ? "Hybrid Combo" : svc.type}
                  </span>
                  {isSelected && (
                    <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded flex items-center gap-1">
                      <Check className="h-3 w-3 stroke-[3]" /> Selected
                    </span>
                  )}
                </div>
                <h4 className="text-lg font-bold text-zinc-200">{svc.name}</h4>
                <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">{svc.description}</p>
                <span className="text-xs font-semibold text-zinc-500 mt-3 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> {svc.duration} mins
                </span>
              </div>
              <span className="text-xl font-black text-amber-500 shrink-0">${svc.price}</span>
            </div>
          </SpotlightCard>
        );
      })}
    </div>
  </div>
);
