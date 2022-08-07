import { Injectable, InjectionToken, Injector, ReflectiveInjector, StaticProvider, Type } from "@angular/core";
import { ComponentStore } from "@ngrx/component-store";
import { map } from "rxjs/operators";
import { groupGarage } from "./home-controls-config";

export abstract class ActionHandler {
  public abstract action(): void;
}

export const GROUP_CONFIG = new InjectionToken<unknown>('GROUP_CONFIG');

export interface HomeControlConfig {
  id: string;
  icon?: string;
  name: string;
  homeControlType: Type<unknown>;
  config?: unknown;
}

@Injectable()
export class HomeControlStore extends ComponentStore<HomeControlConfig> {
    constructor(protected injector: Injector) {
      super(groupGarage);
    }

    public outletInfo$ = this.state$.pipe(
      map((group) => {
          const providers: StaticProvider[] = [];

          if (group.config) {
            providers.push({provide: GROUP_CONFIG, useValue: group.config});
          }
          return {
            component: group.homeControlType,
            injector: Injector.create({
              providers,
              parent:this.injector
            }),
          }
        }
      )
    );
}
