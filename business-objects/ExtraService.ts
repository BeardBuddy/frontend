import { ExtraType } from '../common/types/ExtraType';

export class ExtraService {
  static #extent: ExtraService[] = [];

  readonly id: string;
  private _type: ExtraType;
  private _name: string;
  private _price: number;
  private _description: string;

  constructor(id: string, type: ExtraType, name: string, price: number, description: string) {
    this.id = id;
    this._type = type;
    this._name = name;
    this._price = price;
    this._description = description;

    ExtraService.#extent.push(this);
  }

  static getExtent(): ExtraService[] { return [...ExtraService.#extent]; }
  static clearExtent(): void { ExtraService.#extent = []; }

  get type(): ExtraType { return this._type; }
  get name(): string { return this._name; }
  get price(): number { return this._price; }
  get description(): string { return this._description; }

  getPrice(): number { return this._price; }
}
