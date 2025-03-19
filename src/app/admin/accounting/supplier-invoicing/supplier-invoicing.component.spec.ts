import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierInvoicingComponent } from './supplier-invoicing.component';

describe('SupplierInvoicingComponent', () => {
  let component: SupplierInvoicingComponent;
  let fixture: ComponentFixture<SupplierInvoicingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplierInvoicingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SupplierInvoicingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
