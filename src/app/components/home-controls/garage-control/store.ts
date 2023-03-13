import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { ComponentStore, tapResponse } from "@ngrx/component-store";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { GROUP_CONFIG } from "src/app/model/home-control-store";
import { GarageESP, RegisterMeService, RegisterObject, WallboxLifeTime, WallboxVitals } from "src/app/services/register-me.service";
import { GarageControlConfig } from "./config";
import { LSCache } from "src/app/services/local-storage-cache.service";


export enum GarageCarState {
  EMPTY = "EMPTY",
  CHARGING = "CHARGING",
  CHARGED = "CHARGED",
  PARKING = "PARKING",
  UNKNOWN = "UNKNOWN",
}

export interface GarageData extends
    Partial<GarageESP> {
  wbLifeTime?: WallboxLifeTime,
  wbVitals?: WallboxVitals,
  carState: GarageCarState,
}

export interface GarageState extends GarageControlConfig {
  isLoading: boolean;
  error?: string;
  data?: GarageData;
}

const garageRegisterObject: RegisterObject = {
  "name": "GarageESP",
  "endpoints": {
    "POST_relay": "/relay",
    "GET_info": "/"
  },
  "ip": "192.168.178.104",
  "updated": 1678728871202,
  "created": 1657555041351
};

@Injectable()
export class GarageStore extends ComponentStore<GarageState> {
  public wallboxVitalsCache: LSCache<WallboxVitals> = new LSCache<WallboxVitals>("WallboxVitals");
  public wallboxLifeTimeCache: LSCache<WallboxLifeTime> = new LSCache<WallboxLifeTime>("WallboxLifeTime");
  public garageESPCache: LSCache<GarageESP> = new LSCache<GarageESP>("GarageESP");

  constructor(
    @Inject(GROUP_CONFIG)
    protected readonly garageConfig: GarageControlConfig,
    protected readonly registerService: RegisterMeService,
    protected readonly http: HttpClient,
  ) {
    super({
      ...garageConfig,
      isLoading: true
    });

    this.setGarageData(
      this.buildGarageData(
        this.garageESPCache.value,
        this.wallboxVitalsCache.value,
        this.wallboxLifeTimeCache.value
    ));
  }

  public setIsLoading = this.updater((state, isLoading: boolean) => ({...state, isLoading}))
  public tryUnsetIsLoading = this.updater((state) => (
    {
      ...state,
      isLoading:
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

  public buildGarageData(garageESP: GarageESP | undefined, wallboxVitals: WallboxVitals | undefined, wallboxLifeTime: WallboxLifeTime | undefined): GarageData {
    const carState = this.getCarState(garageESP, wallboxVitals);
    return {
      ...garageESP, wbVitals: wallboxVitals, carState, wbLifeTime: wallboxLifeTime
    };
  }

  public updateData = this.effect(() =>
    this.registerService.garageStream$.pipe(
      tapResponse((frame) =>
      {
        let garage = this.garageESPCache.value;
        if (frame.data?.garageESP) {
          this.garageESPCache.value = garage = frame.data?.garageESP;
        }
        let wbVitals = this.wallboxVitalsCache.value;
        if (frame.data?.wallboxVitals) {
          this.wallboxVitalsCache.value = wbVitals = frame.data?.wallboxVitals;
        }
        let wbLifeTime =  this.wallboxLifeTimeCache.value;
        if (frame.data?.garageESP) {
          this.wallboxLifeTimeCache.value = wbLifeTime = frame.data?.wallboxLifetime;
        }
        this.setGarageData(
          this.buildGarageData(garage, wbVitals, wbLifeTime)
        );
        this.tryUnsetIsLoading();
      },
      (e: string) => this.setError(e))
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
    return this.registerService.request(garageRegisterObject,
      "POST_relay", { "toggle": true })
      .pipe(map((result) => (result !== undefined)));
  }
}
