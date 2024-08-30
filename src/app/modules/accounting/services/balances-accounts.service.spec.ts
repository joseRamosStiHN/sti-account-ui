import { TestBed } from '@angular/core/testing';

import { BalancesAccountsService } from './balances-accounts.service';

describe('BalancesAccountsService', () => {
  let service: BalancesAccountsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BalancesAccountsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
