
import { Injectable, signal, computed, WritableSignal, Signal } from '@angular/core';
import { Recipe } from '../models/index';

@Injectable({ providedIn: 'root' })
export class RecipeService {
  private _recipes: WritableSignal<Recipe[]> = signal<Recipe[]>([]);
  readonly recipes: Signal<Recipe[]> = this._recipes;

  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  // filter / sort signals
  private _searchTerm: WritableSignal<string> = signal('');
  readonly searchTerm: Signal<string> = this._searchTerm;

  private _selectedCategory: WritableSignal<string | null> = signal(null); // categoryId
  readonly selectedCategory: Signal<string | null> = this._selectedCategory;

  private _selectedDifficulty: WritableSignal<string | null> = signal(null); // 'könnyű'|'közepes'|'haladó'
  readonly selectedDifficulty: Signal<string | null> = this._selectedDifficulty;

  private _maxPrepTime: WritableSignal<number | null> = signal(null);
  readonly maxPrepTime: Signal<number | null> = this._maxPrepTime;

  private _sortBy: WritableSignal<'none' | 'titleAsc' | 'titleDesc' | 'prepTimeAsc' | 'caloriesAsc' | 'newest'> = signal('none');
  readonly sortBy: Signal<'none' | 'titleAsc' | 'titleDesc' | 'prepTimeAsc' | 'caloriesAsc' | 'newest'> = this._sortBy;

  // computed filtered recipes based on search/category/difficulty/maxPrepTime/sort
  readonly filteredRecipes = computed(() => {
    const term = (this._searchTerm() || '').toLowerCase().trim();
    const categoryId = this._selectedCategory();
    const difficulty = this._selectedDifficulty();
    const maxPrep = this._maxPrepTime();
    const sort = this._sortBy();

    let list = this._recipes();

    if (term) {
      list = list.filter(r => {
        return (
          (r.title || '').toLowerCase().includes(term) ||
          (r.description || '').toLowerCase().includes(term)
        );
      });
    }

    if (categoryId) {
      list = list.filter(r => r.categoryId === categoryId);
    }

    if (difficulty) {
      list = list.filter(r => r.difficulty === difficulty);
    }

    if (typeof maxPrep === 'number') {
      list = list.filter(r => typeof r.prepTime === 'number' && r.prepTime <= maxPrep);
    }

    // sorting
    if (sort === 'titleAsc') {
      list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort === 'titleDesc') {
      list = [...list].sort((a, b) => b.title.localeCompare(a.title));
    } else if (sort === 'prepTimeAsc') {
      list = [...list].sort((a, b) => (a.prepTime || 0) - (b.prepTime || 0));
    } else if (sort === 'caloriesAsc') {
      list = [...list].sort((a, b) => (a.calories || 0) - (b.calories || 0));
    } else if (sort === 'newest') {
      list = [...list].sort((a, b) => (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }

    return list;
  });

  readonly resultCount = computed(() => this.filteredRecipes().length);
  async loadRecipes(): Promise<void> {
    if (this._loading()) return;
    this._loading.set(true);
    this._error.set(null);
    try {
      const response = await fetch('/assets/data/recipes.json');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const recipes: Recipe[] = await response.json();
      this._recipes.set(recipes);
    } catch (err) {
      this._error.set('Nem sikerült betölteni a recepteket. Próbáld újra később.');
      console.error('RecipeService.loadRecipes error:', err);
    } finally {
      this._loading.set(false);
    }
  }

  addRecipe(recipe: Recipe) {
    this._recipes.update(list => [...list, recipe]);
  }

  deleteRecipe(id: string) {
    this._recipes.update(list => list.filter(r => r.id !== id));
  }

  getRecipeById(id: string): Recipe | undefined {
    return this._recipes().find(r => r.id === id);
  }

  // filter / sort setters
  setSearchTerm(term: string) {
    this._searchTerm.set(term);
  }

  setCategory(categoryId: string | null) {
    this._selectedCategory.set(categoryId);
  }

  setDifficulty(diff: string | null) {
    this._selectedDifficulty.set(diff);
  }

  setMaxPrepTime(minutes: number | null) {
    this._maxPrepTime.set(minutes);
  }

  setSortBy(sort: 'none' | 'titleAsc' | 'titleDesc' | 'prepTimeAsc' | 'caloriesAsc' | 'newest') {
    this._sortBy.set(sort);
  }

  clearFilters() {
    this._searchTerm.set('');
    this._selectedCategory.set(null);
    this._selectedDifficulty.set(null);
    this._maxPrepTime.set(null);
    this._sortBy.set('none');
  }

  constructor() {
    this.loadRecipes();
  }
}

export default RecipeService;
