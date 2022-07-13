import { Component } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, tap } from 'rxjs/operators';
import { AppStore } from './model/app.store';
import { Group } from './model/group';

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
  public selectedGroup = new BehaviorSubject<Group | undefined>(undefined);
  public selectedGroup$ = this.selectedGroup.asObservable();

  constructor(
    protected appStore: AppStore,
  ) { }

  private updateSelectedGroup(groups: Group[]) {
    const currentSelection = this.selectedGroup.getValue();
    if (!currentSelection) {
      this.selectedGroup.next(groups[0]);
      return;
    }
    const updatedSelection = groups.find((item) => item.id === currentSelection.id);
    if (!updatedSelection) {
      this.selectedGroup.next(groups[0]);
      return;
    }
    this.selectedGroup.next(updatedSelection);
  }
}

