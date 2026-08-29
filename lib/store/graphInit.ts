import { User } from '../../business-objects/User';
import { BarberService } from '../../business-objects/BarberService';
import { Schedule } from '../../business-objects/Schedule';
import { Appointment } from '../../business-objects/Appointment';
import { Service } from '../../business-objects/Service';
import { ExtraService } from '../../business-objects/ExtraService';
import { Review } from '../../business-objects/Review';

export function initGraph(appointmentExtras: Record<string, string[]>): void {

  BarberService.getExtent().forEach(bs => {
    const barber = User.getExtent().find(u => u.id === bs.barberId);
    const service = Service.getExtent().find(s => s.id === bs.serviceId);

    if (barber) {
      barber.addBarberService(bs);
    }
    if (service) {
      bs.setServiceInternal(service);
      if (barber) service.addBarber(barber);
    }
  });

  Schedule.getExtent().forEach(sch => {
    const barber = User.getExtent().find(u => u.id === sch.barberId);
    if (barber) {
      sch.setBarber(barber);
      barber.addSchedule(sch);
    }
  });

  Appointment.getExtent().forEach(app => {
    const barber = User.getExtent().find(u => u.id === app.barberId);
    const service = Service.getExtent().find(s => s.id === app.serviceId);
    const customer = User.getExtent().find(u => u.id === app.customerId);

    if (barber) app.setBarber(barber);
    if (service) app.setService(service);
    if (customer) customer.addAppointment(app);

    const extraIds = appointmentExtras[app.id] ?? [];
    extraIds.forEach(eid => {
      const extra = ExtraService.getExtent().find(e => e.id === eid);
      if (extra) app.addExtraService(extra);
    });
  });

  Review.getExtent().forEach(review => {
    const appointment = Appointment.getExtent().find(a => a.id === review.appointmentId);
    if (appointment) appointment.setReview(review);
  });
}
