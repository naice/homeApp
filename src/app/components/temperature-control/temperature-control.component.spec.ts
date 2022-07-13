import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemperatureControlComponent } from './temperature-control.component';

describe('TemperatureControlComponent', () => {
  let component: TemperatureControlComponent;
  let fixture: ComponentFixture<TemperatureControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TemperatureControlComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TemperatureControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
