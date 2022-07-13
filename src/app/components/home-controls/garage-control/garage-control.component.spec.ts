import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GarageControlComponent } from './garage-control.component';

describe('GarageControlComponent', () => {
  let component: GarageControlComponent;
  let fixture: ComponentFixture<GarageControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GarageControlComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GarageControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
