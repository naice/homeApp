import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { Group, GroupStore } from 'src/app/model/group';

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    GroupStore
  ]
})
export class GroupComponent {

  @Input()
  public set group(group: Group | null | undefined) {
    if (!group) {
      return;
    }
    this.groupStore.setState(() => group);
  }

  constructor(
    protected groupStore: GroupStore,
  ) { }

  public name$ = this.groupStore.state$.pipe(map((group) => group.name));

  public outletInfo$ = this.groupStore.outletInfo$;

}
