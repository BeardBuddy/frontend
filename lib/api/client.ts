import { apiUrl } from "../apiBase";
import type {
  AppointmentDto,
  AppointmentListDto,
  AvailableSlotsDto,
  BarberDto,
  BookAppointmentRequest,
  CustomerDto,
  ExtraServiceDto,
  PromoCodeResultDto,
  ReviewDto,
  ServiceDto,
} from "./types";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(apiUrl(path), {
    headers: init?.body ? { "Content-Type": "application/json" } : undefined,
    ...init,
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      if (body && typeof body.error === "string") message = body.error;
    } catch {
    }
    throw new Error(message);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const api = {
  getCurrentCustomer: () => request<CustomerDto>("/api/customers/current"),

  getServices: () => request<ServiceDto[]>("/api/services"),

  getBarbersOfService: (serviceId: string) =>
    request<BarberDto[]>(`/api/services/${serviceId}/barbers`),

  getExtraServices: () => request<ExtraServiceDto[]>("/api/extra-services"),

  getAppointments: (customerId: string) =>
    request<AppointmentListDto>(`/api/customers/${customerId}/appointments`),

  getAvailableSlots: (barberId: string, serviceId: string, date: string, customerId: string) =>
    request<AvailableSlotsDto>(
      `/api/barbers/${barberId}/slots`
        + `?serviceId=${encodeURIComponent(serviceId)}`
        + `&date=${encodeURIComponent(date)}`
        + `&customerId=${encodeURIComponent(customerId)}`,
    ),

  bookAppointment: (body: BookAppointmentRequest) =>
    request<AppointmentDto>("/api/appointments", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  cancelAppointment: (appointmentId: string, customerId: string, cancellationReason: string | null) =>
    request<AppointmentDto>(`/api/appointments/${appointmentId}/cancel`, {
      method: "PATCH",
      body: JSON.stringify({ customerId, cancellationReason }),
    }),

  completeAppointment: (appointmentId: string, customerId: string) =>
    request<AppointmentDto>(`/api/appointments/${appointmentId}/complete`, {
      method: "PATCH",
      body: JSON.stringify({ customerId }),
    }),

  submitReview: (appointmentId: string, customerId: string, rating: number, comment: string | null) =>
    request<ReviewDto>(`/api/appointments/${appointmentId}/review`, {
      method: "POST",
      body: JSON.stringify({ customerId, rating, comment }),
    }),

  applyPromoCode: (code: string, total: number) =>
    request<PromoCodeResultDto>("/api/promo-codes/apply", {
      method: "POST",
      body: JSON.stringify({ code, total }),
    }),
};
