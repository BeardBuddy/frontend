import type { User } from './User';
import { ServiceType } from '../common/types/ServiceType';
import { CertificationLevel } from '../common/types/CetificationLevel';

export class Service {
  static #extent: Service[] = [];

  readonly id: string;
  private _name: string;
  private _price: number;
  private _type: ServiceType;
  private _duration: number;
  private _description: string;
  private _isAvailable: boolean;

  private _requiresStyling: boolean | null;
  private _complexityLevel: CertificationLevel | null;
  private _subServiceIds: string[];

  private _barbers: User[] = [];

  constructor(
    id: string,
    name: string,
    price: number,
    type: ServiceType,
    duration: number,
    description: string,
    isAvailable?: boolean,
    requiresStyling?: boolean,
    complexityLevel?: CertificationLevel,
    subServiceIds?: string[],
  ) {
    this.id = id;
    this._name = name;
    this._price = price;
    this._type = type;
    this._duration = duration;
    this._description = description;
    this._isAvailable = isAvailable ?? true;
    this._requiresStyling = requiresStyling ?? null;
    this._complexityLevel = complexityLevel ?? null;
    this._subServiceIds = subServiceIds ?? [];

    Service.#extent.push(this);
  }

  static getExtent(): Service[] { return [...Service.#extent]; }
  static clearExtent(): void { Service.#extent = []; }

  static getHaircutServices(): Service[] {
    return Service.#extent.filter(s => s._type === ServiceType.HAIRCUT && s._isAvailable);
  }

  static getBeardServices(): Service[] {
    return Service.#extent.filter(s => s._type === ServiceType.BEARD && s._isAvailable);
  }

  static estimateDuration(s: Service): number {
    if (s._type === ServiceType.HYBRID && s._subServiceIds.length > 0) {
      return s._subServiceIds.reduce((total, sid) => {
        const sub = Service.#extent.find(srv => srv.id === sid);
        return total + (sub ? sub._duration : 0);
      }, 0);
    }
    return s._duration;
  }

  get name(): string { return this._name; }
  get type(): ServiceType { return this._type; }
  get duration(): number { return this._duration; }
  get description(): string { return this._description; }
  get isAvailable(): boolean { return this._isAvailable; }
  get requiresStyling(): boolean | null { return this._requiresStyling; }
  get complexityLevel(): CertificationLevel | null { return this._complexityLevel; }
  get subServiceIds(): string[] { return [...this._subServiceIds]; }

  addBarber(barber: User): void {
    if (!this._barbers.includes(barber)) this._barbers.push(barber);
  }

  getBarbers(): User[] { return [...this._barbers]; }

  getPrice(): number { return this._price; }
}
