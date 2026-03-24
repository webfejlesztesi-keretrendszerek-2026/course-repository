import { Injectable, signal, computed, WritableSignal, Signal } from '@angular/core';
import { Recipe } from '../models/recipe';
import { RecipeCategory } from '../models/categories';

const recipeImage = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80';

@Injectable({ providedIn: 'root' })
export class RecipeService {
  private _recipes: WritableSignal<Recipe[]> = signal<Recipe[]>([
    {
      image: recipeImage,
      badges: [RecipeCategory.Soup, RecipeCategory.Own],
      own: true,
      title: 'Tavaszi zöldborsóleves',
      meta: 'Elkészítési idő: 30 perc | Kalória: 320 | Nehézség: Könnyű',
      desc: 'Friss zöldborsóval, répával és petrezselyemmel.'
    },
    {
      image: recipeImage,
      badges: [RecipeCategory.Main],
      title: 'Sült csirkemell zöldségekkel',
      meta: 'Elkészítési idő: 45 perc | Kalória: 410 | Nehézség: Közepes',
      desc: 'Szaftos csirkemell, sült zöldségekkel tálalva.'
    },
    {
      image: recipeImage,
      badges: [RecipeCategory.Dessert],
      title: 'Csokis muffin',
      meta: 'Elkészítési idő: 25 perc | Kalória: 280 | Nehézség: Könnyű',
      desc: 'Puha, csokis muffin recept, tökéletes uzsonnára.'
    },
    {
      image: recipeImage,
      badges: [RecipeCategory.Vegetarian, RecipeCategory.Main],
      title: 'Zöldséges rizottó',
      meta: 'Elkészítési idő: 40 perc | Kalória: 350 | Nehézség: Közepes',
      desc: 'Krémes rizottó sok zöldséggel, vegetáriánusoknak.'
    },
    {
      image: recipeImage,
      badges: [RecipeCategory.Soup],
      title: 'Gulyásleves',
      meta: 'Elkészítési idő: 60 perc | Kalória: 420 | Nehézség: Haladó',
      desc: 'Magyaros gulyásleves, tartalmas és ízletes.'
    }
  ]);

  // expose read-only signal to consumers
  readonly recipes: Signal<Recipe[]> = this._recipes;

  // filter / sort signals
  private _searchTerm: WritableSignal<string> = signal('');
  readonly searchTerm: Signal<string> = this._searchTerm;

  private _selectedCategory: WritableSignal<string | null> = signal(null);
  readonly selectedCategory: Signal<string | null> = this._selectedCategory;

  private _sortBy: WritableSignal<'none' | 'titleAsc' | 'titleDesc'> = signal('none');
  readonly sortBy: Signal<'none' | 'titleAsc' | 'titleDesc'> = this._sortBy;

  // computed filtered recipes based on search/category/sort
  readonly filteredRecipes = computed(() => {
    const term = (this._searchTerm() || '').toLowerCase().trim();
    const category = this._selectedCategory();
    const sort = this._sortBy();

    let list = this._recipes();

    if (term) {
      list = list.filter(r => {
        return (
          (r.title || '').toLowerCase().includes(term) ||
          (r.desc || '').toLowerCase().includes(term)
        );
      });
    }

    if (category) {
      list = list.filter(r => (r.badges || []).some(b => b.toLowerCase() === category.toLowerCase()));
    }

    if (sort === 'titleAsc') {
      list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort === 'titleDesc') {
      list = [...list].sort((a, b) => b.title.localeCompare(a.title));
    }

    return list;
  });

  readonly resultCount = computed(() => this.filteredRecipes().length);

  addRecipe(recipe: Recipe) {
    this._recipes.update(list => [...list, recipe]);
  }

  deleteRecipe(title: string) {
    this._recipes.update(list => list.filter(r => r.title !== title));
  }

  getRecipeByTitle(title: string): Recipe | undefined {
    return this._recipes().find(r => r.title === title);
  }

  // filter / sort setters
  setSearchTerm(term: string) {
    this._searchTerm.set(term);
  }

  setCategory(category: string | null) {
    this._selectedCategory.set(category);
  }

  setSortBy(sort: 'none' | 'titleAsc' | 'titleDesc') {
    this._sortBy.set(sort);
  }

  clearFilters() {
    this._searchTerm.set('');
    this._selectedCategory.set(null);
    this._sortBy.set('none');
  }
}

export default RecipeService;
