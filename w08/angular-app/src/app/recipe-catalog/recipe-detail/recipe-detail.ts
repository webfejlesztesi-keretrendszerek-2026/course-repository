import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgIf, CommonModule } from '@angular/common';
import { Recipe } from '../../models/index';
import { RecipeService } from '../../services/recipe.service';

@Component({
  selector: 'app-recipe-detail',
  standalone: true,
  imports: [CommonModule, NgIf],
  templateUrl: './recipe-detail.html',
  styleUrl: './recipe-detail.scss',
})
export class RecipeDetail {
  @Input() recipe!: Recipe;
  @Output() close = new EventEmitter<void>();
  @Output() edit = new EventEmitter<Recipe>();
  constructor(private recipeService: RecipeService) {}

  async confirmDelete() {
    if (!this.recipe || !this.recipe.id) return;

    const usages = await this.recipeService.checkRecipeUsage(this.recipe.id);
    let msg = 'Biztosan törlöd a receptet?';
    if (usages.length) {
      msg = `Ez a recept ${usages.length} heti menüben szerepel (hetek: ${usages.join(', ')}). Biztosan törlöd?`;
    }

    if (window.confirm(msg)) {
      const ok = await this.recipeService.deleteRecipe(this.recipe.id);
      if (ok) this.close.emit();
    }
  }

  onEdit() {
    if (this.recipe) this.edit.emit(this.recipe);
  }
}
