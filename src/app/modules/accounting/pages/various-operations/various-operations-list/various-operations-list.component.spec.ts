import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VariousOperationsListComponent } from './various-operations-list.component';

describe('VariousOperationsListComponent', () => {
  let component: VariousOperationsListComponent;
  let fixture: ComponentFixture<VariousOperationsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VariousOperationsListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VariousOperationsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
