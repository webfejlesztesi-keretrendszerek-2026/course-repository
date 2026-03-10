import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgIf, CommonModule } from '@angular/common';
import { Recipe } from '../recipe-list/recipe-list';

@Component({
  selector: 'app-recipe-detail',
  imports: [CommonModule, NgIf],
  templateUrl: './recipe-detail.html',
  styleUrl: './recipe-detail.scss',
})
export class RecipeDetail {
  @Input() recipe!: Recipe;
  @Output() close = new EventEmitter<void>();
}
