import { Component } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, tap } from 'rxjs/operators';
import { AppStore } from './model/app.store';
import { HomeControlConfig } from './model/home-control-store';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [
    AppStore,
  ]
})
export class AppComponent {
  title = 'homeApp';

  public groups$ = this.appStore.groups$.pipe(
    distinctUntilChanged(),
    tap((groups) => this.updateSelectedGroup(groups))
  );
  public selectedHomeControlConfig = new BehaviorSubject<HomeControlConfig | undefined>(undefined);
  public selectedHomeControlConfig$ = this.selectedHomeControlConfig.asObservable();

  constructor(
    protected appStore: AppStore,
  ) { }

  private updateSelectedGroup(groups: HomeControlConfig[]) {
    const currentSelection = this.selectedHomeControlConfig.getValue();
    if (!currentSelection) {
      this.selectedHomeControlConfig.next(groups[0]);
      return;
    }
    const updatedSelection = groups.find((item) => item.id === currentSelection.id);
    if (!updatedSelection) {
      this.selectedHomeControlConfig.next(groups[0]);
      return;
    }
    this.selectedHomeControlConfig.next(updatedSelection);
  }
}

