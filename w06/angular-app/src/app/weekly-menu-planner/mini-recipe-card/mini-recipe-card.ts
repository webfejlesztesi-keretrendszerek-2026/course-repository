import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Recipe } from '../weekly-menu-planner';

@Component({
  selector: 'app-mini-recipe-card',
  standalone: true,
  imports: [],
  templateUrl: './mini-recipe-card.html',
  styleUrl: './mini-recipe-card.scss',
})
export class MiniRecipeCard {
  @Input() recipe!: Recipe;
  @Output() edit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();
}
