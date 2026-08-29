import { User } from '../business-objects/User';
import { Appointment } from '../business-objects/Appointment';
import { apiUrl } from '../lib/apiBase';

export interface CompleteAppointmentInput {
  customer: User;
  appointment: Appointment;
}

export async function completeAppointmentUseCase(input: CompleteAppointmentInput): Promise<void> {
  const { customer, appointment } = input;

  customer.completeOwnAppointment(appointment);

  await fetch(apiUrl(`/api/appointments/${appointment.id}/status`), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'COMPLETED' }),
  });
}
