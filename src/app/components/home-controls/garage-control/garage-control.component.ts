import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { GarageStore, GarageCarState } from './store';
import { map, take, takeUntil, timeout, } from "rxjs/operators";
import { BehaviorSubject, interval, of, Subject } from 'rxjs';

@Component({
  selector: 'app-garage-control',
  templateUrl: './garage-control.component.html',
  styleUrls: ['./garage-control.component.scss'],
  providers: [
    GarageStore
  ]
})
export class GarageControlComponent implements OnInit, OnDestroy {

  constructor(
    protected readonly http: HttpClient,
    protected readonly store: GarageStore,
  ) { }

  public destroyS = new Subject();
  public destory$ = this.destroyS.asObservable();

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
  public carText$ = this.data$.pipe(
    map((data) => {
      const carState = data?.carState;
      if (carState === GarageCarState.CHARGING) {
        return "Lädt";
      }
      if (carState === GarageCarState.CHARGED) {
        let text = "Geladen";
        if (data?.session_energy_wh) {
          const kwh = data.session_energy_wh / 1000;
          const eur = kwh * 0.28;
          text = kwh.toFixed(1) + "kWh / " + eur.toFixed(2) + "€ - Geladen";
        }
        return text;
      }
      if (carState === GarageCarState.PARKING) {
        return "Parkt";
      }
      if (carState === GarageCarState.EMPTY) {
        return "Garage leer.";
      }
      return "";
    })
  );
  public doorState$ = this.store.select((state) => state.data?.garageClosed);
  public doorIcon$ = this.doorState$.pipe(map((open) => {
    console.log(open);
    if (open === undefined || open === null) {
      return "alert-decagram";
    }
    if (open === 1) {
      return "garage";
    }
    return "garage-open";
  }));
  public doorText$ = this.doorState$.pipe(map((open) => {
    if (open === undefined || open === null) {
      return "";
    }
    if (open === 1) {
      return "Garage geschlossen";
    }
    return "Garage offen";
  }));
  public doorButtonText$ = this.doorState$.pipe(map((open) => {
    if (open === undefined || open === null) {
      return "kein Zugriff";
    }
    if (open === 1) {
      return "Öffnen";
    }
    return "Schließen";
  }));

  ngOnInit(): void {}
  ngOnDestroy(): void {
    this.destroyS.next();
  }

  public garageButtonClicked(): void {
    console.log("GARAGE BUTTON CLICK");
    this.store.toggleGarageDoor().pipe(take(1)).subscribe(
      (result) => {
        console.log("GARAGE DOOR REQUEST " + result);
        if (result) {
          navigator.vibrate([500]);
        } else {
          navigator.vibrate([250, 250, 500]);
        }
      },
      (error) => {
        navigator.vibrate([250, 250, 500]);
      }
    );
  }

}
