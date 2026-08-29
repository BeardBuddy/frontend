import type { User } from './User';
import { DayOfWeek } from '../common/types/DayOfWeek';
import { toLocalDateStr } from '../common/utils/dateUtils';

export class Schedule {
  static #extent: Schedule[] = [];

  readonly id: string;
  readonly barberId: string;
  private _dayOfWeek: DayOfWeek;
  private _startTime: string;
  private _endTime: string;
  private _validFrom: string;
  private _validTo: string;
  private _isActive: boolean;

  private _barber: User | null = null;

  constructor(
    id: string,
    barberId: string,
    dayOfWeek: DayOfWeek,
    startTime: string,
    endTime: string,
    validFrom: string,
    validTo: string,
    isActive?: boolean,
  ) {
    this.id = id;
    this.barberId = barberId;
    this._dayOfWeek = dayOfWeek;
    this._startTime = startTime;
    this._endTime = endTime;
    this._validFrom = validFrom;
    this._validTo = validTo;
    this._isActive = isActive ?? true;

    Schedule.#extent.push(this);
  }

  static getExtent(): Schedule[] { return [...Schedule.#extent]; }
  static clearExtent(): void { Schedule.#extent = []; }

  get dayOfWeek(): DayOfWeek { return this._dayOfWeek; }
  get startTime(): string { return this._startTime; }
  get endTime(): string { return this._endTime; }
  get validFrom(): string { return this._validFrom; }
  get validTo(): string { return this._validTo; }
  get isActive(): boolean { return this._isActive; }

  setBarber(barber: User): void { this._barber = barber; }
  getBarber(): User | null { return this._barber; }

  isWithinSchedule(time: string | Date, date?: Date): boolean {
    if (!this._isActive) return false;

    if (date) {
      const dayMap: DayOfWeek[] = [
        DayOfWeek.SUN, DayOfWeek.MON, DayOfWeek.TUE, DayOfWeek.WED,
        DayOfWeek.THU, DayOfWeek.FRI, DayOfWeek.SAT,
      ];
      if (dayMap[date.getDay()] !== this._dayOfWeek) return false;

      const today = toLocalDateStr(date);
      if (today < this._validFrom || today > this._validTo) return false;
    }

    const timeMinutes =
      typeof time === 'string'
        ? Schedule.#toMinutes(time)
        : time.getHours() * 60 + time.getMinutes();

    return timeMinutes >= Schedule.#toMinutes(this._startTime) &&
           timeMinutes < Schedule.#toMinutes(this._endTime);
  }

  getTotalHours(): number {
    return (Schedule.#toMinutes(this._endTime) - Schedule.#toMinutes(this._startTime)) / 60;
  }

  getRemainingSlots(occupied: Array<{ startTime: string; endTime: string }>): string[] {
    const start = Schedule.#toMinutes(this._startTime);
    const end = Schedule.#toMinutes(this._endTime);
    const slots: string[] = [];
    for (let t = start; t + 30 <= end; t += 30) {
      const conflict = occupied.some(a =>
        t < Schedule.#toMinutes(a.endTime) && t + 30 > Schedule.#toMinutes(a.startTime),
      );
      if (!conflict) slots.push(Schedule.#toTimeString(t));
    }
    return slots;
  }

  static #toMinutes(t: string): number {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  }

  static #toTimeString(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }
}
