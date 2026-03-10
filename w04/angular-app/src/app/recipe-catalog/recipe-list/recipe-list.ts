import { Component, Input } from '@angular/core';
import { NgFor, NgClass, NgIf } from '@angular/common';
import { RecipeDetail } from '../recipe-detail/recipe-detail';

export interface Recipe {
  image: string;
  badges: string[];
  own?: boolean;
  title: string;
  meta: string;
  desc: string;
}

@Component({
  selector: 'app-recipe-list',
  imports: [NgFor, NgClass, NgIf, RecipeDetail],
  templateUrl: './recipe-list.html',
  styleUrl: './recipe-list.scss',
})
export class RecipeList {
  @Input() recipes: Recipe[] = [];

  selectedRecipe: Recipe | null = null;

  openRecipe(recipe: Recipe) {
    this.selectedRecipe = recipe;
  }

  closeRecipe() {
    this.selectedRecipe = null;
  }
}
