import { state } from "@angular/animations";
import { Inject, Injectable } from "@angular/core";
import { ComponentStore, tapResponse } from "@ngrx/component-store";
import { combineLatest, forkJoin, interval, Observable, of } from "rxjs";
import { concatMap, mergeMap } from "rxjs/operators";
import { GROUP_CONFIG } from "src/app/model/home-control-store";
import { InfluxDBService, InfluxSerie } from "src/app/services/influx-db.service";
import { TemperaturesComponentConfig } from "./temperatures.component";



export interface TemperatureState
{
  temp?: number,
  pressure?: number,
  timestamp: string,
}

export interface TemperatureSensorState
{
  name: string,
  states?: TemperatureState[],
}

export interface TemperaturesState {
  tempSensors: TemperatureSensorState[],
  error?: string,
}

@Injectable()
export class TemperaturesStore extends ComponentStore<TemperaturesState> {
    constructor(
      @Inject(GROUP_CONFIG)
      protected readonly tempsConfig: TemperaturesComponentConfig,
      protected readonly influx: InfluxDBService,
    ) {
      super({ tempSensors: tempsConfig.bmp280Sensors, ...tempsConfig, });
    }

    private setError = this.updater((state, error: string) => ({...state, error }));

    private setSeries = this.updater((state, series: InfluxSerie[][]) => {
      const nState: TemperaturesState = {...state};

      nState.tempSensors.forEach((sensor) => {
        const serie = this.findSeries(series, sensor.name);
        if (!serie) {
          return;
        }
        sensor.states = serie.values.map((value) => ({ timestamp: value[0] as string, temp: value[2] as number }));
      });

      return nState;
    })

    public findSeries(series: InfluxSerie[][], name: string): InfluxSerie | undefined {
      let serie: InfluxSerie | undefined;

      for (const ss of series) {
        serie = ss.find(s => s.values[0].findIndex((v) => v === name) > -1)
        if (serie) {
          break;
        }
      };

      return serie;
    }

    private sensors$ = this.select((state) => state.tempSensors);

    public temps$ = this.effect(() =>
      combineLatest([this.sensors$, interval(10000)]).pipe(
        concatMap(([sensors]) =>
          forkJoin(sensors.map((sensor) => this.influx.getTemperatures(sensor.name))).pipe(
            tapResponse((series) => this.setSeries(series),
            (e: string) => this.setError(e))
          )
        )
      )
    );
  }
