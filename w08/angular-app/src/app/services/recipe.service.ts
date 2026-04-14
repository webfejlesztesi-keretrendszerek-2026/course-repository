
import { Injectable, signal, computed, WritableSignal, Signal } from '@angular/core';
import { Recipe } from '../models/index';
import { collection, getDocs, query, orderBy, onSnapshot, Unsubscribe, QueryDocumentSnapshot, DocumentData, addDoc, updateDoc, doc, getDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.config';
import { ToastService } from './toast.service';

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
      const q = query(collection(db, 'recipes'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const recipes = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
        ...doc.data(),
        id: doc.id
      }) as Recipe);
      this._recipes.set(recipes);
    } catch (err) {
      this._error.set('Nem sikerült betölteni a recepteket. Ellenőrizd az internetkapcsolatot.');
      console.error('Firestore hiba:', err);
    } finally {
      this._loading.set(false);
    }
  }

  /*
  // Real-time listener reference (példa / kikommentezve)
  private unsubscribe?: Unsubscribe;

  loadRecipesRealtime(): void {
    this._loading.set(true);
    const q = query(collection(db, 'recipes'), orderBy('createdAt', 'desc'));
    this.unsubscribe = onSnapshot(q,
      (snapshot) => {
        const recipes = snapshot.docs.map(doc => ({
          ...doc.data(), id: doc.id
        }) as Recipe);
        this._recipes.set(recipes);
        this._loading.set(false);
      },
      (error) => {
        this._error.set('Valós idejű kapcsolat megszakadt.');
        this._loading.set(false);
      }
    );
  }

  // Komponens elhagyásakor hívandó:
  stopRealtimeListener(): void {
    this.unsubscribe?.();
  }
  */

  async addRecipe(recipe: Recipe): Promise<Recipe | null> {
    try {
      // Prepare payload without id — Firestore will generate it
      const { id, createdAt, updatedAt, ...payload } = recipe as any;
      const dataToSave = {
        ...payload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'recipes'), dataToSave);

      // Use the generated id for local state. Use a local timestamp approximation for immediate UI.
      const now = new Date().toISOString();
      const localRecipe: Recipe = {
        ...(payload as Recipe),
        id: docRef.id,
        createdAt: now,
        updatedAt: now,
      } as Recipe;

      // pessimistic update: only update local state after successful Firestore write
      this._recipes.update(list => [...list, localRecipe]);

      // notify success
      this.toast?.success?.('Recept sikeresen mentve!');

      return localRecipe;
    } catch (err) {
      console.error('Firestore addDoc error:', err);
      this.toast?.error?.('Nem sikerült menteni a receptet.');
      return null;
    }
  }

  private cleanObject(obj: any): any {
    if (obj == null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj;
    const out: any = {};
    Object.entries(obj).forEach(([k, v]) => {
      if (v === undefined) return;
      if (v && typeof v === 'object' && !Array.isArray(v)) {
        const cleaned = this.cleanObject(v);
        if (cleaned !== undefined && (typeof cleaned !== 'object' || Object.keys(cleaned).length > 0)) {
          out[k] = cleaned;
        }
      } else {
        out[k] = v;
      }
    });
    return out;
  }

  async updateRecipe(id: string, changes: Partial<Recipe>): Promise<Recipe | null> {
    try {
      // Do not allow overriding id or createdAt
      const { id: _i, createdAt: _ca, ...rest } = changes as any;
      const cleaned = this.cleanObject(rest) || {};

      // Ensure updatedAt is set server-side
      const payload: any = { ...cleaned, updatedAt: serverTimestamp() };

      const ref = doc(db, 'recipes', id);
      await updateDoc(ref, payload);

      // Update local state (pessimistic): only after successful Firestore update
      const now = new Date().toISOString();
      const list = this._recipes();
      const idx = list.findIndex(r => r.id === id);
      if (idx >= 0) {
        const existing = list[idx];
        const merged: Recipe = {
          ...existing,
          ...cleaned,
          updatedAt: now,
        } as Recipe;
        const newList = [...list];
        newList[idx] = merged;
        this._recipes.set(newList);
        this.toast.success('Recept sikeresen frissítve!');
        return merged;
      } else {
        // If not in local cache, fetch from Firestore and add
        const fresh = await this.getRecipeByIdFromFirestore(id);
        if (fresh) {
          this._recipes.update(l => [...l, fresh as Recipe]);
          this.toast.success('Recept sikeresen frissítve!');
          return fresh as Recipe;
        }
        this.toast.error('A recept nem található frissítés után.');
        return null;
      }
    } catch (err) {
      console.error('Firestore updateDoc error:', err);
      this.toast.error('Nem sikerült frissíteni a receptet.');
      return null;
    }
  }

  async getRecipeByIdFromFirestore(id: string): Promise<Recipe | null> {
    try {
      const ref = doc(db, 'recipes', id);
      const snap = await getDoc(ref);
      if (!snap.exists()) return null;
      return { ...(snap.data() as any), id: snap.id } as Recipe;
    } catch (err) {
      console.error('getDoc error:', err);
      return null;
    }
  }

  async checkRecipeUsage(recipeId: string): Promise<string[]> {
    try {
      const snapshot = await getDocs(collection(db, 'weeklyMenus'));
      const weeks: string[] = [];
      snapshot.docs.forEach(d => {
        const data = d.data() as any;
        const slots = data.slots;
        if (Array.isArray(slots) && slots.some((s: any) => s && s.recipeId === recipeId)) {
          if (data.weekStart) weeks.push(data.weekStart);
          else weeks.push(d.id);
        }
      });
      return weeks;
    } catch (err) {
      console.error('checkRecipeUsage error:', err);
      return [];
    }
  }

  async deleteRecipe(id: string): Promise<boolean> {
    try {
      const ref = doc(db, 'recipes', id);
      await deleteDoc(ref);

      // remove from local cache
      this._recipes.update(list => list.filter(r => r.id !== id));

      this.toast.success('Recept sikeresen törölve!');
      return true;
    } catch (err) {
      console.error('Firestore deleteDoc error:', err);
      this.toast.error('Nem sikerült törölni a receptet.');
      return false;
    }
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

  constructor(private toast: ToastService) {
    this.loadRecipes();
  }
}

export default RecipeService;
