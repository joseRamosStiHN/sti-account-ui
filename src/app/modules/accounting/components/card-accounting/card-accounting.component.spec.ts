import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardAccountingComponent } from './card-accounting.component';

describe('CardAccountingComponent', () => {
  let component: CardAccountingComponent;
  let fixture: ComponentFixture<CardAccountingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CardAccountingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CardAccountingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
