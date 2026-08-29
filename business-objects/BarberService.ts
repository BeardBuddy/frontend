import type { User } from './User';
import type { Service } from './Service';
import { SeniorityLevel } from '../common/types/SeniorityLevel';
import { SpecializationType } from '../common/types/SpecializationType';

export class BarberService {
  static #extent: BarberService[] = [];

  readonly id: string;
  readonly barberId: string;
  readonly serviceId: string;
  private _seniority: SeniorityLevel;
  private _specializationType: SpecializationType;

  private _barber: User | null = null;
  private _service: Service | null = null;

  constructor(
    id: string,
    barberId: string,
    serviceId: string,
    seniority: SeniorityLevel,
    specializationType: SpecializationType,
  ) {
    this.id = id;
    this.barberId = barberId;
    this.serviceId = serviceId;
    this._seniority = seniority;
    this._specializationType = specializationType;

    BarberService.#extent.push(this);
  }

  static getExtent(): BarberService[] { return [...BarberService.#extent]; }
  static clearExtent(): void { BarberService.#extent = []; }

  get seniority(): SeniorityLevel { return this._seniority; }
  get specializationType(): SpecializationType { return this._specializationType; }

  setBarberInternal(barber: User): void { this._barber = barber; }
  getBarber(): User | null { return this._barber; }

  setServiceInternal(service: Service): void { this._service = service; }
  getService(): Service | null { return this._service; }

  getSeniority(): SeniorityLevel { return this._seniority; }

  isExpert(): boolean {
    if (this._seniority !== SeniorityLevel.SENIOR) return false;
    if (!this._barber) return false;

    const services = this._barber.getBarberServices();
    const hasHaircut = services.some(bs => bs.specializationType === SpecializationType.HAIRCUT);
    const hasBeard = services.some(bs => bs.specializationType === SpecializationType.BEARD);
    return hasHaircut && hasBeard;
  }
}
