import type { User } from './User';
import type { Service } from './Service';
import { ExtraService } from './ExtraService';
import { Review } from './Review';
import { AppointmentStatus } from '../common/types/AppointmentStatus';
import { PaymentStatus } from '../common/types/PaymentStatus';
import { PaymentMethod } from '../common/types/PaymentMethod';

export class Appointment {
  static #extent: Appointment[] = [];

  readonly id: string;
  readonly customerId: string;
  readonly barberId: string;
  readonly serviceId: string;
  private _date: string;
  private _startTime: string;
  private _endTime: string;
  private _status: AppointmentStatus;
  private _paymentStatus: PaymentStatus;
  private _paymentMethod: PaymentMethod;
  private _totalPrice: number;
  private _notes: string | null;
  private _cancellationReason: string | null;

  private _barber: User | null = null;
  private _service: Service | null = null;
  private _extraServices: ExtraService[] = [];
  private _review: Review | null = null;

  constructor(
    id: string,
    customerId: string,
    barberId: string,
    serviceId: string,
    date: string,
    startTime: string,
    endTime: string,
    status?: AppointmentStatus,
    paymentStatus?: PaymentStatus,
    paymentMethod?: PaymentMethod,
    totalPrice?: number,
    notes?: string,
    cancellationReason?: string,
  ) {
    this.id = id;
    this.customerId = customerId;
    this.barberId = barberId;
    this.serviceId = serviceId;
    this._date = date;
    this._startTime = startTime;
    this._endTime = endTime;
    this._status = status ?? AppointmentStatus.NEW;
    this._paymentStatus = paymentStatus ?? PaymentStatus.UNPAID;
    this._paymentMethod = paymentMethod ?? PaymentMethod.CASH;
    this._totalPrice = totalPrice ?? 0;
    this._notes = notes ?? null;
    this._cancellationReason = cancellationReason ?? null;

    Appointment.#extent.push(this);
  }

  static getExtent(): Appointment[] { return [...Appointment.#extent]; }
  static clearExtent(): void { Appointment.#extent = []; }

  get date(): string { return this._date; }
  get startTime(): string { return this._startTime; }
  get endTime(): string { return this._endTime; }
  get status(): AppointmentStatus { return this._status; }
  get paymentStatus(): PaymentStatus { return this._paymentStatus; }
  get paymentMethod(): PaymentMethod { return this._paymentMethod; }
  get totalPrice(): number { return this._totalPrice; }
  get notes(): string | null { return this._notes; }
  get cancellationReason(): string | null { return this._cancellationReason; }

  setBarber(barber: User): void { this._barber = barber; }
  getBarber(): User | null { return this._barber; }

  setService(service: Service): void { this._service = service; }
  getService(): Service | null { return this._service; }

  getExtraServices(): ExtraService[] { return [...this._extraServices]; }
  getReview(): Review | null { return this._review; }

  setCancellationReason(reason: string): void { this._cancellationReason = reason; }

  applyDiscount(amount: number): void {
    this._totalPrice = Math.max(0, Math.round((this._totalPrice - amount) * 100) / 100);
  }

  setAppointmentStatus(status: AppointmentStatus): void {
    this._status = status;
  }

  setPaymentStatus(status: PaymentStatus, method: PaymentMethod, amount: number): void {
    this._paymentStatus = status;
    this._paymentMethod = method;
    this._totalPrice = amount;
  }

  addExtraService(service: ExtraService): void {
    if (!this._extraServices.includes(service)) {
      this._extraServices.push(service);
      this._totalPrice += service.price;
    }
  }

  removeExtraService(service: ExtraService): void {
    const idx = this._extraServices.indexOf(service);
    if (idx !== -1) {
      this._extraServices.splice(idx, 1);
      this._totalPrice -= service.price;
    }
  }

  getTotalPrice(): number {
    const basePrice = this._service ? this._service.getPrice() : 0;
    const extrasTotal = this._extraServices.reduce((sum, e) => sum + e.price, 0);
    return basePrice + extrasTotal;
  }

  setReview(review: Review): void {
    this._review = review;
  }

  addReview(rating: number, comment?: string): Review {
    if (this._status !== AppointmentStatus.COMPLETED) {
      throw new Error('Review can only be added to a completed appointment');
    }
    if (this._review !== null) {
      throw new Error('Appointment already has a review');
    }
    const review = new Review(
      `rev-${this.id}`,
      this.id,
      this.customerId,
      rating,
      comment,
    );
    this._review = review;
    return review;
  }
}
