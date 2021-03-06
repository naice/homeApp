import { Injectable } from "@angular/core";
import { ComponentStore } from "@ngrx/component-store";
import { map } from "rxjs/operators";
import { HomeControlConfig } from "./home-control-store";
import { groupsMock } from "./group-mock";

export interface AppState {
  groups: HomeControlConfig[]
}

@Injectable()
export class AppStore extends ComponentStore<AppState> {
    constructor() {
      super({ groups: groupsMock });
    }

    public groups$ = this.state$.pipe(
      map((state) => state.groups)
    );
}
