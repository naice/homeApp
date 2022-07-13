import { Component, OnInit } from '@angular/core';
import { map, take, tap } from 'rxjs/operators';
import { ButtonController } from 'src/app/model/button-controller';
import { ActionHandler } from 'src/app/model/group';

@Component({
  selector: 'app-button-control',
  templateUrl: './button-control.component.html',
  styleUrls: ['./button-control.component.scss']
})
export class ButtonControlComponent implements OnInit {

  constructor(
    protected controller: ButtonController,
    protected actionHandler: ActionHandler,
  ) { }

  public state$ = this.controller.state$;
  public name$ = this.state$.pipe(
    map((state) => state.name)
  );
  public icon$ = this.state$.pipe(
    map((state) => state.icon)
  );

  ngOnInit(): void {
  }

  public buttonClicked(): void {
    this.actionHandler.action();
  }

}
