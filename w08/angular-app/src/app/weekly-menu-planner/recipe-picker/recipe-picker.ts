import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecipeService } from '../../services/recipe.service';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-recipe-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recipe-picker.html',
  styleUrls: ['./recipe-picker.scss'],
})
export class RecipePicker {
  searchTerm: string = '';


  constructor(public recipeService: RecipeService, private dialogRef: MatDialogRef<RecipePicker>) {}

  displayed() {
    const term = (this.searchTerm || '').toLowerCase().trim();
    return [...this.recipeService.recipes()]
      .filter(r => !term || (r.title || '').toLowerCase().includes(term) || (r.description || '').toLowerCase().includes(term))
      .sort((a, b) => (a.title || '').localeCompare(b.title));
  }

  setSearch(value: string) {
    this.searchTerm = value;
  }

  select(recipe: any) {
    this.dialogRef.close(recipe);
  }

  close() {
    this.dialogRef.close(null);
  }
}
