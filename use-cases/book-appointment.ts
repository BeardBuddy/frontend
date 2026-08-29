import { User } from '../business-objects/User';
import { Service } from '../business-objects/Service';
import { ExtraService } from '../business-objects/ExtraService';
import { Appointment } from '../business-objects/Appointment';
import { apiUrl } from '../lib/apiBase';

export interface BookAppointmentInput {
  customer: User;
  barber: User;
  service: Service;
  date: Date;
  startTime: string;
  extraServices?: ExtraService[];
  discount?: number;
}

export interface BookAppointmentResult {
  appointment: Appointment;
}

export async function bookAppointmentUseCase(input: BookAppointmentInput): Promise<BookAppointmentResult> {
  const { customer, barber, service, date, startTime, extraServices = [], discount = 0 } = input;

  const appointment = customer.bookAppointment(barber, service, date, startTime, extraServices);

  if (discount > 0) {
    appointment.applyDiscount(discount);
  }

  const res = await fetch(apiUrl('/api/appointments'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id:              appointment.id,
      customerId:      appointment.customerId,
      barberId:        appointment.barberId,
      serviceId:       appointment.serviceId,
      date:            appointment.date,
      startTime:       appointment.startTime,
      endTime:         appointment.endTime,
      status:          appointment.status,
      paymentStatus:   appointment.paymentStatus,
      paymentMethod:   appointment.paymentMethod,
      totalPrice:      appointment.totalPrice,
      notes:           appointment.notes ?? null,
      extraServiceIds: extraServices.map(e => e.id),
    }),
  });
  if (!res.ok) throw new Error('Failed to save appointment — server error');

  return { appointment };
}
