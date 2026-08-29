import type { Schedule } from './Schedule';
import type { Service } from './Service';
import { Appointment } from './Appointment';
import { BarberService } from './BarberService';
import { ExtraService } from './ExtraService';
import { Review } from './Review';
import { toLocalDateStr } from '../common/utils/dateUtils';
import { UserRole } from '../common/types/UserRole';
import { SeniorityLevel } from '../common/types/SeniorityLevel';
import { SpecializationType } from '../common/types/SpecializationType';
import { AppointmentStatus } from '../common/types/AppointmentStatus';
import { PaymentStatus } from '../common/types/PaymentStatus';
import { PaymentMethod } from '../common/types/PaymentMethod';
import { IContactInfo } from '../common/types/IContactInfo';

export class User {
  static #extent: User[] = [];

  readonly id: string;
  private _firstName: string;
  private _lastName: string;
  private _contactInfo: IContactInfo;
  private _dateOfBirth: string;
  private _role: UserRole;

  private _seniorityLevel: SeniorityLevel | null;
  private _specializationType: SpecializationType | null;
  private _experienceYears: number | null;
  private _hireDate: string | null;
  private _description: string | null;
  private _managementAccess: boolean;
  private _canMentor: boolean;
  private _certifications: string[];
  private _maxClientsPerDay: number | null;
  private _scissorsMastery: boolean | null;
  private _supportsLongHair: boolean | null;
  private _trimMastery: boolean | null;
  private _supportsHotTowel: boolean | null;
  private _beardCareKnowledge: string[];

  private _loyaltyPoints: number;
  private _appointments: Appointment[] = [];
  private _barberServices: BarberService[] = [];
  private _schedules: Schedule[] = [];
  static get totalBarbers(): number {
    return User.#extent.filter(u => u._role === UserRole.BARBER).length;
  }

  constructor(
    id: string,
    firstName: string,
    lastName: string,
    phone: string,
    dateOfBirth: string,
    role: UserRole,
    seniorityLevel?: SeniorityLevel,
    specializationType?: SpecializationType,
    experienceYears?: number,
    hireDate?: string,
    description?: string,
    loyaltyPoints?: number,
    managementAccess?: boolean,
    canMentor?: boolean,
    certifications?: string[],
    maxClientsPerDay?: number,
    scissorsMastery?: boolean,
    supportsLongHair?: boolean,
    trimMastery?: boolean,
    supportsHotTowel?: boolean,
    beardCareKnowledge?: string[],
    email?: string,
  ) {
    this.id = id;
    this._firstName = firstName;
    this._lastName = lastName;
    this._contactInfo = { phone, email };
    this._dateOfBirth = dateOfBirth;
    this._role = role;
    this._seniorityLevel = seniorityLevel ?? null;
    this._specializationType = specializationType ?? null;
    this._experienceYears = experienceYears ?? null;
    this._hireDate = hireDate ?? null;
    this._description = description ?? null;
    this._loyaltyPoints = loyaltyPoints ?? 0;
    this._managementAccess = managementAccess ?? false;
    this._canMentor = canMentor ?? false;
    this._certifications = certifications ?? [];
    this._maxClientsPerDay = maxClientsPerDay ?? null;
    this._scissorsMastery = scissorsMastery ?? null;
    this._supportsLongHair = supportsLongHair ?? null;
    this._trimMastery = trimMastery ?? null;
    this._supportsHotTowel = supportsHotTowel ?? null;
    this._beardCareKnowledge = beardCareKnowledge ?? [];

    User.#extent.push(this);
  }

