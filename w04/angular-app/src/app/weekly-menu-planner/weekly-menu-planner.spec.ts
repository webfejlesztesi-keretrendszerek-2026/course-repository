import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeeklyMenuPlanner } from './weekly-menu-planner';

describe('WeeklyMenuPlanner', () => {
  let component: WeeklyMenuPlanner;
  let fixture: ComponentFixture<WeeklyMenuPlanner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeeklyMenuPlanner],
    }).compileComponents();

    fixture = TestBed.createComponent(WeeklyMenuPlanner);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
