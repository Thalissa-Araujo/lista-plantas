import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LatestPlantsComponent } from './latest-plants.component';

describe('LatestPlantsComponent', () => {
  let component: LatestPlantsComponent;
  let fixture: ComponentFixture<LatestPlantsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LatestPlantsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LatestPlantsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
