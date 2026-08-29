export type PromoCodeStatus = 'ACTIVE' | 'EXPIRED' | 'LIMIT_REACHED';

export class PromoCode {
  static #extent: PromoCode[] = [];

  readonly code: string;
  readonly discountPercent: number;
  private _status: PromoCodeStatus;
  private _usageLimit: number;
  private _usedCount: number;
  private _expiresAt: Date | null;

  constructor(
    code: string,
    discountPercent: number,
    status: PromoCodeStatus,
    usageLimit: number,
    usedCount: number,
    expiresAt?: Date,
  ) {
    this.code = code;
    this.discountPercent = discountPercent;
    this._status = status;
    this._usageLimit = usageLimit;
    this._usedCount = usedCount;
    this._expiresAt = expiresAt ?? null;

    PromoCode.#extent.push(this);
  }

  static getExtent(): PromoCode[] { return [...PromoCode.#extent]; }
  static clearExtent(): void { PromoCode.#extent = []; }

  static findByCode(code: string): PromoCode | undefined {
    return PromoCode.#extent.find(p => p.code === code.trim().toUpperCase());
  }

  get status(): PromoCodeStatus { return this._status; }

  isExpired(): boolean {
    if (this._expiresAt && new Date() > this._expiresAt) return true;
    return this._status === 'EXPIRED';
  }

  isLimitReached(): boolean {
    return this._usedCount >= this._usageLimit || this._status === 'LIMIT_REACHED';
  }

  isValid(): boolean {
    return !this.isExpired() && !this.isLimitReached() && this._status === 'ACTIVE';
  }

  calcDiscount(total: number): number {
    return Math.round(total * (this.discountPercent / 100) * 100) / 100;
  }
}
