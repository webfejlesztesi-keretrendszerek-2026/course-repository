import { Injectable, signal, computed, WritableSignal, Signal } from '@angular/core';
import { Category } from '../models/index';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private _categories: WritableSignal<Category[]> = signal<Category[]>([]);
  readonly categories: Signal<Category[]> = this._categories;

  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly recipeCategories = computed(() => (this._categories() || []).filter(c => c.type === 'recipe'));
  readonly ingredientCategories = computed(() => (this._categories() || []).filter(c => c.type === 'ingredient'));

  async loadCategories(): Promise<void> {
    if (this._loading()) return;
    this._loading.set(true);
    this._error.set(null);
    try {
      const resp = await fetch('/assets/data/categories.json');
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const cats: Category[] = await resp.json();
      this._categories.set(cats);
    } catch (err) {
      this._error.set('Nem sikerült betölteni a kategóriákat.');
      console.error('CategoryService.loadCategories error:', err);
    } finally {
      this._loading.set(false);
    }
  }

  constructor() {
    this.loadCategories();
  }
}

export default CategoryService;
