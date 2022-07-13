import { Injectable, InjectionToken, Injector, ReflectiveInjector, StaticProvider, Type } from "@angular/core";
import { ComponentStore } from "@ngrx/component-store";
import { map } from "rxjs/operators";
import { groupMock03 } from "./group-mock";

export abstract class ActionHandler {
  public abstract action(): void;
}

export const GROUP_CONFIG = new InjectionToken<unknown>('GROUP_CONFIG');

export interface Group {
  id: string;
  name: string;
  homeControlType: Type<unknown>;
  config?: unknown;
}

@Injectable()
export class GroupStore extends ComponentStore<Group> {
    constructor(protected injector: Injector) {
      super(groupMock03);
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
