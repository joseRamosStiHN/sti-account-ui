import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkConfigurationListComponent } from './bulk-configuration-list.component';

describe('BulkConfigurationListComponent', () => {
  let component: BulkConfigurationListComponent;
  let fixture: ComponentFixture<BulkConfigurationListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BulkConfigurationListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BulkConfigurationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
