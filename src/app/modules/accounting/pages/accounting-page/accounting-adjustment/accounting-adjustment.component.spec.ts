import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountingAdjustmentComponent } from './accounting-adjustment.component';

describe('AccountingAdjustmentComponent', () => {
  let component: AccountingAdjustmentComponent;
  let fixture: ComponentFixture<AccountingAdjustmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountingAdjustmentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AccountingAdjustmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
