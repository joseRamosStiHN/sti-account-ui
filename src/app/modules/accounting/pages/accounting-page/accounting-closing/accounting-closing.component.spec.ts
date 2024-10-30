import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountingClosingComponent } from './accounting-closing.component';

describe('AccountingClosingComponent', () => {
  let component: AccountingClosingComponent;
  let fixture: ComponentFixture<AccountingClosingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountingClosingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AccountingClosingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
