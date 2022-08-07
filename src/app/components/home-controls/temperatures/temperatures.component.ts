import { Component, OnInit } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { TemperatureSensorState, TemperaturesStore } from './store';

export interface BMP280Sensor {
  name: string;
}

export interface TemperaturesComponentConfig {
  bmp280Sensors: BMP280Sensor[];
}

const WeekDayMap = [
  "SO",
  "MO",
  "DI",
  "MI",
  "DO",
  "FR",
  "SA"
];

@Component({
  selector: 'app-temperatures',
  templateUrl: './temperatures.component.html',
  styleUrls: ['./temperatures.component.scss'],
  providers: [
    TemperaturesStore,
  ]
})
export class TemperaturesComponent implements OnInit {
  public tempSensors$ = this.store.select((s) => s.tempSensors);

  constructor(
    protected readonly store: TemperaturesStore,
  ) { }

  ngOnInit(): void {
  }

  public toWeekDay(date: Date): string {
    const dt = new Date();
    if (date.getDay() === dt.getDay()) {
      return "Heute";
    }
    return WeekDayMap[date.getDay()];
  }

  public trackBySensorName(index: number, state: TemperatureSensorState): string {
    return state.name;
  }

}
