import { Component, Input } from '@angular/core';
import { NgFor, NgClass, NgIf } from '@angular/common';
import { RecipeDetail } from '../recipe-detail/recipe-detail';
import { Recipe } from '../../models/recipe';

@Component({
  selector: 'app-recipe-list',
  standalone: true,
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
