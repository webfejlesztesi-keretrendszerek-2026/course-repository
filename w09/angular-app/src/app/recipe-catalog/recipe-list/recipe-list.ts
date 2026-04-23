import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgFor, NgClass, NgIf } from '@angular/common';
import { RecipeDetail } from '../recipe-detail/recipe-detail';
import { Recipe } from '../../models/index';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-recipe-list',
  standalone: true,
  imports: [NgFor, NgClass, NgIf, RecipeDetail],
  templateUrl: './recipe-list.html',
  styleUrl: './recipe-list.scss',
})
export class RecipeList {
  @Input() recipes: Recipe[] = [];
  @Output() edit = new EventEmitter<Recipe>();

  selectedRecipe: Recipe | null = null;

  constructor(public auth: AuthService) {}

  openRecipe(recipe: Recipe) {
    this.selectedRecipe = recipe;
  }

  closeRecipe() {
    this.selectedRecipe = null;
  }

  handleDetailEdit(recipe: Recipe) {
    this.edit.emit(recipe);
    this.closeRecipe();
  }
}
