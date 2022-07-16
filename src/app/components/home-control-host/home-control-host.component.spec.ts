import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeControlHostComponent } from './home-control-host.component';

describe('HomeControlHostComponent', () => {
  let component: HomeControlHostComponent;
  let fixture: ComponentFixture<HomeControlHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HomeControlHostComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeControlHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
