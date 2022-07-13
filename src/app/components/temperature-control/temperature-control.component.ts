import { AfterViewInit, ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { getTemperatureLabel, TemperatureController, TemperatureUnit } from 'src/app/model/temperature-controller';
import { map, take } from 'rxjs/operators'
import { MatSliderChange } from '@angular/material/slider';

@Component({
  selector: 'app-temperature-control',
  templateUrl: './temperature-control.component.html',
  styleUrls: ['./temperature-control.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TemperatureControlComponent implements OnInit {

  constructor(
    protected tempController: TemperatureController,
  ) {
  }
  public tempCurrentLabel$ = this.tempController.state$.pipe(
    map((data) => getTemperatureLabel(data.tempCurrent, data.unit))
  );
  public tempTargetLabel$ = this.tempController.state$.pipe(
    map((data) => getTemperatureLabel(data.tempTarget, data.unit))
  );
  public min$ = this.tempController.state$.pipe(
    map((state) => state.min)
  );
  public max$ = this.tempController.state$.pipe(
    map((state) => state.max)
  );

  public get tempTarget(): number {
    let value = 0;
    this.tempController.state$.pipe(take(1)).subscribe((state) => (value = state.tempTarget));
    return value;
  }

  public setTempTarget(event: MatSliderChange): void {
    if (!event.value) {
      return;
    }
    this.tempController.setTempTarget(event.value);
  }

  ngOnInit(): void {
  }

  public reduceTemp(): void {
    this.tempController.state$.pipe(
      take(1),
    ).subscribe((state) => {
      const target = state.tempTarget - 1;
      if (target < state.min) {
        return;
      }
      this.tempController.setTempTarget(state.tempTarget - 1)
    });
  }
  public increaseTemp(): void {
    this.tempController.state$.pipe(
      take(1),
    ).subscribe((state) => {
      const target = state.tempTarget + 1;
      if (target > state.max) {
        return;
      }
      this.tempController.setTempTarget(state.tempTarget + 1)
    });
  }

}
