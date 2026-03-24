import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListSection } from './list-section';

describe('ListSection', () => {
  let component: ListSection;
  let fixture: ComponentFixture<ListSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListSection],
    }).compileComponents();

    fixture = TestBed.createComponent(ListSection);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
