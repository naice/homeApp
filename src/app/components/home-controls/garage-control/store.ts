import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { ComponentStore, tapResponse } from "@ngrx/component-store";
import { combineLatest, EMPTY, interval, Observable, of, range } from "rxjs";
import { map, take, concatMap, } from "rxjs/operators";
import { GROUP_CONFIG } from "src/app/model/home-control-store";
import { RegisterMeService, RegisterObject } from "src/app/services/register-me.service";
import { GarageControlConfig } from "./config";


export enum GarageCarState {
  EMPTY = "EMPTY",
  CHARGING = "CHARGING",
  CHARGED = "CHARGED",
  PARKING = "PARKING",
  UNKNOWN = "UNKNOWN",
}

interface GarageESP {
  distance: number,
  garageClosed: number,
}

export interface GarageData {
  vehicle_connected?: boolean,
  contactor_closed?: boolean,
  session_energy_wh?: number,
  distance?: number,
  garageClosed?: number,
  open?: boolean,
  carState: GarageCarState,
}

export interface GarageState extends GarageControlConfig {
  isLoading: boolean;
  error?: string;
  registerObjects: (RegisterObject | undefined)[];
  data?: GarageData;
}

interface WallboxVitals {
  vehicle_connected: boolean,
  contactor_closed: boolean,
  session_energy_wh: number,
}

@Injectable()
export class GarageStore extends ComponentStore<GarageState> {
    constructor(
      @Inject(GROUP_CONFIG)
      protected readonly garageConfig: GarageControlConfig,
      protected readonly registerService: RegisterMeService,
      protected readonly http: HttpClient,
    ) {
      super({ ...garageConfig, isLoading: true, registerObjects:[] });
    }

    public setIsLoading = this.updater((state, isLoading: boolean) => ({...state, isLoading}))
    public tryUnsetIsLoading = this.updater((state) => (
      {
        ...state,
        isLoading:
          state.registerObjects.length <= 0 ||
          state.data === undefined ||
          state.data === null
      }
    ));
    public setRegisterObjects = this.updater((state, registerObjects: (RegisterObject | undefined)[]) => (
      { ...state, registerObjects }
    ));
    public setError = this.updater((state, error: string | undefined) => (
      { ...state, error }
    ));
    public setGarageData = this.updater((state, data: GarageData) => (
      { ...state, data }
    ));

    private registerObjects$ = this.select((state) => state.registerObjects);
    private registerNames$ = this.select((state) => state.registerNames);

    public updateData = this.effect(() =>
      combineLatest([this.registerObjects$, interval(2000)]).pipe(
        concatMap(([[garageESP, wallbox]]) => {
        if  (!garageESP || !wallbox) {
          return EMPTY;
        }
        return combineLatest([
          this.registerService.request<GarageESP>(garageESP, "GET_info"),
          this.registerService.request<WallboxVitals>(wallbox, "GET_VITALS"),
        ]).pipe(
          tapResponse(([garage, wallbox]) =>
          {
            const carState = this.getCarState(garage, wallbox);
            this.setGarageData({
              ...garage, ...wallbox, carState
            });
            this.tryUnsetIsLoading();
          },
          (e: string) => this.setError(e))
        );
      }))
    );

    public updateRegister = this.effect(() =>
      this.registerNames$.pipe(
        concatMap((registerNames) => {
          this.setIsLoading(true);
          return this.registerService.getRegisterObjects(registerNames)
            .pipe(
              tapResponse(obj => {
                  this.setRegisterObjects(obj);
                  this.tryUnsetIsLoading();
                },
                (e: string) => this.setError(e)
              )
            )
          }
        )
      )
    );

    public getCarState(garage: { distance: number; } | undefined, wallbox: WallboxVitals | undefined): GarageCarState {
      if (wallbox !== undefined &&
          wallbox.vehicle_connected &&
          wallbox.contactor_closed) {
        return GarageCarState.CHARGING;
      }
      if (wallbox !== undefined &&
          wallbox.vehicle_connected &&
          !wallbox.contactor_closed) {
        return GarageCarState.CHARGED;
      }
      if (garage?.distance !== undefined && garage.distance < 120 && garage.distance > 0) {
        return GarageCarState.PARKING;
      }
      if (garage?.distance !== undefined && garage.distance > 120 && garage.distance < 500) {
        return GarageCarState.EMPTY;
      }
      return GarageCarState.UNKNOWN
    }

    public toggleGarageDoor(): Observable<boolean> {
      return this.registerObjects$.pipe(take(1), concatMap(([garage]) => {
        if (!garage) {
          return of(false);
        }
        return this.registerService.request(garage, "POST_relay", { "toggle": true })
          .pipe(map((result) => (result !== undefined)));
      }));

    }
}
