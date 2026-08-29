import { User } from '../../business-objects/User';
import { Service } from '../../business-objects/Service';
import { BarberService } from '../../business-objects/BarberService';
import { Schedule } from '../../business-objects/Schedule';
import { Appointment } from '../../business-objects/Appointment';
import { ExtraService } from '../../business-objects/ExtraService';
import { Review } from '../../business-objects/Review';
import { PromoCode } from '../../business-objects/PromoCode';
import { ApiPayload } from '../../business-objects/ApiPayload';
import { UserRole } from '../../common/types/UserRole';
import { SeniorityLevel } from '../../common/types/SeniorityLevel';
import { SpecializationType } from '../../common/types/SpecializationType';
import { ServiceType } from '../../common/types/ServiceType';
import { ExtraType } from '../../common/types/ExtraType';
import { AppointmentStatus } from '../../common/types/AppointmentStatus';
import { PaymentStatus } from '../../common/types/PaymentStatus';
import { PaymentMethod } from '../../common/types/PaymentMethod';
import { DayOfWeek } from '../../common/types/DayOfWeek';
import { CertificationLevel } from '../../common/types/CetificationLevel';

function clearAllExtents(): void {
  User.clearExtent();
  Service.clearExtent();
  BarberService.clearExtent();
  Schedule.clearExtent();
  Appointment.clearExtent();
  ExtraService.clearExtent();
  Review.clearExtent();
  PromoCode.clearExtent();
}

export function initExtents(api: ApiPayload): void {
  clearAllExtents();

  api.users.forEach(u =>
    new User(
      u.id,
      u.firstName,
      u.lastName,
      u.phone,
      u.dateOfBirth,
      u.role as UserRole,
      u.seniorityLevel as SeniorityLevel | undefined,
      u.specializationType as SpecializationType | undefined,
      u.experienceYears,
      u.hireDate,
      u.description,
      u.loyaltyPoints,
      u.managementAccess,
      u.canMentor,
      u.certifications,
      u.maxClientsPerDay,
      u.scissorsMastery,
      u.supportsLongHair,
      u.trimMastery,
      u.supportsHotTowel,
      u.beardCareKnowledge,
      u.email,
    ),
  );

  api.services.forEach(s =>
    new Service(
      s.id,
      s.name,
      s.price,
      s.type as ServiceType,
      s.duration,
      s.description,
      s.isAvailable,
      s.requiresStyling,
      s.complexityLevel as CertificationLevel | undefined,
      s.subServiceIds,
    ),
  );

  api.barberServices.forEach(bs =>
    new BarberService(
      bs.id,
      bs.barberId,
      bs.serviceId,
      bs.seniority as SeniorityLevel,
      bs.specializationType as SpecializationType,
    ),
  );

  api.schedules.forEach(sch =>
    new Schedule(
      sch.id,
      sch.barberId,
      sch.dayOfWeek as DayOfWeek,
      sch.startTime,
      sch.endTime,
      sch.validFrom,
      sch.validTo,
      sch.isActive,
    ),
  );

  api.appointments.forEach(a =>
    new Appointment(
      a.id,
      a.customerId,
      a.barberId,
      a.serviceId,
      a.date,
      a.startTime,
      a.endTime,
      a.status as AppointmentStatus | undefined,
      a.paymentStatus as PaymentStatus | undefined,
      a.paymentMethod as PaymentMethod | undefined,
      a.totalPrice,
      a.notes,
      a.cancellationReason,
    ),
  );

  api.extraServices.forEach(e =>
    new ExtraService(e.id, e.type as ExtraType, e.name, e.price, e.description),
  );

  api.reviews.forEach(r =>
    new Review(r.id, r.appointmentId, r.customerId, r.rating, r.comment, r.date),
  );

  new PromoCode('AAAA', 20, 'ACTIVE', 9999, 0);
  new PromoCode('BBBB', 0, 'LIMIT_REACHED', 1, 1);
}
