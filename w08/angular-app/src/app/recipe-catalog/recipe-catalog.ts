import { Component } from '@angular/core';
import { RecipeList } from './recipe-list/recipe-list';
import { SearchBar } from './search-bar/search-bar';
import { EmptyState } from './empty-state/empty-state';
import { NgIf } from '@angular/common';
import { NgForOf } from '@angular/common';
import { Recipe } from '../models/recipe';
import { RecipeEditor } from './recipe-editor/recipe-editor';
import { SkeletonCard } from './skeleton-card/skeleton-card';
import { RecipeService } from '../services/recipe.service';

const recipeImage = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80';

@Component({
  selector: 'app-recipe-catalog',
  standalone: true,
  imports: [RecipeList, SearchBar, EmptyState, NgIf, NgForOf, RecipeEditor, SkeletonCard],
  templateUrl: './recipe-catalog.html',
  styleUrl: './recipe-catalog.scss',
})
export class RecipeCatalog {
  showEditor = false;
  editingRecipe: Recipe | null = null;

  constructor(public recipeService: RecipeService) {}

  // Cast to `any[]` to avoid template type-checking issues caused by
  // duplicate `LegacyRecipe` symbols between modules during ngtypecheck.
  get recipes(): Recipe[] {
    return this.recipeService.recipes() as Recipe[];
  }

  get filteredRecipes(): Recipe[] {
    return this.recipeService.filteredRecipes() as Recipe[];
  }
  openEditor(recipe?: Recipe) {
    this.editingRecipe = recipe ?? null;
    this.showEditor = true;
  }

  closeEditor() {
    this.showEditor = false;
    this.editingRecipe = null;
  }

  async onEditorSave(recipe: Recipe) {
    if (this.editingRecipe && this.editingRecipe.id) {
      // Edit flow — use pessimistic update
      const updated = await this.recipeService.updateRecipe(this.editingRecipe.id, recipe as Partial<Recipe>);
      if (updated) this.closeEditor();
    } else {
      const added = await this.recipeService.addRecipe(recipe);
      if (added) this.closeEditor();
    }
  }
}
