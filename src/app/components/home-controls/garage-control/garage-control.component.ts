import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { GarageStore, GarageCarState } from './store';
import { map, take, } from "rxjs/operators";

@Component({
  selector: 'app-garage-control',
  templateUrl: './garage-control.component.html',
  styleUrls: ['./garage-control.component.scss'],
  providers: [
    GarageStore
  ]
})
export class GarageControlComponent implements OnInit {

  constructor(
    protected readonly http: HttpClient,
    protected readonly store: GarageStore,
  ) { }

  public state$ = this.store.state$;
  public isLoading$ = this.store.select((state) => state.isLoading);
  public data$ = this.store.select((state) => state.data);
  public carState$ = this.store.select((state) => state.data?.carState);
  public carIcon$ = this.carState$.pipe(
    map((carState) => {
      if (carState === GarageCarState.CHARGING) {
        return "car-electric-outline";
      }
      if (carState === GarageCarState.PARKING) {
        return "car-outline";
      }
      if (carState === GarageCarState.EMPTY) {
        return "garage-open";
      }
      return "alert-decagram";
    })
  );
  public carText$ = this.carState$.pipe(
    map((carState) => {
      if (carState === GarageCarState.CHARGING) {
        return "Tesla lädt.";
      }
      if (carState === GarageCarState.PARKING) {
        return "Tesla parkt.";
      }
      if (carState === GarageCarState.EMPTY) {
        return "Garage leer.";
      }
      return "Keine infos.";
    })
  );

  ngOnInit(): void {
    //this.store.state$.pipe(take(1)).subscribe((state) => this.store.updateRegister(state.registerName));
  }

  public garageButtonClicked(): void {
    console.log("GARAGE BUTTON CLICK");
    this.store.toggleGarageDoor().pipe(take(1)).subscribe((result) => {
      console.log("GARAGE DOOR REQUEST " + result);
    });
  }

}
