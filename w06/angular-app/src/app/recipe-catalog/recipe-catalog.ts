import { Component } from '@angular/core';
import { RecipeList } from './recipe-list/recipe-list';
import { SearchBar } from './search-bar/search-bar';
import { EmptyState } from './empty-state/empty-state';
import { NgIf } from '@angular/common';
import { Recipe } from '../models/recipe';
import { RecipeEditor } from './recipe-editor/recipe-editor';
import { RecipeService } from '../services/recipe.service';

const recipeImage = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80';

@Component({
  selector: 'app-recipe-catalog',
  standalone: true,
  imports: [RecipeList, SearchBar, EmptyState, NgIf, RecipeEditor],
  templateUrl: './recipe-catalog.html',
  styleUrl: './recipe-catalog.scss',
})
export class RecipeCatalog {
  showEditor = false;

  constructor(public recipeService: RecipeService) {}

  get recipes(): Recipe[] {
    return this.recipeService.recipes();
  }
  get filteredRecipes(): Recipe[] {
    return this.recipeService.filteredRecipes();
  }
  openEditor() {
    this.showEditor = true;
  }

  closeEditor() {
    this.showEditor = false;
  }

  addRecipe(recipe: Recipe) {
    this.recipeService.addRecipe(recipe);
    this.closeEditor();
  }
}
