import { Injectable } from "@angular/core";
import { ComponentStore } from "@ngrx/component-store";
import { map } from "rxjs/operators";
import { HomeControlConfig } from "./home-control-store";
import { groupsConfig } from "./home-controls-config";

export interface AppState {
  groups: HomeControlConfig[]
}

@Injectable()
export class AppStore extends ComponentStore<AppState> {
    constructor() {
      super({ groups: groupsConfig });
    }

    public groups$ = this.state$.pipe(
      map((state) => state.groups)
    );
}
