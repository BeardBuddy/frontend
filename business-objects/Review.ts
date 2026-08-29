import { toLocalDateStr } from '../common/utils/dateUtils';

export class Review {
  static #extent: Review[] = [];

  readonly id: string;
  readonly appointmentId: string;
  readonly customerId: string;
  private _rating: number;
  private _comment: string | null;
  private _date: string;

  constructor(
    id: string,
    appointmentId: string,
    customerId: string,
    rating: number,
    comment?: string,
    date?: string,
  ) {
    if (rating < 1 || rating > 5) throw new Error('Rating must be between 1 and 5');

    this.id = id;
    this.appointmentId = appointmentId;
    this.customerId = customerId;
    this._rating = rating;
    this._comment = comment ?? null;
    this._date = date ?? toLocalDateStr(new Date());

    Review.#extent.push(this);
  }

  static getExtent(): Review[] { return [...Review.#extent]; }
  static clearExtent(): void { Review.#extent = []; }

  get rating(): number { return this._rating; }
  get comment(): string | null { return this._comment; }
  get date(): string { return this._date; }
}