  static getExtent(): User[] { return [...User.#extent]; }
  static clearExtent(): void { User.#extent = []; }

  get firstName(): string { return this._firstName; }
  get lastName(): string { return this._lastName; }
  get fullName(): string { return `${this._firstName} ${this._lastName}`; }
  get contactInfo(): IContactInfo { return this._contactInfo; }
  get dateOfBirth(): string { return this._dateOfBirth; }
  get role(): UserRole { return this._role; }
  get seniorityLevel(): SeniorityLevel | null { return this._seniorityLevel; }
  get specializationType(): SpecializationType | null { return this._specializationType; }
  get experienceYears(): number | null { return this._experienceYears; }
  get hireDate(): string | null { return this._hireDate; }
  get description(): string | null { return this._description; }
  get loyaltyPoints(): number { return this._loyaltyPoints; }
  get managementAccess(): boolean { return this._managementAccess; }
  get canMentor(): boolean { return this._canMentor; }
  get certifications(): string[] { return [...this._certifications]; }
  get maxClientsPerDay(): number | null { return this._maxClientsPerDay; }
  get scissorsMastery(): boolean | null { return this._scissorsMastery; }
  get supportsLongHair(): boolean | null { return this._supportsLongHair; }
  get trimMastery(): boolean | null { return this._trimMastery; }
  get supportsHotTowel(): boolean | null { return this._supportsHotTowel; }
  get beardCareKnowledge(): string[] { return [...this._beardCareKnowledge]; }

  set loyaltyPoints(value: number) { this._loyaltyPoints = value; }

  setSpecializationType(type: SpecializationType): void {
    if (this._role !== UserRole.BARBER) throw new Error('Only barbers have a specialization type');
    this._specializationType = type;
  }

  addSchedule(schedule: Schedule): void {
    if (this._role !== UserRole.BARBER) throw new Error('Only barbers have schedules');
    if (!this._schedules.includes(schedule)) this._schedules.push(schedule);
  }
  getSchedule(): Schedule | null { return this._schedules[0] ?? null; }
  getSchedules(): Schedule[] { return [...this._schedules]; }

  addAppointment(appointment: Appointment): void {
    if (!this._appointments.includes(appointment)) {
      this._appointments.push(appointment);
    }
  }
  getAppointments(): Appointment[] { return [...this._appointments]; }

  addBarberService(barberService: BarberService): void {
    if (this._role !== UserRole.BARBER) {
      throw new Error('Customer cannot provide barber services');
    }
    if (!this._barberServices.includes(barberService)) {
      this._barberServices.push(barberService);
      barberService.setBarberInternal(this);
    }
  }
  getBarberServices(): BarberService[] { return [...this._barberServices]; }

  getServices(): BarberService[] {
    if (this._role !== UserRole.BARBER) throw new Error('Only barbers provide services');
    return [...this._barberServices];
  }

  getAppointmentsForDay(date: Date): Appointment[] {
    const dateStr = toLocalDateStr(date);
    if (this._role === UserRole.CUSTOMER) {
      return this._appointments.filter(a => a.date === dateStr);
    }
    return Appointment.getExtent().filter(a => a.barberId === this.id && a.date === dateStr);
  }

  getAverageRating(): number {
    if (this._role !== UserRole.BARBER) throw new Error('Only barbers have ratings');
    const reviewed = Appointment.getExtent().filter(
      a => a.barberId === this.id && a.status === AppointmentStatus.COMPLETED && a.getReview() !== null,
    );
    if (reviewed.length === 0) return 0;
    const sum = reviewed.reduce((acc, a) => acc + a.getReview()!.rating, 0);
    return Math.round((sum / reviewed.length) * 10) / 10;
  }

  getRemainingSlots(date: Date): string[] {
    if (this._role !== UserRole.BARBER) throw new Error('Only barbers have remaining slots');
    const sch = this._schedules.find(s => s.isWithinSchedule(date, date));
    if (!sch) return [];
    const dateStr = toLocalDateStr(date);
    const occupied = Appointment.getExtent().filter(
      a => a.barberId === this.id && a.date === dateStr && a.status !== AppointmentStatus.CANCELLED,
    );
    return sch.getRemainingSlots(occupied);
  }

  isAvailableAt(barberId: string, date: Date, startTime: string, endTime: string): boolean {
    if (this._role !== UserRole.BARBER) throw new Error('Only barbers can be checked for availability');
    const dateStr = toLocalDateStr(date);
    const conflict = Appointment.getExtent().some(
      a =>
        a.barberId === barberId &&
        a.date === dateStr &&
        a.status !== AppointmentStatus.CANCELLED &&
        a.startTime < endTime &&
        a.endTime > startTime,
    );
    return !conflict;
  }

  isWithinSchedule(time: string | Date, date?: Date): boolean {
    if (this._role !== UserRole.BARBER) throw new Error('Only barbers have schedules');
    return this._schedules.some(s => s.isWithinSchedule(time, date));
  }

  completeAppointment(a: Appointment): void {
    if (this._role !== UserRole.BARBER) throw new Error('Only barbers can complete appointments');
    const now = new Date();
    const apptStart = new Date(`${a.date}T${a.startTime}`);
    const apptEnd = new Date(`${a.date}T${a.endTime}`);
    if (now >= apptStart && now < apptEnd) {
      a.setAppointmentStatus(AppointmentStatus.IN_PROGRESS);
    } else if (now >= apptEnd) {
      a.setAppointmentStatus(AppointmentStatus.COMPLETED);
    }
  }

  approveAppointment(a: Appointment): void {
    if (this._role !== UserRole.BARBER) throw new Error('Only barbers can approve appointments');
    a.setAppointmentStatus(AppointmentStatus.CONFIRMED);
  }

  getAppointmentHistory(): Appointment[] {
    if (this._role !== UserRole.CUSTOMER) throw new Error('Only customers have appointment history');
    return this._appointments.filter(
      a => a.status === AppointmentStatus.COMPLETED || a.status === AppointmentStatus.CANCELLED,
    );
  }

  bookAppointment(
    barber: User,
    service: Service,
    date: Date,
    startTime: string,
    extras: ExtraService[] = [],
  ): Appointment {
    if (this._role !== UserRole.CUSTOMER) throw new Error('Only customers can book appointments');
    if (barber.role !== UserRole.BARBER) throw new Error('Executor must be a barber');
    if (!barber.getServices().some(bs => bs.serviceId === service.id))
      throw new Error('Selected barber does not provide this service');
    if (barber.getSchedules().length === 0)
      throw new Error('Selected barber has no schedule configured');
    if (!barber.isWithinSchedule(startTime, date))
      throw new Error('Selected time is outside the barber\'s working hours');

    const [sh, sm] = startTime.split(':').map(Number);
    const totalMin = sh * 60 + sm + service.duration;
    const endTime = `${String(Math.floor(totalMin / 60)).padStart(2, '0')}:${String(totalMin % 60).padStart(2, '0')}`;

    if (!barber.isAvailableAt(barber.id, date, startTime, endTime))
      throw new Error('Selected barber is already booked for this time slot');

    const extrasTotal = extras.reduce((s, e) => s + e.price, 0);
    const appointment = new Appointment(
      `appt-${Date.now()}`,
      this.id,
      barber.id,
      service.id,
      toLocalDateStr(date),
      startTime,
      endTime,
      AppointmentStatus.NEW,
      PaymentStatus.UNPAID,
      PaymentMethod.CASH,
      service.getPrice() + extrasTotal,
    );

    appointment.setBarber(barber);
    appointment.setService(service);
    extras.forEach(e => appointment.addExtraService(e));
    barber.approveAppointment(appointment);
    this._appointments.push(appointment);
    return appointment;
  }

  cancelAppointment(appointment: Appointment, cancellationReason?: string): void {
    if (this._role !== UserRole.CUSTOMER) throw new Error('Only customers can cancel appointments');
    if (!this._appointments.some(a => a.id === appointment.id))
      throw new Error('Appointment does not belong to this customer');
    if (appointment.status === AppointmentStatus.CANCELLED || appointment.status === AppointmentStatus.COMPLETED)
      throw new Error('Cannot cancel an appointment that is already completed or cancelled');
    appointment.setAppointmentStatus(AppointmentStatus.CANCELLED);
    if (cancellationReason) appointment.setCancellationReason(cancellationReason);
  }

  completeOwnAppointment(appointment: Appointment): void {
    if (this._role !== UserRole.CUSTOMER) throw new Error('Only customers can complete their appointments');
    if (!this._appointments.some(a => a.id === appointment.id))
      throw new Error('Appointment does not belong to this customer');
    if (
      appointment.status !== AppointmentStatus.CONFIRMED &&
      appointment.status !== AppointmentStatus.NEW &&
      appointment.status !== AppointmentStatus.IN_PROGRESS
    ) throw new Error('Appointment cannot be completed from its current status');
    appointment.setAppointmentStatus(AppointmentStatus.COMPLETED);
  }

  submitReview(appointment: Appointment, rating: number, comment?: string): Review {
    if (this._role !== UserRole.CUSTOMER) throw new Error('Only customers can submit reviews');
    if (!this._appointments.some(a => a.id === appointment.id))
      throw new Error('Customer can only review their own appointments');
    if (appointment.status !== AppointmentStatus.COMPLETED)
      throw new Error('Reviews can only be submitted for completed appointments');
    return appointment.addReview(rating, comment);
  }

  getUpcomingAppointments(): Appointment[] {
    if (this._role !== UserRole.CUSTOMER) throw new Error('Only customers have upcoming appointments');
    return this._appointments.filter(
      a => a.status === AppointmentStatus.NEW || a.status === AppointmentStatus.CONFIRMED || a.status === AppointmentStatus.IN_PROGRESS,
    );
  }

  getPastAppointments(): Appointment[] {
    if (this._role !== UserRole.CUSTOMER) throw new Error('Only customers have past appointments');
    return this._appointments.filter(
      a => a.status === AppointmentStatus.COMPLETED || a.status === AppointmentStatus.CANCELLED,
    );
  }
}
