import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { map } from 'rxjs/operators';
import { SwitchController, SwitchState } from 'src/app/model/switch-controller';

@Component({
  selector: 'app-switch-control',
  templateUrl: './switch-control.component.html',
  styleUrls: ['./switch-control.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SwitchControlComponent implements OnInit {

  constructor(
    protected controller: SwitchController,
  ) { }

  public state$ = this.controller.state$;
  public checked$ = this.state$.pipe(
    map((state) => state.state === SwitchState.ON)
  );
  public name$ = this.state$.pipe(
    map((state) => state.name)
  );

  ngOnInit(): void {
  }

  public updateToggleState(event: MatSlideToggleChange): void {
    this.controller.setSwitchState(event.checked ? SwitchState.ON : SwitchState.OFF);
  }
}
