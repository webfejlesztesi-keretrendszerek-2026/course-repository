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
    // provide a minimal slot input to satisfy the template
    component.slot = { day: 'hetfo', mealType: 'ebed', recipeId: 'r1', recipeTitle: 'T', recipeImageUrl: '' } as any;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
