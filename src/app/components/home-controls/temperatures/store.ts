import { state } from "@angular/animations";
import { Inject, Injectable } from "@angular/core";
import { ComponentStore, tapResponse } from "@ngrx/component-store";
import { ChartConfiguration, ScriptableContext } from "chart.js";
import * as moment from "moment";
import { combineLatest, forkJoin, interval, Observable, of, timer } from "rxjs";
import { concatMap, mergeMap } from "rxjs/operators";
import { GROUP_CONFIG } from "src/app/model/home-control-store";
import { InfluxDBService, InfluxSerie } from "src/app/services/influx-db.service";
import { TemperaturesComponentConfig } from "./temperatures.component";
import { List } from 'linqts';


export interface TemperatureState
{
  temp: number,
  timestamp: Date,
}

export interface TemperatureSensorState
{
  name: string,
  states?: TemperatureState[],
  chartData?: ChartConfiguration<'line'>['data'],
  chartOptions?: ChartConfiguration<'line'>['options'],
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

    private aggregateSeries(values: (string | number)[][], groupBy: (ts: TemperatureState) => string): { timestamp: Date, temp: number }[] {
      const result: { timestamp: Date, temp: number } [] = [];
      const transformed = new List(
        values.map((value) => ({ timestamp: new Date(value[0]), temp: value[2] as number }))
      );

      const group = transformed.GroupBy(groupBy);

      for (const key in group) {
        const values = new List(group[key]);
        const temp = values.Sum(v => v!.temp) / values.Count();
        const dt = values.First().timestamp;
        const timestamp = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), dt.getHours(), 0, 0, 0);
        result.push({
          temp,
          timestamp
        });
      }

      return result;
    }

    private groupBy2Hours = (g: TemperatureState) => {
      const m = moment(g.timestamp);
      return `${m.year()}-${m.month()}-${m.day()}-${Math.floor(m.hour()/2)}`;
    }

    private groupByDay = (g: TemperatureState) => {
      const m = moment(g.timestamp);
      return `${m.year()}-${m.month()}-${m.day()}`;
    }

    private setSeries = this.updater((state, series: InfluxSerie[][]) => {
      const nState: TemperaturesState = {...state};
      nState.tempSensors = [];

      nState.sensorsConfig.forEach((sensor) => {
        const serie = this.findSeries(series, sensor);
        if (!serie) {
          return;
        }

        const aggregated = this.aggregateSeries(serie.values, this.groupByDay);
        const temperatures = aggregated.map((value) => value.temp);
        const vmin = Math.min(...temperatures)-5;
        const vmax = Math.max(...temperatures)+10;
        const min = vmin - (vmin % 5);
        const max = vmax - (vmax % 10);
        const chartData: ChartConfiguration<'line'>['data'] = {
          labels: aggregated.map((sens) => moment(sens.timestamp).format("HH:mm")) ?? [],
          datasets: [
            {
              data: aggregated.map((sens) => sens.temp ?? 0) ?? [],
              label: "Temperatur",
              borderColor: "transparent",
              backgroundColor: (context: ScriptableContext<"line">) => {
                const ctx = context.chart.ctx;
                const gradient = ctx.createLinearGradient(0, 0, 0, 200);
                gradient.addColorStop(0, "#f92aadff");
                gradient.addColorStop(1, "#00000000");
                return gradient;
              },
              fill: true,
              pointBackgroundColor: 'transparent',
              pointBorderColor: 'transparent',
              tension: 0.4,
            },
          ]
        };
        const chartOptions: ChartConfiguration<'line'>['options'] = {
          elements: {
            point: {
              radius: 0,
              hitRadius: 5,
              hoverRadius: 5
            }
          },
          scales: {
              x: {
                  display: false,
              },
              y: {
                  display: false,
              }
          },
          responsive: true,
          animation: false,
          normalized: true,
        };

        nState.tempSensors.push({ name: sensor, states: aggregated, chartData, chartOptions });
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
      combineLatest([this.sensorsConfig$, /*timer(0, 10000)*/]).pipe(
        concatMap(([sensors]) =>
          forkJoin(sensors.map((sensor) => this.influx.getTemperatures(sensor))).pipe(
            tapResponse((series) => this.setSeries(series),
            (e: string) => this.setError(e))
          )
        )
      )
    );
  }
