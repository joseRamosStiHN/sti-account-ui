import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BalanceAccountsComponent } from './balance-accounts.component';

describe('BalanceAccountsComponent', () => {
  let component: BalanceAccountsComponent;
  let fixture: ComponentFixture<BalanceAccountsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BalanceAccountsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BalanceAccountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
