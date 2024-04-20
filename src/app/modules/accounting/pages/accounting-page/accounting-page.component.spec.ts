import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountingPageComponent } from './accounting-page.component';

describe('AccountingPageComponent', () => {
  let component: AccountingPageComponent;
  let fixture: ComponentFixture<AccountingPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AccountingPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AccountingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
