import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MealSlot } from '../../models/index';

@Component({
  selector: 'app-mini-recipe-card',
  standalone: true,
  imports: [],
  templateUrl: './mini-recipe-card.html',
  styleUrl: './mini-recipe-card.scss',
})
export class MiniRecipeCard {
  @Input() slot!: MealSlot;
  @Output() edit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();
}
