import { Injectable, signal } from '@angular/core';
import { WeeklyMenu, MealSlot, Day, MealType } from '../models/weekly-menu';
import { Recipe } from '../models/recipe';
import { RecipeService } from './recipe.service';
import { ToastService } from './toast.service';
import { db } from '../firebase.config';
import { collection, addDoc, updateDoc, doc, serverTimestamp, getDocs, query, where } from 'firebase/firestore';

@Injectable({ providedIn: 'root' })
export class WeeklyMenuService {
  private _menu = signal<WeeklyMenu | null>(null);
  readonly menu = this._menu.asReadonly();

  private _loading = signal(false);
  readonly loading = this._loading.asReadonly();

  private _error = signal<string | null>(null);
  readonly error = this._error.asReadonly();

  private _saveStatus = signal<'saved' | 'saving' | 'error'>('saved');
  readonly saveStatus = this._saveStatus.asReadonly();

  private _lastSaved = signal<string | null>(null);
  readonly lastSaved = this._lastSaved.asReadonly();

  private _saveTimer?: ReturnType<typeof setTimeout>;
  private _pendingRollbackState: WeeklyMenu | null = null;

  constructor(private recipeService: RecipeService, private toast: ToastService) {}

  /**
   * Load weekly menu. If `weekStart` is provided, attempt to find a menu for that week.
   * Accepts either a single JSON object or an array of menus in the payload.
   */
  async loadWeeklyMenu(path = '/assets/data/weekly-menu.json', weekStart?: string) {
    this._loading.set(true);
    this._error.set(null);
    try {
      // If a weekStart is provided, prefer loading the menu from Firestore so
      // newly created/updated menus are visible immediately. Fall back to the
      // bundled JSON asset when no Firestore document is found or on error.
      if (weekStart) {
        try {
          const q = query(collection(db, 'weekly-menu'), where('weekStart', '==', weekStart));
          const snap = await getDocs(q);
          if (!snap.empty) {
            const docSnap = snap.docs[0];
            const m: any = docSnap.data();
            const createdAt = m.createdAt && typeof (m.createdAt as any)?.toDate === 'function' ? (m.createdAt as any).toDate().toISOString() : (m.createdAt || new Date().toISOString());
            const updatedAt = m.updatedAt && typeof (m.updatedAt as any)?.toDate === 'function' ? (m.updatedAt as any).toDate().toISOString() : (m.updatedAt || new Date().toISOString());
            const menuFromFs: WeeklyMenu = {
              id: docSnap.id,
              userId: m.userId || m.ownerId || 'unknown',
              weekStart: m.weekStart || weekStart,
              slots: (m.slots || []).map((s: any) => this.normalizeSlot(s, m.weekStart || weekStart)),
              createdAt,
              updatedAt,
            } as WeeklyMenu;
            this._menu.set(menuFromFs);
            return;
          }
        } catch (ferr) {
          console.error('Firestore weekly-menu query failed, falling back to asset load:', ferr);
          // continue to fallback to asset-based loading
        }
      }
      const res = await fetch(path);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const payload = await res.json();

      const pickMenu = (m: any) => ({
        id: m.id,
        userId: m.ownerId || m.userId || 'unknown',
        weekStart: m.weekStart,
        slots: (m.slots || []).map((s: any) => this.normalizeSlot(s, m.weekStart)),
        createdAt: m.createdAt || new Date().toISOString(),
        updatedAt: m.updatedAt || new Date().toISOString(),
      } as WeeklyMenu);

      let menu: WeeklyMenu | null = null;
      if (Array.isArray(payload)) {
        if (weekStart) {
          const match = payload.find((m: any) => (m.weekStart || '').toString().slice(0,10) === weekStart.slice(0,10));
          if (match) {
            menu = pickMenu(match);
          } else {
            // explicit: no matching week found in array -> leave menu as null so we can return empty
            menu = null;
          }
        } else {
          if (payload.length > 0) menu = pickMenu(payload[0]);
        }
      } else if (payload && typeof payload === 'object') {
        if (!weekStart || (payload.weekStart || '').toString().slice(0,10) === (weekStart || '').slice(0,10)) {
          menu = pickMenu(payload);
        }
      }

      // If caller requested a specific week but no menu was found, return an empty WeeklyMenu (slots=[])
      if (!menu && weekStart) {
        const empty: WeeklyMenu = {
          id: `menu_empty_${weekStart}`,
          userId: 'unknown',
          weekStart: weekStart,
          slots: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        this._menu.set(empty);
      } else {
        this._menu.set(menu);
      }
    } catch (err: any) {
      this._error.set(err?.message || String(err));
      this._menu.set(null);
    } finally {
      this._loading.set(false);
    }
  }

  /** Compute the ISO date string for Monday of the given date and load that week's menu */
  loadForWeek(date: Date) {
    const d = new Date(date);
    const day = d.getDay();
    const monday = new Date(d);
    monday.setDate(d.getDate() - ((day + 6) % 7));
    const iso = this._toLocalDateKey(monday);
    return this.loadWeeklyMenu('/assets/data/weekly-menu.json', iso);
  }

  private _toLocalDateKey(d: Date): string {
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const day = d.getDate();
    return `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  updateSlot(day: Day, mealType: MealType, recipe: Recipe) {
    const menu = this._menu();
    if (!menu) return;
    // preserve previous state for rollback (only the first change of a debounced batch)
    if (!this._pendingRollbackState) this._pendingRollbackState = JSON.parse(JSON.stringify(menu));
    const slot: MealSlot = {
      day,
      mealType,
      recipeId: recipe.id,
      recipeTitle: recipe.title,
      recipeImageUrl: (recipe.imageUrl || recipe.image) || null,
      recipePrepTime: typeof recipe.prepTime === 'number' ? recipe.prepTime : null,
      recipeCalories: typeof recipe.calories === 'number' ? recipe.calories : null,
    } as MealSlot;

    const existingIndex = menu.slots.findIndex(s => s.day === day && s.mealType === mealType);
    const newSlots = [...menu.slots];
    if (existingIndex >= 0) {
      newSlots[existingIndex] = slot;
    } else {
      newSlots.push(slot);
    }

    this._menu.set({ ...menu, slots: newSlots, updatedAt: new Date().toISOString() });
    this._scheduleSave();
  }

  removeSlot(day: Day, mealType: MealType) {
    const menu = this._menu();
    if (!menu) return;
    if (!this._pendingRollbackState) this._pendingRollbackState = JSON.parse(JSON.stringify(menu));
    const newSlots = menu.slots.filter(s => !(s.day === day && s.mealType === mealType));
    this._menu.set({ ...menu, slots: newSlots, updatedAt: new Date().toISOString() });
    this._scheduleSave();
  }

  private _scheduleSave() {
    // debounce saves to avoid excessive writes
    if (this._saveTimer) clearTimeout(this._saveTimer);
    this._saveTimer = setTimeout(() => {
      const menuSnapshot = JSON.parse(JSON.stringify(this._menu()));
      void this._performSave(menuSnapshot);
      this._saveTimer = undefined;
    }, 1000);
  }

  private async _performSave(menuSnapshot: WeeklyMenu | null) {
    if (!menuSnapshot) return;
    this._saveStatus.set('saving');
    try {
      const resultId = await this._saveToFirestore(menuSnapshot);
      if (resultId && menuSnapshot.id && menuSnapshot.id.startsWith('menu_empty_')) {
        const current = this._menu();
        if (current && current.id === menuSnapshot.id) {
          this._menu.set({ ...current, id: resultId });
        }
      }
      this._saveStatus.set('saved');
      this._lastSaved.set(new Date().toISOString());
      this._pendingRollbackState = null;
    } catch (err) {
      console.error('WeeklyMenu save error:', err);
      this._saveStatus.set('error');
      this.toast.error('Nem sikerült menteni a heti menüt. Visszaállítom az előző állapotot.');
      if (this._pendingRollbackState) {
        this._menu.set(this._pendingRollbackState);
        this._pendingRollbackState = null;
      }
    }
  }

  private async _saveToFirestore(menu: WeeklyMenu): Promise<string | null> {
    if (menu.id && !menu.id.startsWith('menu_empty_')) {
      const ref = doc(db, 'weekly-menu', menu.id);
      await updateDoc(ref, { slots: menu.slots, updatedAt: serverTimestamp() });
      return menu.id;
    }

    const payload: any = {
      userId: menu.userId,
      weekStart: menu.weekStart,
      slots: menu.slots,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const col = collection(db, 'weekly-menu');
    const docRef = await addDoc(col, payload);
    return docRef.id;
  }

  private normalizeSlot(raw: any, weekStartIso: string): MealSlot {
    // If day is already a Day value (e.g., 'hetfo'), return as-is
    const dayVal = raw.day;
    const weekStart = new Date(weekStartIso);
    const dayNames: Day[] = ['hetfo', 'kedd', 'szerda', 'csutortok', 'pentek', 'szombat', 'vasarnap'];
    let day: Day = 'hetfo';
    if (typeof dayVal === 'string') {
      // try parse as ISO date
      const d = new Date(dayVal);
      if (!isNaN(d.getTime())) {
        const diff = Math.floor((d.setHours(0,0,0,0) - new Date(weekStart).setHours(0,0,0,0)) / (24*60*60*1000));
        if (diff >=0 && diff < 7) day = dayNames[diff];
        else {
          // fallback: if the dayVal matches one of enums
          if ((dayNames as string[]).includes(dayVal)) day = dayVal as Day;
        }
      } else {
        if ((dayNames as string[]).includes(dayVal)) day = dayVal as Day;
      }
    }
    // Normalize mealType values (handle accented forms coming from JSON)
    let mealType = raw.mealType || '';
    if (typeof mealType === 'string') {
      const m = mealType.toLowerCase().replace(/[^a-záéíóöőúüű]+/g, '');
      if (m.startsWith('reg')) mealType = 'reggeli';
      else if (m.startsWith('eb')) mealType = 'ebed';
      else if (m.startsWith('vac') || m.startsWith('vac')) mealType = 'vacsora';
      else mealType = raw.mealType;
    }

    // Coerce numeric fields safely
    const prepNum = raw.recipePrepTime != null ? Number(raw.recipePrepTime) : NaN;
    const calNum = raw.recipeCalories != null ? Number(raw.recipeCalories) : NaN;
    const prepVal: number | null = Number.isFinite(prepNum) ? prepNum : null;
    const calVal: number | null = Number.isFinite(calNum) ? calNum : null;

    const slot: MealSlot = {
      day,
      mealType,
      recipeId: raw.recipeId || null,
      recipeTitle: raw.recipeTitle || null,
      recipeImageUrl: raw.recipeImageUrl || null,
      recipePrepTime: prepVal,
      recipeCalories: calVal,
    } as MealSlot;

    // If numeric fields missing, try to enrich from RecipeService
    if ((!slot.recipePrepTime || !slot.recipeCalories) && slot.recipeId) {
      const r = this.recipeService.getRecipeById(slot.recipeId);
      if (r) {
        if (!slot.recipePrepTime && typeof r.prepTime === 'number') slot.recipePrepTime = r.prepTime;
        if (!slot.recipeCalories && typeof r.calories === 'number') slot.recipeCalories = r.calories;
      }
    }

    return slot;
  }
}
