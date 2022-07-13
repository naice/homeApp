import { Injectable } from "@angular/core";
import { ComponentStore } from "@ngrx/component-store";

export const enum SwitchState {
    OFF = 0,
    ON = 1,
    UNKNOWN = 2,
}

export interface SwitchControllerState {
    id: string;
    name: string;
    state: SwitchState;
}

@Injectable()
export class SwitchController extends ComponentStore<SwitchControllerState> {
    constructor() {
      super({ id: "mock", name:"Wohnzimmer Licht ich bin viel zu lang", state: SwitchState.ON });
    }

    public setSwitchControllerState(state: SwitchControllerState): void {
      this.setState(() => state);
    }

    public setSwitchState(switchState: SwitchState): void {
      this.patchState((state) => ({ ...state, state: switchState }));
    }
}
