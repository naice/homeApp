import { Injectable } from "@angular/core";
import { ComponentStore } from "@ngrx/component-store";

export interface ButtonControllerState {
    id: string;
    name: string;
    icon?: string;
}

@Injectable()
export class ButtonController extends ComponentStore<ButtonControllerState> {
    constructor() {
      super({ id: "mock", name: "Wohnzimmer Licht ich bin viel zu lang", });
    }

    public setControllerState(state: ButtonControllerState): void {
      this.setState(() => state);
    }
}
