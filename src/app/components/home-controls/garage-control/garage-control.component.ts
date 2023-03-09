import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { GarageStore, GarageCarState } from './store';
import { debounceTime, map, take, takeUntil, timeout, } from "rxjs/operators";
import { BehaviorSubject, interval, of, Subject } from 'rxjs';
import * as moment from 'moment';

const centPerKWH = 0.28;

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
  public error$ = this.store.select((state) => state.error);
  public isLoading$ = this.store.select((state) => state.isLoading).pipe(debounceTime(3000));
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
        return "Geladen";
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
  public softError$ = this.data$.pipe(map((data) => {
    if (data?.wbVitals == undefined){
      return "Tesla Wallbox antwortet nicht. (vitals)";
    }
    if (data?.wbLifeTime == undefined){
      return "Tesla Wallbox antwortet nicht. (lifetime)";
    }
    return undefined;
  }));
  public wbLifeTimeHasData$ = this.data$.pipe(map((data) => {
    if (!data?.wbLifeTime) {
      return false;
    }
    return true;
  }));
  public wbLifeTimeEuroText$ = this.data$.pipe(map((data) => {
    if (!data?.wbLifeTime?.energy_wh) {
      return undefined;
    }
    const kwh = data.wbLifeTime.energy_wh / 1000;
    const eur = kwh * centPerKWH;
    return eur.toFixed(2) + " €";
  }));
  public wbLifeTimeKWHText$ = this.data$.pipe(map((data) => {
    if (!data?.wbLifeTime?.energy_wh) {
      return undefined;
    }
    const kwh = data.wbLifeTime.energy_wh / 1000;
    return kwh.toFixed(1) + " kWh";
  }));
  public wbLifetimeChargingDurationText$ = this.data$.pipe(map((data) => {
    if (!data?.wbLifeTime?.charging_time_s) {
      return undefined;
    }
    return moment.duration(data.wbLifeTime.charging_time_s, "seconds").humanize();
  }));
  public wbSessionKWHText$ = this.data$.pipe(map((data) => {
    if (!data?.wbVitals?.session_energy_wh) {
      return undefined;
    }
      const kwh = data.wbVitals.session_energy_wh / 1000;
      return kwh.toFixed(1) + " kWh";
  }));
  public wbSessionEuroText$ = this.data$.pipe(map((data) => {
    if (!data?.wbVitals?.session_energy_wh) {
      return undefined;
    }
      const kwh = data.wbVitals.session_energy_wh / 1000;
      const eur = kwh * centPerKWH;
      return eur.toFixed(2) + " €";
  }));
  public wbSessionUptimeText$ = this.data$.pipe(map((data) => {
    if (!data?.wbVitals?.uptime_s) {
      return undefined;
    }
    return moment.duration(data.wbVitals.uptime_s, "seconds").humanize();
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
