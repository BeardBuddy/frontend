import { User } from '../business-objects/User';
import { Appointment } from '../business-objects/Appointment';
import { apiUrl } from '../lib/apiBase';

export interface CancelAppointmentInput {
  customer: User;
  appointment: Appointment;
  cancellationReason?: string;
}

export async function cancelAppointmentUseCase(input: CancelAppointmentInput): Promise<void> {
  const { customer, appointment, cancellationReason } = input;

  customer.cancelAppointment(appointment, cancellationReason);

  await fetch(apiUrl(`/api/appointments/${appointment.id}/cancel`), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cancellationReason: appointment.cancellationReason ?? null }),
  });
}
