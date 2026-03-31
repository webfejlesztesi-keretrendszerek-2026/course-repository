import { Injectable, signal, computed, WritableSignal, Signal } from '@angular/core';
import { Recipe, RecipeIngredient } from '../models/index';

const recipeImage = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80';

@Injectable({ providedIn: 'root' })
export class RecipeService {
  private _recipes: WritableSignal<Recipe[]> = signal<Recipe[]>([
    {
      id: 'recipe_1',
      title: 'Tavaszi zöldborsóleves',
      description: 'Friss zöldborsóval, répával és petrezselyemmel.',
      imageUrl: recipeImage,
      categoryId: 'cat_leves',
      difficulty: 'könnyű',
      prepTime: 30,
      calories: 320,
      servings: 4,
      diet: ['vegetáriánus'],
      nutrition: { protein: 10, carbs: 30, fat: 8 },
      ingredients: [
        { ingredientId: 'ing_001', ingredientName: 'zöldborsó', amount: 300, unit: 'g' },
        { ingredientId: 'ing_002', ingredientName: 'répa', amount: 100, unit: 'g' },
        { ingredientId: 'ing_003', ingredientName: 'petrezselyem', amount: 10, unit: 'g' }
      ],
      steps: [
        'Héjatlan zöldborsót tisztítsd meg.',
        'Pirítsd meg a répát, add hozzá a zöldborsót és vizet.',
        'Főzd puhára, fűszerezd, és tálalás előtt szórd meg petrezselyemmel.'
      ],
      ownerId: 'user_demo',
      isPublic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'recipe_2',
      title: 'Sült csirkemell zöldségekkel',
      description: 'Szaftos csirkemell, sült zöldségekkel tálalva.',
      imageUrl: recipeImage,
      categoryId: 'cat_foetel',
      difficulty: 'közepes',
      prepTime: 45,
      calories: 410,
      servings: 4,
      diet: [],
      nutrition: { protein: 35, carbs: 20, fat: 18 },
      ingredients: [
        { ingredientId: 'ing_004', ingredientName: 'csirkemell', amount: 600, unit: 'g' },
        { ingredientId: 'ing_005', ingredientName: 'cukorborsó', amount: 150, unit: 'g' },
        { ingredientId: 'ing_006', ingredientName: 'sárgarépa', amount: 100, unit: 'g' }
      ],
      steps: [
        'Fűszerezd a csirkemellet és süsd meg serpenyőben.',
        'Süsd meg a zöldségeket sütőben olívaolajjal.',
        'Tálald a csirkét a sült zöldségekkel.'
      ],
      ownerId: 'user_demo',
      isPublic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'recipe_3',
      title: 'Csokis muffin',
      description: 'Puha, csokis muffin recept, tökéletes uzsonnára.',
      imageUrl: recipeImage,
      categoryId: 'cat_desszert',
      difficulty: 'könnyű',
      prepTime: 25,
      calories: 280,
      servings: 4,
      diet: [],
      nutrition: { protein: 5, carbs: 40, fat: 12 },
      ingredients: [
        { ingredientId: 'ing_007', ingredientName: 'liszt', amount: 200, unit: 'g' },
        { ingredientId: 'ing_008', ingredientName: 'cukor', amount: 150, unit: 'g' },
        { ingredientId: 'ing_009', ingredientName: 'csokoládé', amount: 100, unit: 'g' }
      ],
      steps: [
        'Keverd össze a száraz hozzávalókat.',
        'Add hozzá a nedves hozzávalókat, majd süsd muffinformában 20 percig.',
        'Hűtsd ki és tálald.'
      ],
      ownerId: 'user_demo',
      isPublic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'recipe_4',
      title: 'Zöldséges rizottó',
      description: 'Krémes rizottó sok zöldséggel, vegetáriánusoknak.',
      imageUrl: recipeImage,
      categoryId: 'cat_foetel',
      difficulty: 'közepes',
      prepTime: 40,
      calories: 350,
      servings: 4,
      diet: ['vegetáriánus'],
      nutrition: { protein: 8, carbs: 55, fat: 10 },
      ingredients: [
        { ingredientId: 'ing_010', ingredientName: 'rizs', amount: 300, unit: 'g' },
        { ingredientId: 'ing_011', ingredientName: 'cukkíni', amount: 150, unit: 'g' },
        { ingredientId: 'ing_012', ingredientName: 'parmezán', amount: 50, unit: 'g' }
      ],
      steps: [
        'Pirítsd a rizst olívaolajon, majd fokozatosan adagold hozzá a levest.',
        'Add hozzá a zöldségeket és főzd krémesre.',
        'Tálaláskor szórd meg parmezánnal.'
      ],
      ownerId: 'user_demo',
      isPublic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'recipe_5',
      title: 'Gulyásleves',
      description: 'Magyaros gulyásleves, tartalmas és ízletes.',
      imageUrl: recipeImage,
      categoryId: 'cat_leves',
      difficulty: 'haladó',
      prepTime: 60,
      calories: 420,
      servings: 4,
      diet: [],
      nutrition: { protein: 30, carbs: 35, fat: 20 },
      ingredients: [
        { ingredientId: 'ing_013', ingredientName: 'marhahús', amount: 500, unit: 'g' },
        { ingredientId: 'ing_014', ingredientName: 'burgonya', amount: 300, unit: 'g' },
        { ingredientId: 'ing_015', ingredientName: 'sárgarépa', amount: 100, unit: 'g' }
      ],
      steps: [
        'Pirítsd meg a húst és az alapanyagokat.',
        'Főzd lassú tűzön amíg minden megpuhul.',
        'Ízesítsd pirospaprikával és köménnyel.'
      ],
      ownerId: 'user_demo',
      isPublic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]);

  // expose read-only signal to consumers
  readonly recipes: Signal<Recipe[]> = this._recipes;

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
}

export default RecipeService;
