import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralBalanceComponent } from './GeneralBalanceComponent';

describe('GeneralBalanceComponent', () => {
  let component: GeneralBalanceComponent;
  let fixture: ComponentFixture<GeneralBalanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GeneralBalanceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GeneralBalanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
