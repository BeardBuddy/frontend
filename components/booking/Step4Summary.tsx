"use client";

import React from "react";
import { User } from "@/business-objects/User";
import { Service } from "@/business-objects/Service";
import { ExtraService } from "@/business-objects/ExtraService";
import { Calendar as CalendarIcon, Check, Clock, Scissors, Sparkles, Star, Tag, AlertCircle } from "lucide-react";

interface Props {
  selectedBarber: User;
  selectedService: Service;
  selectedDate: string;
  selectedTime: string;
  selectedExtras: ExtraService[];
  notes: string;
  promoInput: string;
  promoDiscount: number;
  promoError: string | null;
  promoApplied: boolean;
  onToggleExtra: (extra: ExtraService) => void;
  onNotesChange: (notes: string) => void;
  onPromoInputChange: (s: string) => void;
  onApplyPromo: (baseTotal: number) => void;
}

export const Step4Summary: React.FC<Props> = ({
  selectedBarber,
  selectedService,
  selectedDate,
  selectedTime,
  selectedExtras,
  notes,
  promoInput,
  promoDiscount,
  promoError,
  promoApplied,
  onToggleExtra,
  onNotesChange,
  onPromoInputChange,
  onApplyPromo,
}) => {
  const extrasTotal = selectedExtras.reduce((s, e) => s + e.price, 0);
  const baseTotal = selectedService.getPrice() + extrasTotal;
  const totalPrice = Math.max(0, baseTotal - promoDiscount);
  const allExtras = ExtraService.getExtent();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-black text-zinc-100 tracking-tight">Grooming Summary</h2>
        <p className="text-xs text-zinc-500 mt-1">Review your selection and add optional extras to enhance your visit.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 flex gap-4 items-start">
          <div className="bg-amber-500/15 border border-amber-500/20 text-amber-500 rounded-2xl h-12 w-12 flex items-center justify-center font-black text-md shrink-0">
            {selectedBarber.firstName[0]}{selectedBarber.lastName[0]}
          </div>
          <div>
            <span className="text-[10px] font-bold text-zinc-500 block uppercase tracking-wider">Assigned Barber</span>
            <h4 className="text-lg font-bold text-zinc-200 mt-0.5">{selectedBarber.firstName} {selectedBarber.lastName}</h4>
            <p className="text-xs text-zinc-400 mt-1">{selectedBarber.seniorityLevel} Specialist • {selectedBarber.experienceYears} yrs exp</p>
            <span className="text-xs font-semibold text-amber-500 flex items-center gap-1 mt-2">
              <Star className="h-3.5 w-3.5 fill-amber-500" /> {selectedBarber.getAverageRating() || "No ratings yet"}
            </span>
          </div>
        </div>
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 flex gap-4 items-start">
          <div className="bg-amber-500/15 border border-amber-500/20 text-amber-500 rounded-2xl h-12 w-12 flex items-center justify-center font-black shrink-0">
            <Scissors className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <span className="text-[10px] font-bold text-zinc-500 block uppercase tracking-wider">Styling Service</span>
            <h4 className="text-lg font-bold text-zinc-200 mt-0.5">{selectedService.name}</h4>
            <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{selectedService.description}</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-zinc-500">{selectedService.duration} mins</span>
              <span className="text-md font-extrabold text-amber-500">${selectedService.getPrice()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-zinc-950/60 border border-zinc-800 rounded-3xl p-6">
        <h3 className="text-xs font-bold text-zinc-400 mb-3.5 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-amber-500" /> Enhance Your Visit (Optional Extras)
        </h3>
        <div className="flex flex-col gap-3">
          {allExtras.map(extra => {
            const isChecked = selectedExtras.some(e => e.id === extra.id);
            return (
              <div
                key={extra.id}
                onClick={() => onToggleExtra(extra)}
                className={`cursor-pointer rounded-2xl border p-4 flex items-center justify-between transition-all ${
                  isChecked ? "border-emerald-500/40 bg-emerald-500/[0.01]" : "border-zinc-800 bg-zinc-950/40 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`h-6 w-6 rounded-lg border flex items-center justify-center transition-all ${
                    isChecked ? "bg-emerald-500 border-emerald-500 text-zinc-950" : "border-zinc-800 bg-zinc-900 text-transparent"
                  }`}>
                    <Check className="h-4 w-4 stroke-[3]" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                      {extra.name}
                      {isChecked && (
                        <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/50 border border-emerald-900/60 px-1.5 py-0.5 rounded">
                          Selected
                        </span>
                      )}
                    </span>
                    <span className="text-xs text-zinc-500 mt-0.5 block">{extra.description}</span>
                  </div>
                </div>
                <span className="text-sm font-extrabold text-zinc-300 shrink-0">+${extra.price}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
        <h3 className="text-xs font-bold text-zinc-400 mb-3 uppercase tracking-wider flex items-center gap-1.5">
          <Tag className="h-4 w-4 text-amber-500" /> Promo Code
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={promoInput}
            onChange={e => onPromoInputChange(e.target.value.toUpperCase())}
            placeholder="Enter code..."
            maxLength={20}
            className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-bold tracking-widest bg-zinc-950 text-zinc-100 placeholder-zinc-600 focus:outline-none transition-colors ${
              promoApplied ? "border-emerald-500/50 focus:border-emerald-500" : promoError ? "border-red-900 focus:border-red-700" : "border-zinc-800 focus:border-amber-500"
            }`}
          />
          <button
            type="button"
            onClick={() => onApplyPromo(baseTotal)}
            disabled={!promoInput.trim()}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              promoInput.trim()
                ? "bg-amber-500 hover:bg-amber-400 text-zinc-950"
                : "bg-zinc-900 text-zinc-600 cursor-not-allowed border border-zinc-800"
            }`}
          >
            Apply
          </button>
        </div>
        {promoApplied && (
          <p className="mt-2.5 text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 stroke-[3]" /> Code applied — ${promoDiscount.toFixed(2)} off your total.
          </p>
        )}
        {promoError && (
          <p className="mt-2.5 text-xs font-semibold text-red-400 flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5" /> {promoError}
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5 font-medium"><CalendarIcon className="h-4 w-4 text-zinc-400" /> {selectedDate}</span>
          <span className="h-4 w-px bg-zinc-800" />
          <span className="flex items-center gap-1.5 font-medium"><Clock className="h-4 w-4 text-zinc-400" /> {selectedTime}</span>
        </div>
        <div className="flex items-center gap-6 text-right self-end sm:self-auto">
          <div className="text-xs text-zinc-500 text-right">
            <span>Base: ${selectedService.getPrice()}</span>
            {extrasTotal > 0 && <span className="block mt-0.5">Extras: +${extrasTotal}</span>}
            {promoDiscount > 0 && <span className="block mt-0.5 text-emerald-400">Promo: -${promoDiscount.toFixed(2)}</span>}
          </div>
          <div>
            <span className="text-[10px] font-bold text-zinc-500 block uppercase tracking-wider">Total Price</span>
            <span className="text-3xl font-black text-amber-500">${totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="notes" className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">
          Booking Notes (Optional)
        </label>
        <textarea
          id="notes" rows={2} value={notes} onChange={e => onNotesChange(e.target.value)}
          placeholder="Special requests or notes for your barber..."
          className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-xs text-zinc-300 focus:outline-none focus:border-amber-500 transition-colors"
        />
      </div>
    </div>
  );
};
