import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeniorAccountantsComponent } from './senior-accountants.component';

describe('SeniorAccountantsComponent', () => {
  let component: SeniorAccountantsComponent;
  let fixture: ComponentFixture<SeniorAccountantsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeniorAccountantsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SeniorAccountantsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
