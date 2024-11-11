import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxSettingsListComponent } from './tax-settings-list.component';

describe('TaxSettingsListComponent', () => {
  let component: TaxSettingsListComponent;
  let fixture: ComponentFixture<TaxSettingsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaxSettingsListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TaxSettingsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
