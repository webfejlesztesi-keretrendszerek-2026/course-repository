import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiniRecipeCard } from './mini-recipe-card';

describe('MiniRecipeCard', () => {
  let component: MiniRecipeCard;
  let fixture: ComponentFixture<MiniRecipeCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MiniRecipeCard],
    }).compileComponents();

    fixture = TestBed.createComponent(MiniRecipeCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
