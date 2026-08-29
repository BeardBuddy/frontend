"use client";

import React from "react";
import { User } from "@/business-objects/User";
import { Service } from "@/business-objects/Service";
import { UserRole } from "@/common/types/UserRole";
import {
  BookingWizardProvider,
  useBookingWizard,
  STEP_SERVICE_BARBER,
  STEP_DATETIME,
  STEP_SUMMARY,
  STEP_SUCCESS,
} from "@/components/booking/BookingWizardContext";
import { Step1ServiceBarber } from "@/components/booking/Step1ServiceBarber";
import { Step1DateTime } from "@/components/booking/Step1DateTime";
import { Step4Summary } from "@/components/booking/Step4Summary";
import { ArrowLeft, ArrowRight, Check, AlertTriangle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BookingWizardProps {
  onCancelBooking: () => void;
}

const STEPS = [
  { title: "Service & Barber", desc: "Select Style & Specialist" },
  { title: "Schedule",         desc: "Date & Time" },
  { title: "Summary",          desc: "Review & Extras" },
];

const WizardContent: React.FC<{ onCancelBooking: () => void }> = ({ onCancelBooking }) => {
  const {
    step, setStep, selectedDate, selectedTime, selectedService, selectedBarber,
    selectedExtras, notes, isSubmitting, bookingError,
    customerOccupiedSlots, availableBarbers, canAdvance,
    setSelectedDate, setSelectedTime, handleServiceSelect, setSelectedBarber,
    handleToggleExtra, setNotes, handleConfirm, clearError,
    promoInput, promoDiscount, promoError, promoApplied,
    setPromoInput, handleApplyPromo,
  } = useBookingWizard();

  const renderNav = (isLastStep = false) => (
    <div className="flex justify-between items-center border-t border-zinc-900 pt-6 mt-8">
      <button
        type="button"
        onClick={step === STEP_SERVICE_BARBER ? onCancelBooking : () => setStep(step - 1)}
        className="flex items-center gap-2 text-zinc-400 hover:text-zinc-100 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 px-5 py-2.5 rounded-xl font-semibold transition-colors text-sm"
      >
        <ArrowLeft className="h-4 w-4" /> {step === STEP_SERVICE_BARBER ? "Exit Wizard" : "Back"}
      </button>
      {!isLastStep ? (
        <button
          type="button"
          disabled={!canAdvance[step - 1]}
          onClick={() => setStep(step + 1)}
          className={`flex items-center gap-2 font-bold px-6 py-2.5 rounded-xl transition-all text-sm ${
            canAdvance[step - 1]
              ? "bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-md shadow-amber-500/10"
              : "bg-zinc-900 text-zinc-600 border border-zinc-900 cursor-not-allowed"
          }`}
        >
          Continue <ArrowRight className="h-4 w-4" />
        </button>
      ) : (
        <button
          type="button"
          onClick={handleConfirm}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-zinc-950 font-bold px-7 py-3 rounded-xl shadow-lg shadow-emerald-500/10 transition-all text-sm uppercase tracking-wide"
        >
          Confirm & Schedule
        </button>
      )}
    </div>
  );

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-8">

      {step <= STEP_SUMMARY && (
        <div className="mb-10 flex items-center justify-between gap-2 border-b border-zinc-900 pb-6 overflow-x-auto whitespace-nowrap">
          {STEPS.map((s, idx) => {
            const num = idx + 1;
            const isActive = step === num;
            const isDone   = step > num;
            return (
              <div key={s.title} className="flex items-center gap-3">
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-xs border transition-all ${
                  isActive ? "bg-amber-500 border-amber-500 text-zinc-950 shadow-md shadow-amber-500/10 scale-105"
                  : isDone  ? "bg-emerald-950 border-emerald-800 text-emerald-400"
                            : "bg-zinc-950 border-zinc-800 text-zinc-500"
                }`}>
                  {isDone ? <Check className="h-4 w-4" /> : num}
                </div>
                <div className="hidden sm:block">
                  <span className={`text-xs font-semibold block ${isActive ? "text-amber-500" : isDone ? "text-emerald-400" : "text-zinc-500"}`}>{s.title}</span>
                  <span className="text-[10px] text-zinc-600 block">{s.desc}</span>
                </div>
                {idx < STEPS.length - 1 && <div className="h-px w-8 sm:w-16 bg-zinc-800 mx-1" />}
              </div>
            );
          })}
        </div>
      )}

      {bookingError && (
        <div className="mb-6 rounded-2xl border border-red-950 bg-red-950/20 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <h5 className="font-bold text-red-400 text-sm">Conflict Detected</h5>
            <p className="text-xs text-red-300/80 mt-1 leading-relaxed">{bookingError}</p>
            <button
              onClick={() => { setStep(STEP_DATETIME); clearError(); }}
              className="mt-3.5 bg-red-500 hover:bg-red-400 text-zinc-950 font-bold text-xs px-3 py-1.5 rounded-lg transition-colors"
            >
              Change Date & Time
            </button>
          </div>
        </div>
      )}

      {isSubmitting && (
        <div className="rounded-3xl border border-zinc-900 bg-zinc-950/80 p-12 text-center flex flex-col items-center justify-center min-h-[350px]">
          <Loader2 className="h-10 w-10 text-amber-500 animate-spin mb-4" />
          <h4 className="text-xl font-bold text-zinc-200">Validating Availability</h4>
          <p className="text-xs text-zinc-500 mt-2 max-w-xs mx-auto">Checking barber schedules and real-time calendars...</p>
        </div>
      )}

      {!isSubmitting && (
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {(() => {
              switch (step) {
                case STEP_SERVICE_BARBER:
                  return (
                    <>
                      <Step1ServiceBarber
                        services={Service.getExtent().filter(s => s.isAvailable)}
                        selectedService={selectedService}
                        onSelectService={handleServiceSelect}
                        availableBarbers={availableBarbers}
                        selectedBarber={selectedBarber}
                        onSelectBarber={setSelectedBarber}
                      />
                      {renderNav()}
                    </>
                  );
                case STEP_DATETIME:
                  return (
                    <>
                      <Step1DateTime
                        selectedDate={selectedDate}
                        selectedTime={selectedTime}
                        occupiedSlots={customerOccupiedSlots}
                        onDateChange={setSelectedDate}
                        onTimeChange={setSelectedTime}
                      />
                      {renderNav()}
                    </>
                  );
                case STEP_SUMMARY:
                  return selectedBarber && selectedService ? (
                    <>
                      <Step4Summary
                        selectedBarber={selectedBarber}
                        selectedService={selectedService}
                        selectedDate={selectedDate}
                        selectedTime={selectedTime}
                        selectedExtras={selectedExtras}
                        notes={notes}
                        promoInput={promoInput}
                        promoDiscount={promoDiscount}
                        promoError={promoError}
                        promoApplied={promoApplied}
                        onToggleExtra={handleToggleExtra}
                        onNotesChange={setNotes}
                        onPromoInputChange={setPromoInput}
                        onApplyPromo={handleApplyPromo}
                      />
                      {renderNav(true)}
                    </>
                  ) : null;
                case STEP_SUCCESS:
                  return (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="rounded-3xl border border-zinc-800 bg-zinc-950/40 p-8 md:p-12 text-center flex flex-col items-center justify-center max-w-xl mx-auto shadow-2xl backdrop-blur-md"
              >
                <div className="h-16 w-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-6 animate-bounce">
                  <Check className="h-8 w-8 stroke-[3]" />
                </div>
                <h2 className="text-3xl font-black text-zinc-100 tracking-tight">Booking Confirmed!</h2>
                <p className="text-sm text-zinc-400 mt-2 max-w-sm mx-auto leading-relaxed">
                  Your appointment is locked in with{" "}
                  <span className="text-amber-500 font-bold">{selectedBarber?.firstName}</span> on {selectedDate}.
                  Status transitioned to <span className="text-emerald-400 font-bold">CONFIRMED</span>.
                </p>
                <div className="w-full mt-8 bg-zinc-950 p-5 rounded-2xl border border-zinc-900 text-left text-xs text-zinc-500 flex flex-col gap-2.5">
                  <div className="flex justify-between border-b border-zinc-900 pb-2 mb-1">
                    <span className="font-bold text-zinc-400">RECEIPT SUMMARY</span>
                  </div>
                  <div className="flex justify-between"><span>Barber:</span><span className="font-bold text-zinc-200">{selectedBarber?.firstName} {selectedBarber?.lastName}</span></div>
                  <div className="flex justify-between"><span>Service:</span><span className="font-bold text-zinc-200">{selectedService?.name}</span></div>
                  {selectedExtras.length > 0 && (
                    <div className="flex justify-between"><span>Extras:</span><span className="font-bold text-zinc-200">{selectedExtras.map(e => e.name.split(" ")[0]).join(", ")}</span></div>
                  )}
                  <div className="flex justify-between"><span>Slot:</span><span className="font-bold text-zinc-200">{selectedDate} • {selectedTime}</span></div>
                  <div className="flex justify-between border-t border-zinc-900 pt-2.5 mt-1 font-bold text-sm text-amber-500">
                    <span>Amount (at store):</span>
                    <span className="text-base font-black">${Math.max(0, (selectedService?.getPrice() ?? 0) + selectedExtras.reduce((s, e) => s + e.price, 0) - promoDiscount).toFixed(2)}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onCancelBooking}
                  className="mt-8 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold px-6 py-3 rounded-2xl shadow-lg shadow-amber-500/10 text-sm transition-all"
                >
                  Go To Dashboard
                </button>
              </motion.div>
                  );
                default:
                  return null;
              }
            })()}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export const BookingWizard: React.FC<BookingWizardProps> = ({ onCancelBooking }) => {
  const customer = User.getExtent().find(u => u.role === UserRole.CUSTOMER);
  if (!customer) return null;

  return (
    <BookingWizardProvider customer={customer}>
      <WizardContent onCancelBooking={onCancelBooking} />
    </BookingWizardProvider>
  );
};

export default BookingWizard;
