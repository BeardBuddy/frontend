"use client";

import React, { createContext, useContext, useState } from "react";
import { useMemory } from "@/lib/store/store";
import { User } from "@/business-objects/User";
import { Service } from "@/business-objects/Service";
import { ExtraService } from "@/business-objects/ExtraService";
import { bookAppointmentUseCase } from "@/use-cases/book-appointment";
import { applyPromoCodeUseCase } from "@/use-cases/apply-promo-code";
import { toMin, toSlot } from "@/common/utils/timeUtils";
import { GRID_START_HOUR, GRID_END_HOUR, SLOT_INTERVAL, MIN_SERVICE_DURATION } from "@/common/constants";

export const STEP_SERVICE_BARBER = 1;
export const STEP_DATETIME       = 2;
export const STEP_SUMMARY        = 3;
export const STEP_SUCCESS        = 4;

interface BookingWizardState {
  step: number;
  selectedDate: string;
  selectedTime: string;
  selectedService: Service | null;
  selectedBarber: User | null;
  selectedExtras: ExtraService[];
  notes: string;
  isSubmitting: boolean;
  bookingError: string | null;
  customer: User;
  customerOccupiedSlots: string[];
  availableBarbers: User[];
  canAdvance: boolean[];
  setStep: (s: number) => void;
  setSelectedDate: (d: string) => void;
  setSelectedTime: (t: string) => void;
  handleServiceSelect: (svc: Service) => void;
  setSelectedBarber: (b: User) => void;
  handleToggleExtra: (e: ExtraService) => void;
  setNotes: (n: string) => void;
  handleConfirm: () => Promise<void>;
  clearError: () => void;
  promoInput: string;
  promoDiscount: number;
  promoError: string | null;
  promoApplied: boolean;
  setPromoInput: (s: string) => void;
  handleApplyPromo: (baseTotal: number) => void;
}

const BookingWizardContext = createContext<BookingWizardState | undefined>(undefined);

export const useBookingWizard = (): BookingWizardState => {
  const ctx = useContext(BookingWizardContext);
  if (!ctx) throw new Error("useBookingWizard must be used inside BookingWizardProvider");
  return ctx;
};


interface Props {
  customer: User;
  children: React.ReactNode;
}

export const BookingWizardProvider: React.FC<Props> = ({ customer, children }) => {
  const { revalidate } = useMemory();

  const [state, setState] = useState<{
    step: number;
    selectedDate: string;
    selectedTime: string;
    selectedService: Service | null;
    selectedBarber: User | null;
    selectedExtras: ExtraService[];
    notes: string;
    isSubmitting: boolean;
    bookingError: string | null;
    promoInput: string;
    promoDiscount: number;
    promoError: string | null;
    promoApplied: boolean;
  }>({
    step: STEP_SERVICE_BARBER,
    selectedDate: "",
    selectedTime: "",
    selectedService: null,
    selectedBarber: null,
    selectedExtras: [],
    notes: "",
    isSubmitting: false,
    bookingError: null,
    promoInput: "",
    promoDiscount: 0,
    promoError: null,
    promoApplied: false,
  });

  const { step, selectedDate, selectedTime, selectedService, selectedBarber, selectedExtras, notes, isSubmitting, bookingError, promoInput, promoDiscount, promoError, promoApplied } = state;

  const set = <K extends keyof typeof state>(patch: Pick<typeof state, K>) =>
    setState(prev => ({ ...prev, ...patch }));

  const setStep = (s: number) => set({ step: s });
  const setSelectedDate = (d: string) => set({ selectedDate: d, selectedTime: "" });
  const setSelectedTime = (t: string) => set({ selectedTime: t });
  const setNotes = (n: string) => set({ notes: n });

  const handleServiceSelect = (svc: Service) => set({ selectedService: svc, selectedBarber: null });

  const setSelectedBarber = (b: User) => set({ selectedBarber: b, selectedDate: "", selectedTime: "" });

  const handleToggleExtra = (extra: ExtraService) =>
    setState(prev => ({
      ...prev,
      selectedExtras: prev.selectedExtras.some(e => e.id === extra.id)
        ? prev.selectedExtras.filter(e => e.id !== extra.id)
        : [...prev.selectedExtras, extra],
    }));

  const handleConfirm = async () => {
    if (!selectedBarber || !selectedService || !selectedDate || !selectedTime) return;
    set({ isSubmitting: true, bookingError: null });
    try {
      await bookAppointmentUseCase({
        customer,
        barber: selectedBarber,
        service: selectedService,
        date: new Date(selectedDate + "T00:00:00"),
        startTime: selectedTime,
        extraServices: selectedExtras,
        discount: promoDiscount,
      });
      await revalidate();
      set({ step: STEP_SUCCESS });
    } catch (err) {
      set({ bookingError: err instanceof Error ? err.message : "A scheduling conflict occurred." });
    } finally {
      set({ isSubmitting: false });
    }
  };

  const clearError = () => set({ bookingError: null });

  const setPromoInput = (s: string) => set({ promoInput: s, promoError: null, promoApplied: false, promoDiscount: 0 });

  const handleApplyPromo = (baseTotal: number) => {
    try {
      const { discountAmount } = applyPromoCodeUseCase(promoInput, baseTotal);
      set({ promoDiscount: discountAmount, promoError: null, promoApplied: true });
    } catch (err) {
      set({ promoError: err instanceof Error ? err.message : 'Invalid promo code', promoDiscount: 0, promoApplied: false });
    }
  };

  const customerOccupiedSlots: string[] = selectedDate
    ? (() => {
        const gridSlots: string[] = [];
        for (let t = GRID_START_HOUR * 60; t <= GRID_END_HOUR * 60; t += SLOT_INTERVAL) gridSlots.push(toSlot(t));
        const appointments = customer
          .getAppointmentsForDay(new Date(selectedDate + "T00:00:00"))
          .filter(a => a.status !== "CANCELLED");
        return gridSlots.filter(slot => {
          const slotMin = toMin(slot);
          return appointments.some(a => slotMin < toMin(a.endTime) && slotMin + MIN_SERVICE_DURATION > toMin(a.startTime));
        });
      })()
    : [];

  // Navigates the Service -> barbers association directly. The remaining .filter() is a separate
  // business predicate on the already-associated barbers ("has a schedule at all"), not a stand-in
  // for the association lookup itself.
  const availableBarbers: User[] = selectedService
    ? selectedService.getBarbers().filter(b => b.getSchedules().length > 0)
    : [];

  const canAdvance = [
    !!selectedService && !!selectedBarber,
    !!selectedDate && !!selectedTime,
    true,
  ];

  return (
    <BookingWizardContext.Provider value={{
      step, selectedDate, selectedTime, selectedService, selectedBarber,
      selectedExtras, notes, isSubmitting, bookingError,
      customer, customerOccupiedSlots, availableBarbers, canAdvance,
      setStep, setSelectedDate, setSelectedTime,
      handleServiceSelect, setSelectedBarber, handleToggleExtra, setNotes,
      handleConfirm, clearError,
      promoInput, promoDiscount, promoError, promoApplied,
      setPromoInput, handleApplyPromo,
    }}>
      {children}
    </BookingWizardContext.Provider>
  );
};
