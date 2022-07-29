import { Component, OnInit } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { TemperaturesStore } from './store';

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
  public barChartLegend = true;
  public barChartPlugins = [];

  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [ '2006', '2007', '2008', '2009', '2010', '2011', '2012' ],
    datasets: [
      { data: [ 65, 59, 80, 81, 56, 55, 40 ], label: 'Series A' },
      { data: [ 28, 48, 40, 19, 86, 27, 90 ], label: 'Series B' }
    ]
  };

  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: false,
    borderColor: 'transparent',
    backgroundColor: '#ff0000'
  };


  constructor(
    protected readonly store: TemperaturesStore,
  ) { }

  ngOnInit(): void {
  }

}
