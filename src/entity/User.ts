export class User {
  private readonly _name: string;

  constructor(name: string) {
    this._name = name;
  }

  id(): string {
    return encodeURIComponent(this._name);
  }

  name(): string {
    return this._name;
  }
}
