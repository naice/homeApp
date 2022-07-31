import { state } from "@angular/animations";
import { Inject, Injectable } from "@angular/core";
import { ComponentStore, tapResponse } from "@ngrx/component-store";
import { ChartConfiguration } from "chart.js";
import * as moment from "moment";
import { combineLatest, forkJoin, interval, Observable, of, timer } from "rxjs";
import { concatMap, mergeMap } from "rxjs/operators";
import { GROUP_CONFIG } from "src/app/model/home-control-store";
import { InfluxDBService, InfluxSerie } from "src/app/services/influx-db.service";
import { TemperaturesComponentConfig } from "./temperatures.component";



export interface TemperatureState
{
  temp?: number,
  pressure?: number,
  timestamp: Date,
}

export interface TemperatureSensorState
{
  name: string,
  states?: TemperatureState[],
  chartData?: ChartConfiguration<'bar'>['data'],
}

export interface TemperaturesState {
  sensorsConfig: string[]
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
      super({ tempSensors:[], sensorsConfig: tempsConfig.bmp280Sensors.map((s) => s.name), ...tempsConfig, });
    }

    private setError = this.updater((state, error: string) => ({...state, error }));

    private setSeries = this.updater((state, series: InfluxSerie[][]) => {
      const nState: TemperaturesState = {...state};
      nState.tempSensors = [];

      nState.sensorsConfig.forEach((sensor) => {
        const serie = this.findSeries(series, sensor);
        if (!serie) {
          return;
        }
        const states = serie.values.map((value) => ({ timestamp: new Date(value[0]), temp: value[2] as number }));
        const chartData = {
          labels: states.map((sens) => moment(sens.timestamp).fromNow()) ?? [],
          datasets: [
            { data: states.map((sens) => sens.temp ?? 0) ?? [], label: 'Temperatur' },
          ]
        };

        nState.tempSensors.push({ name: sensor, states, chartData });
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

    private sensorsConfig$ = this.select((state) => state.sensorsConfig);

    public temps$ = this.effect(() =>
      combineLatest([this.sensorsConfig$, timer(0, 10000)]).pipe(
        concatMap(([sensors]) =>
          forkJoin(sensors.map((sensor) => this.influx.getTemperatures(sensor))).pipe(
            tapResponse((series) => this.setSeries(series),
            (e: string) => this.setError(e))
          )
        )
      )
    );
  }
