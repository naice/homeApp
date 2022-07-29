import { TestBed } from '@angular/core/testing';

import { InfluxDBService } from './influx-db.service';

describe('InfluxDBService', () => {
  let service: InfluxDBService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InfluxDBService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
