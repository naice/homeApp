import { TestBed } from '@angular/core/testing';

import { RegisterMeService } from './register-me.service';

describe('RegisterMeService', () => {
  let service: RegisterMeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RegisterMeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
