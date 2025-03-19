import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigurationAccountComponent } from './configuration-account.component';

describe('ConfigurationAccountComponent', () => {
  let component: ConfigurationAccountComponent;
  let fixture: ComponentFixture<ConfigurationAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfigurationAccountComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConfigurationAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
