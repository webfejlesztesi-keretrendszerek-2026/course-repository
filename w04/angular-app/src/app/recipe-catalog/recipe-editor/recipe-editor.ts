import { Component, Output, EventEmitter } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Recipe } from '../recipe-list/recipe-list';

@Component({
  selector: 'app-recipe-editor',
  imports: [NgIf, FormsModule],
  templateUrl: './recipe-editor.html',
  styleUrl: './recipe-editor.scss',
})
export class RecipeEditor {
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Recipe>();

  recipe: Partial<Recipe> = {
    image: '',
    badges: [],
    title: '',
    meta: '',
    desc: ''
  };

  badgesString = '';

  saveRecipe() {
    this.recipe.badges = this.badgesString
      .split(',')
      .map(b => b.trim())
      .filter(b => !!b);
    this.save.emit(this.recipe as Recipe);
  }
}
