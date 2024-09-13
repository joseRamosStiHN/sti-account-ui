import { TestBed } from '@angular/core/testing';

import { AdjusmentService } from './adjusment.service';

describe('AdjusmentService', () => {
  let service: AdjusmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdjusmentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
