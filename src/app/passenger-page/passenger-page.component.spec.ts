import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PassengerPageComponent } from './passenger-page.component';

describe('PassengerPageComponent', () => {
  let component: PassengerPageComponent;
  let fixture: ComponentFixture<PassengerPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PassengerPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PassengerPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
