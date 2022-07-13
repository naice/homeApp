import { Injectable } from "@angular/core";
import { ComponentStore } from "@ngrx/component-store";

export const enum TemperatureUnit {
    CELSIUS = 1,
    FAHRENHEIT = 2,
}

export const getTemperatureLabel = (temp: number, unit: TemperatureUnit) => {
    return `${temp.toFixed(2)} °${unit === TemperatureUnit.CELSIUS ? "C" : "F"}`;
};

export interface TemperatureControllerState {
    id: string;
    tempCurrent: number;
    tempTarget: number;
    unit: TemperatureUnit;
    min: number;
    max: number;
}

@Injectable()
export class TemperatureController extends ComponentStore<TemperatureControllerState> {
    constructor() {
      super({
        id: "mock",
        tempCurrent: 26.222312312,
        tempTarget: 21,
        unit: TemperatureUnit.CELSIUS,
        min: 18,
        max: 38,
      });
    }

    public setTemperatureControllerData(state: TemperatureControllerState): void {
        this.setState(() => state);
    }

    public setTempTarget(temp: number): void {
        this.patchState((state) => ({ ...state, tempTarget: temp }));
    }
}
