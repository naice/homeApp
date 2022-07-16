import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonCardControlComponent } from './button-card-control.component';

describe('ButtonControlComponent', () => {
  let component: ButtonCardControlComponent;
  let fixture: ComponentFixture<ButtonCardControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ButtonCardControlComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ButtonCardControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
