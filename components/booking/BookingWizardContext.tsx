"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import type {
  BarberDto,
  CustomerDto,
  ExtraServiceDto,
  ServiceDto,
} from "@/lib/api/types";

export const STEP_SERVICE_BARBER = 1;
export const STEP_DATETIME       = 2;
export const STEP_SUMMARY        = 3;
export const STEP_SUCCESS        = 4;

interface BookingWizardState {
  step: number;
  services: ServiceDto[];
  extraServices: ExtraServiceDto[];
  availableBarbers: BarberDto[];
  availableSlots: string[];
  selectedService: ServiceDto | null;
  selectedBarber: BarberDto | null;
  selectedDate: string;
  selectedTime: string;
  selectedExtras: ExtraServiceDto[];
  notes: string;
  bookingError: string | null;
  canAdvance: boolean[];
  promoInput: string;
  promoDiscount: number;
  promoError: string | null;
  promoApplied: boolean;
  baseTotal: number;
  totalPrice: number;
  setStep: (s: number) => void;
  selectService: (service: ServiceDto) => void;
  selectBarber: (barber: BarberDto) => void;
  setSelectedDate: (d: string) => void;
  setSelectedTime: (t: string) => void;
  toggleExtra: (extra: ExtraServiceDto) => void;
  setNotes: (n: string) => void;
  setPromoInput: (s: string) => void;
  applyPromo: () => Promise<void>;
  confirmBooking: () => Promise<void>;
  clearError: () => void;
}

const BookingWizardContext = createContext<BookingWizardState | undefined>(undefined);

export const useBookingWizard = (): BookingWizardState => {
  const ctx = useContext(BookingWizardContext);
  if (!ctx) throw new Error("useBookingWizard must be used inside BookingWizardProvider");
  return ctx;
};

interface Props {
  customer: CustomerDto;
  onBooked: () => void;
  children: React.ReactNode;
}

export const BookingWizardProvider: React.FC<Props> = ({ customer, onBooked, children }) => {
  const [step, setStep] = useState(STEP_SERVICE_BARBER);
  const [services, setServices] = useState<ServiceDto[]>([]);
  const [extraServices, setExtraServices] = useState<ExtraServiceDto[]>([]);
  const [availableBarbers, setAvailableBarbers] = useState<BarberDto[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  const [selectedService, setSelectedService] = useState<ServiceDto | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<BarberDto | null>(null);
  const [selectedDate, setSelectedDateState] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedExtras, setSelectedExtras] = useState<ExtraServiceDto[]>([]);
  const [notes, setNotes] = useState("");

  const [bookingError, setBookingError] = useState<string | null>(null);

  const [promoInput, setPromoInputState] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoApplied, setPromoApplied] = useState(false);

  useEffect(() => {
    Promise.all([api.getServices(), api.getExtraServices()])
      .then(([loadedServices, loadedExtras]) => {
        setServices(loadedServices);
        setExtraServices(loadedExtras);
      })
      .catch((err: unknown) =>
        setBookingError(err instanceof Error ? err.message : "Unable to load the catalogue"),
      );
  }, []);

  // The barbers for a service come from the server's association, never from a local filter.
  const selectService = (service: ServiceDto) => {
    setSelectedService(service);
    setSelectedBarber(null);
    setSelectedDateState("");
    setSelectedTime("");
    setAvailableSlots([]);
    resetPromo();

    api
      .getBarbersOfService(service.id)
      .then(setAvailableBarbers)
      .catch((err: unknown) =>
        setBookingError(err instanceof Error ? err.message : "Unable to load barbers"),
      );
  };

  const selectBarber = (barber: BarberDto) => {
    setSelectedBarber(barber);
    setSelectedDateState("");
    setSelectedTime("");
    setAvailableSlots([]);
  };

  const setSelectedDate = (date: string) => {
    setSelectedDateState(date);
    setSelectedTime("");

    if (!date || !selectedBarber || !selectedService) {
      setAvailableSlots([]);
      return;
    }

    api
      .getAvailableSlots(selectedBarber.id, selectedService.id, date, customer.id)
      .then(result => setAvailableSlots(result.slots))
      .catch(() => setAvailableSlots([]));
  };

  const toggleExtra = (extra: ExtraServiceDto) => {
    setSelectedExtras(prev =>
      prev.some(e => e.id === extra.id) ? prev.filter(e => e.id !== extra.id) : [...prev, extra],
    );
    resetPromo();
  };

  const resetPromo = () => {
    setPromoDiscount(0);
    setPromoError(null);
    setPromoApplied(false);
  };

  const setPromoInput = (value: string) => {
    setPromoInputState(value);
    resetPromo();
  };

  const baseTotal = (selectedService?.price ?? 0) + selectedExtras.reduce((sum, e) => sum + e.price, 0);
  const totalPrice = Math.max(0, baseTotal - promoDiscount);

  const applyPromo = async () => {
    try {
      const result = await api.applyPromoCode(promoInput, baseTotal);
      setPromoDiscount(result.discountAmount);
      setPromoError(null);
      setPromoApplied(true);
    } catch (err) {
      setPromoDiscount(0);
      setPromoApplied(false);
      setPromoError(err instanceof Error ? err.message : "Invalid promo code");
    }
  };

  const confirmBooking = async () => {
    if (!selectedBarber || !selectedService || !selectedDate || !selectedTime) return;

    setBookingError(null);
    try {
      await api.bookAppointment({
        customerId: customer.id,
        barberId: selectedBarber.id,
        serviceId: selectedService.id,
        date: selectedDate,
        startTime: selectedTime,
        extraServiceIds: selectedExtras.map(e => e.id),
        promoCode: promoApplied ? promoInput.trim() : null,
        notes: notes.trim() ? notes.trim() : null,
      });
      onBooked();
      setStep(STEP_SUCCESS);
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : "A scheduling conflict occurred.");
    }
  };

  const canAdvance = [
    !!selectedService && !!selectedBarber,
    !!selectedDate && !!selectedTime,
    true,
  ];

  return (
    <BookingWizardContext.Provider
      value={{
        step, services, extraServices, availableBarbers, availableSlots,
        selectedService, selectedBarber, selectedDate, selectedTime, selectedExtras, notes,
        bookingError, canAdvance,
        promoInput, promoDiscount, promoError, promoApplied, baseTotal, totalPrice,
        setStep, selectService, selectBarber, setSelectedDate, setSelectedTime,
        toggleExtra, setNotes, setPromoInput, applyPromo, confirmBooking,
        clearError: () => setBookingError(null),
      }}
    >
      {children}
    </BookingWizardContext.Provider>
  );
};
