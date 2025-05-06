import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VariousOperationsComponent } from './various-operations.component';

describe('VariousOperationsComponent', () => {
  let component: VariousOperationsComponent;
  let fixture: ComponentFixture<VariousOperationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VariousOperationsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VariousOperationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
