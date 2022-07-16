import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { map } from 'rxjs/operators';
import { HomeControlConfig, HomeControlStore } from 'src/app/model/home-control-store';

@Component({
  selector: 'app-home-control-host',
  templateUrl: './home-control-host.component.html',
  styleUrls: ['./home-control-host.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    HomeControlStore
  ]
})
export class HomeControlHostComponent {
  @Input()
  public set homeControlConfig(group: HomeControlConfig | null | undefined) {
    if (!group) {
      return;
    }
    this.homeControlStore.setState(() => group);
  }

  constructor(
    protected homeControlStore: HomeControlStore,
  ) { }

  public name$ = this.homeControlStore.state$.pipe(map((group) => group.name));

  public icon$ = this.homeControlStore.select((state) => state.icon);

  public outletInfo$ = this.homeControlStore.outletInfo$;

}
