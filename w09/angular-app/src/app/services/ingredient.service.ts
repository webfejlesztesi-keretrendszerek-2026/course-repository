import { Injectable, signal, computed, WritableSignal, Signal } from '@angular/core';
import { Ingredient } from '../models/index';

@Injectable({ providedIn: 'root' })
export class IngredientService {
  private _ingredients: WritableSignal<Ingredient[]> = signal<Ingredient[]>([]);
  readonly ingredients: Signal<Ingredient[]> = this._ingredients;

  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  async loadIngredients(): Promise<void> {
    if (this._loading()) return;
    this._loading.set(true);
    this._error.set(null);
    try {
      const resp = await fetch('/assets/data/ingredients.json');
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const items: Ingredient[] = await resp.json();
      this._ingredients.set(items);
    } catch (err) {
      this._error.set('Nem sikerült betölteni a hozzávalókat.');
      console.error('IngredientService.loadIngredients error:', err);
    } finally {
      this._loading.set(false);
    }
  }

  // returns a computed signal filtered by provided term
  searchResults(term: string) {
    return computed(() => {
      const t = (term || '').toLowerCase().trim();
      if (!t) return this._ingredients();
      return (this._ingredients() || []).filter(i => i.name.toLowerCase().includes(t));
    });
  }

  constructor() {
    this.loadIngredients();
  }
}

export default IngredientService;
