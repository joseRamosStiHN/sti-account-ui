import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountingDashboardComponent } from './accounting-dashboard.component';

describe('AccountingDashboardComponent', () => {
  let component: AccountingDashboardComponent;
  let fixture: ComponentFixture<AccountingDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountingDashboardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AccountingDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
