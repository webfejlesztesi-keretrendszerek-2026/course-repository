import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuCalendar } from './menu-calendar';

describe('MenuCalendar', () => {
  let component: MenuCalendar;
  let fixture: ComponentFixture<MenuCalendar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuCalendar],
    }).compileComponents();

    fixture = TestBed.createComponent(MenuCalendar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
