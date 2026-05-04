import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecipeService } from '../../services/recipe.service';
import { ALL_CATEGORIES, CATEGORY_ID_MAP } from '../../models/categories';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.scss',
})
export class SearchBar implements OnDestroy {
  inputValue = '';
  private debounceTimer: any = null;

  // available chips derived from central categories
  chips = ALL_CATEGORIES;

  constructor(public recipeService: RecipeService) {
    // initialize input from service
    this.inputValue = this.recipeService.searchTerm();
  }

  onInputChange() {
    // debounce updates to service searchTerm
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.debounceTimer = setTimeout(() => {
      this.recipeService.setSearchTerm(this.inputValue || '');
      this.debounceTimer = null;
    }, 300);
  }

  clearSearch() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    this.inputValue = '';
    this.recipeService.setSearchTerm('');
  }

  toggleChip(category: string) {
    const id = CATEGORY_ID_MAP[category] || null;
    const current = this.recipeService.selectedCategory();
    if (current && id && current === id) {
      this.recipeService.setCategory(null);
    } else {
      this.recipeService.setCategory(id);
    }
  }

  isChipActive(category: string) {
    const id = CATEGORY_ID_MAP[category] || null;
    const current = this.recipeService.selectedCategory();
    return !!current && id !== null && current === id;
  }

  setSort(event: Event) {
    const val = (event.target as HTMLSelectElement).value;
    if (val === 'titleAsc') this.recipeService.setSortBy('titleAsc');
    else if (val === 'titleDesc') this.recipeService.setSortBy('titleDesc');
    else this.recipeService.setSortBy('none');
  }

  clearAll() {
    this.inputValue = '';
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    this.recipeService.clearFilters();
  }

  ngOnDestroy(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
  }
}
