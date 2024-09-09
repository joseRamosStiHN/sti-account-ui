import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JournalItemsComponent } from './journal-items.component';

describe('JournalItemsComponent', () => {
  let component: JournalItemsComponent;
  let fixture: ComponentFixture<JournalItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [JournalItemsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(JournalItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
