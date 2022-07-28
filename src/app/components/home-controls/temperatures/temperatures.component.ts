import { Component, OnInit } from '@angular/core';

export interface TemperaturesComponentConfig {

}

@Component({
  selector: 'app-temperatures',
  templateUrl: './temperatures.component.html',
  styleUrls: ['./temperatures.component.scss']
})
export class TemperaturesComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
