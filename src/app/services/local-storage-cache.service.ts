export class LSCache<CachedType> {
  private _wasLoaded = false;
  private _value: CachedType | undefined;
  private _localStorageKey: string;

  public get value(): CachedType | undefined {
    if (!this._wasLoaded && !this._value) {
      this._value = this.read();
      this._wasLoaded = true;
    }
    return this._value;
  }
  public set value(value: CachedType | undefined) {
    if (!value || this._value === value) {
      return;
    }
    this._value = value;
    this.write(value);
  }

  constructor(localStorageKey: string) {
      this._localStorageKey = localStorageKey;
  }

  public read(): CachedType | undefined {
    try {
      var json = localStorage.getItem(this._localStorageKey);
      if (!json) {
        return undefined;
      }
      return JSON.parse(json);
    } catch (error) {
      console.error(error);
    }
    return undefined;
  }

  public write(data: CachedType | undefined = undefined): void {
    var localStorage = window.localStorage;
    localStorage.setItem(this._localStorageKey, JSON.stringify(data));
  }
}

