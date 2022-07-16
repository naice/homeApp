import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { map, take, tap } from 'rxjs/operators';

@Component({
  selector: 'app-button-card-control',
  templateUrl: './button-card-control.component.html',
  styleUrls: ['./button-card-control.component.scss']
})
export class ButtonCardControlComponent {
  @Output() public buttonClick = new EventEmitter<MouseEvent>();
  @Input() public buttonText?: string = undefined;
  @Input() public buttonIcon?: string = undefined;
  @Input() public titleText?: string = undefined;
  @Input() public titleIcon?: string = undefined;
}
