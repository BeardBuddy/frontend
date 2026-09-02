"use client";

import React from "react";
import type { BarberDto, ServiceDto } from "@/lib/api/types";
import { Step2Service } from "@/components/booking/Step2Service";
import { Step3Barber } from "@/components/booking/Step3Barber";

interface Props {
  services: ServiceDto[];
  selectedService: ServiceDto | null;
  onSelectService: (svc: ServiceDto) => void;
  availableBarbers: BarberDto[];
  selectedBarber: BarberDto | null;
  onSelectBarber: (barber: BarberDto) => void;
}

export const Step1ServiceBarber: React.FC<Props> = ({
  services,
  selectedService,
  onSelectService,
  availableBarbers,
  selectedBarber,
  onSelectBarber,
}) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-6 items-start">
    <Step2Service
      services={services}
      selectedService={selectedService}
      onSelect={onSelectService}
      compact
    />
    <Step3Barber
      availableBarbers={availableBarbers}
      selectedBarber={selectedBarber}
      selectedService={selectedService}
      onSelect={onSelectBarber}
      compact
    />
  </div>
);
