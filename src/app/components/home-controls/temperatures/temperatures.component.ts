import { Component, OnInit } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { TemperatureSensorState, TemperaturesStore } from './store';

export interface BMP280Sensor {
  name: string;
}

export interface TemperaturesComponentConfig {
  bmp280Sensors: BMP280Sensor[];
}

@Component({
  selector: 'app-temperatures',
  templateUrl: './temperatures.component.html',
  styleUrls: ['./temperatures.component.scss'],
  providers: [
    TemperaturesStore,
  ]
})
export class TemperaturesComponent implements OnInit {
  public barChartPlugins: ChartConfiguration<'bar'>['plugins'] = [];
  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    borderColor: '#ffffff',
    backgroundColor: '#f92aad',
    animation: false,
    color: '#ffffff',
    normalized: false,
    scales: {
      y: {
        ticks: {
          color: "#6d77b3",
          callback: function(this, value, idx) {
            return this.getLabelForValue(value as number) + "°C";
          }
        }
      },
      x: {
        ticks: {
          color: "#6d77b3",
          callback: function(this, value, idx) {
            // return idx % 4 == 0 ? this.getLabelForValue(value as  number) : '';
            return "";
          }
        }
      }
    },
  };

  public tempSensors$ = this.store.select((s) => s.tempSensors);

  constructor(
    protected readonly store: TemperaturesStore,
  ) { }

  ngOnInit(): void {
  }

  public trackBySensorName(index: number, state: TemperatureSensorState): string {
    return state.name;
  }

}
