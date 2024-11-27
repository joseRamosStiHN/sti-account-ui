import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkConfigurationComponent } from './bulk-configuration.component';

describe('BulkConfigurationComponent', () => {
  let component: BulkConfigurationComponent;
  let fixture: ComponentFixture<BulkConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BulkConfigurationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BulkConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
