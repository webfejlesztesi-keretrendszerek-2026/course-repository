import { Injectable, signal, computed, WritableSignal, Signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ShoppingList, ShoppingItem } from '../models/shopping-list';
import { Unit, PURCHASABLE_UNITS } from '../models/units';
import { WeeklyMenuService } from './weekly-menu.service';
import { RecipeService } from './recipe.service';
import { ToastService } from './toast.service';
import { AuthService } from './auth.service';
import { db } from '../firebase.config';
import { collection, addDoc, getDocs, query, where, doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ShoppingService {
  private readonly weeklyMenuCollection = 'weekly-menu';
  private readonly shoppingListCollection = 'shoppingLists';
  private _currentList = signal<ShoppingList | null>(null);
  readonly currentList = this._currentList.asReadonly();
  private _saveStatus = signal<'saved' | 'saving' | 'error'>('saved');
  readonly saveStatus = this._saveStatus.asReadonly();

  private _saveTimer?: ReturnType<typeof setTimeout>;
  private _pendingRollbackState: ShoppingList | null = null;

  // computed signals
  readonly groupedItems = computed(() => {
    const items = this._currentList()?.items ?? [];
    const map = new Map<string, { categoryName: string; items: ShoppingItem[] }>();
    for (const it of items) {
      const cat = it.categoryId ?? 'uncategorized';
      const existing = map.get(cat);
      if (!existing) map.set(cat, { categoryName: it.categoryName ?? 'Egyéb', items: [it] });
      else existing.items.push(it);
    }
    return map;
  });

  // cached array form for templates to avoid creating new arrays on every access
  readonly groupedList = computed(() => {
    const map = this.groupedItems();
    return Array.from(map.entries()).map(([id, v]) => ({ id, categoryName: v.categoryName, items: v.items }));
  });

  readonly totalItems = computed(() => (this._currentList()?.items ?? []).length);
  readonly checkedItems = computed(() => (this._currentList()?.items ?? []).filter(i => i.checked).length);
  readonly progressPercent = computed(() => {
    const total = this.totalItems();
    const done = this.checkedItems();
    return total ? Math.round((done / total) * 100) : 0;
  });

  readonly categoryProgress = computed(() => {
    const result: Record<string, { done: number; total: number; percent: number }> = {};
    const items = this._currentList()?.items ?? [];
    const byCat: Record<string, ShoppingItem[]> = {};
    for (const it of items) {
      const cid = it.categoryId ?? 'uncategorized';
      byCat[cid] = byCat[cid] ?? [];
      byCat[cid].push(it);
    }
    for (const cid of Object.keys(byCat)) {
      const list = byCat[cid];
      const total = list.length;
      const done = list.filter(i => i.checked).length;
      result[cid] = { done, total, percent: total ? Math.round((done / total) * 100) : 0 };
    }
    return result;
  });

  constructor(private http: HttpClient, private weeklyMenuService: WeeklyMenuService, private recipeService: RecipeService, private toast: ToastService, private auth: AuthService) {
    // Load the shopping list for the current local week from Firestore.
    // If none exists, initialize an empty list for the current week.
    void this._loadCurrentWeek();
  }

  private loadFromAssets(): void {
    this.http.get<ShoppingList | ShoppingList[]>('assets/data/shopping-list.json').subscribe({
      next: (res) => {
        let list: ShoppingList | null = null;
        if (Array.isArray(res)) {
          // pick latest by `weekOf` if present, otherwise by `generatedAt`
          list = res.slice().sort((a, b) => {
            const aKey = (a.weekOf ?? a.generatedAt) || '';
            const bKey = (b.weekOf ?? b.generatedAt) || '';
            return aKey < bKey ? 1 : aKey > bKey ? -1 : 0;
          })[0] ?? null;
        } else {
          list = res;
        }

        if (list) {
          this._currentList.set(list);
          this.filterNonPurchasable();
        }
      },
      error: (err) => {
        console.error('Failed to load shopping list from assets:', err);
      }
    });
  }

  private _getLocalWeekStartKey(date?: Date): string {
    const now = date ?? new Date();
    const day = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((day + 6) % 7));
    const y = monday.getFullYear();
    const mm = String(monday.getMonth() + 1).padStart(2, '0');
    const dd = String(monday.getDate()).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  }

  private async _loadCurrentWeek(): Promise<void> {
    try {
      const weekKey = this._getLocalWeekStartKey();
      const uid = this.auth.uid();
      if (!uid) throw new Error('No authenticated user for shopping list lookup.');
      const col = collection(db, this.shoppingListCollection);
      const q = query(col, where('weekOf', '==', weekKey), where('userId', '==', uid));
      const snap = await getDocs(q);
      if (snap && !snap.empty) {
        const docSnap = snap.docs[0];
        const data: any = docSnap.data();
        const toISOString = (ts: any) => {
          if (!ts) return new Date().toISOString();
          if (typeof ts === 'string') return ts;
          if (ts.toDate) return ts.toDate().toISOString();
          if (ts.toISOString) return ts.toISOString();
          return new Date().toISOString();
        };
        const loaded: ShoppingList = {
          id: docSnap.id,
          weekOf: data.weekOf ?? weekKey,
          userId: data.userId ?? 'unknown',
          weeklyMenuId: data.weeklyMenuId ?? undefined,
          items: Array.isArray(data.items) ? data.items : [],
          generatedAt: toISOString(data.generatedAt),
          updatedAt: toISOString(data.updatedAt),
        };
        this._currentList.set(loaded);
        return;
      }
    } catch (err) {
      console.warn('Failed to load shopping-list for current week:', err);
    }

    // No document found (or error) -> initialize empty list for the current week
    const empty: ShoppingList = {
      id: '',
      weekOf: this._getLocalWeekStartKey(),
      userId: this.auth.uid() || 'unknown',
      items: [],
      generatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this._currentList.set(empty);
  }

  filterNonPurchasable() {
    const allowed = new Set(PURCHASABLE_UNITS.map(u => String(u)));
    this._currentList.update(list => {
      if (!list) return list;
      const items = list.items.filter(i => i.unit && allowed.has(String(i.unit)));
      return { ...list, items };
    });
  }

  async generateList(weeklyMenuId?: string): Promise<void> {
    try {
      // 1) obtain weekly menu (prefer current cached)
      let menu = this.weeklyMenuService.menu();
      // if caller provided an id and it doesn't match current menu, try to load it
      if (weeklyMenuId && (!menu || menu.id !== weeklyMenuId)) {
        try {
          const ref = doc(db, this.weeklyMenuCollection, weeklyMenuId);
          const snap = await getDoc(ref);
          if (snap.exists()) {
            const data: any = snap.data();
            menu = {
              id: snap.id,
              ownerId: data.userId || data.ownerId || 'unknown',
              weekStart: data.weekStart,
              slots: Array.isArray(data.slots) ? data.slots : [],
              createdAt: data.createdAt || new Date().toISOString(),
              updatedAt: data.updatedAt || new Date().toISOString(),
            } as any;
          }
        } catch (err) {
          console.warn('Failed to load weekly-menu by id, falling back to current menu', err);
        }
      }

      if (!menu) {
        // Try to find a weekly-menu for the current local weekStart (fallback when no menu cached)
        try {
          const now = new Date();
          const day = now.getDay();
          const monday = new Date(now);
          monday.setDate(now.getDate() - ((day + 6) % 7));
          const y = monday.getFullYear();
          const m = String(monday.getMonth() + 1).padStart(2, '0');
          const dStr = String(monday.getDate()).padStart(2, '0');
          const weekStartKey = `${y}-${m}-${dStr}`;
          const uid = this.auth.uid();
          if (!uid) throw new Error('No authenticated user for weekly menu lookup.');
          const qWeek = query(
            collection(db, this.weeklyMenuCollection),
            where('weekStart', '==', weekStartKey),
            where('ownerId', '==', uid)
          );
          const weekSnap = await getDocs(qWeek);
          if (!weekSnap.empty) {
            const docSnap = weekSnap.docs[0];
            const data: any = docSnap.data();
            menu = {
              id: docSnap.id,
              userId: data.userId || data.ownerId || 'unknown',
              weekStart: data.weekStart,
              slots: Array.isArray(data.slots) ? data.slots : [],
              createdAt: data.createdAt || new Date().toISOString(),
              updatedAt: data.updatedAt || new Date().toISOString(),
            } as any;
          }
        } catch (err) {
          console.warn('Failed fallback weekly-menu lookup:', err);
        }
      }

      if (!menu) {
        this.toast.error('Nem található a heti menü.');
        return;
      }

      // 2) collect recipeIds and their occurrence counts (do not dedupe)
      const recipeCount = new Map<string, number>();
      for (const s of menu.slots || []) {
        if (s && s.recipeId) recipeCount.set(s.recipeId, (recipeCount.get(s.recipeId) || 0) + 1);
      }
      const recipeIds = Array.from(recipeCount.keys());

      // 3) load recipes from RecipeService (local cache), fallback to Firestore if missing
      const recipes: any[] = [];
      for (const rid of recipeIds) {
        const r = this.recipeService.getRecipeById(rid);
        if (r) recipes.push(r);
        else {
          try {
            const remote = await this.recipeService.getRecipeByIdFromFirestore(rid);
            if (remote) recipes.push(remote as any);
          } catch {}
        }
      }

      if (!recipes.length) {
        this.toast.error('Nincsenek receptek a héthez.');
        return;
      }

      // 4) aggregate ingredients
      type TmpEntry = { ingredientId?: string; ingredientName: string; amount: number; unit: string; fromRecipeIds: Set<string> };
      const byIngredient = new Map<string, TmpEntry[]>();

      const normalizeUnit = (u: string | undefined) => (u || '').toLowerCase().trim();
      const isMass = (u: string) => ['g', 'kg'].includes(u);
      const isVolume = (u: string) => ['ml', 'l'].includes(u);

      const convertToFinal = (amt: number, unit: string) => {
        const u = normalizeUnit(unit);
        if (isMass(u)) {
          // final: grams
          if (u === 'kg') return { amount: amt * 1000, unit: 'g' };
          return { amount: amt, unit: 'g' };
        }
        if (isVolume(u)) {
          // final: liters (to match PURCHASABLE_UNITS)
          if (u === 'ml') return { amount: amt / 1000, unit: 'l' };
          return { amount: amt, unit: 'l' };
        }
        return { amount: amt, unit: u || '' };
      };

      for (const r of recipes) {
        const rid = r.id;
        const count = recipeCount.get(rid) || 1;
        const ings = Array.isArray(r.ingredients) ? r.ingredients : [];
        for (const ing of ings) {
          const iid = ing.ingredientId || ing.id || null;
          const iname = ing.ingredientName || ing.name || (iid ?? 'Ismeretlen');
          const rawAmt = Number(ing.amount) || 0;
          const rawUnit = String(ing.unit || ing.unitName || ing.unit || '');
          const conv = convertToFinal(rawAmt * count, rawUnit);

          const key = String(iid || iname);
          const entries = byIngredient.get(key) ?? [];

          // try to merge into existing entry with same unit
          let merged = false;
          for (const e of entries) {
            if (e.unit === conv.unit) {
              e.amount += conv.amount;
              e.fromRecipeIds.add(rid);
              merged = true;
              break;
            }
          }
          if (!merged) {
            const newE: TmpEntry = { ingredientId: iid ?? undefined, ingredientName: iname, amount: conv.amount, unit: conv.unit, fromRecipeIds: new Set([rid]) };
            entries.push(newE);
            byIngredient.set(key, entries);
          }
        }
      }

      // 5) enrich with ingredient/category info
      const ingredientsList: any[] = await firstValueFrom(this.http.get<any[]>('/assets/data/ingredients.json')).catch(() => [] as any[]);
      const categoriesList: any[] = await firstValueFrom(this.http.get<any[]>('/assets/data/categories.json')).catch(() => [] as any[]);
      const ingredientMap = new Map<string, any>();
      for (const ii of ingredientsList) ingredientMap.set(ii.id, ii);
      const categoryMap = new Map<string, any>();
      for (const c of categoriesList) categoryMap.set(c.id, c);

      const items: ShoppingItem[] = [];
      for (const [key, entries] of byIngredient.entries()) {
        for (const e of entries) {
          // determine category
          let catId: string | undefined = undefined;
          let catName: string | undefined = undefined;
          if (e.ingredientId && ingredientMap.has(e.ingredientId)) {
            const ii = ingredientMap.get(e.ingredientId);
            catId = ii.categoryId;
            if (catId && categoryMap.has(catId)) catName = categoryMap.get(catId).name;
          }

          items.push({
            id: `item_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,
            ingredientId: e.ingredientId,
            ingredientName: e.ingredientName,
            totalAmount: Number(parseFloat(String(e.amount)).toFixed(3)),
            unit: e.unit || '',
            categoryId: catId,
            categoryName: catName,
            checked: false,
            isManual: false,
            fromRecipeIds: Array.from(e.fromRecipeIds),
          });
        }
      }

      // 6) group by category done by existing computed signals when rendering — persist as-is

      // 7) save to Firestore (collection: shoppingLists)
      const col = collection(db, this.shoppingListCollection);
      const uid = this.auth.uid();
      if (!uid) throw new Error('No authenticated user for shopping list save.');

      // Determine canonical week key (YYYY-MM-DD) for this menu — always use weekOf to identify lists
      const weekKey = menu.weekStart ?? (() => {
        const now = new Date();
        const day = now.getDay();
        const monday = new Date(now);
        monday.setDate(now.getDate() - ((day + 6) % 7));
        const y = monday.getFullYear();
        const mm = String(monday.getMonth() + 1).padStart(2, '0');
        const dd = String(monday.getDate()).padStart(2, '0');
        return `${y}-${mm}-${dd}`;
      })();

      const q = query(col, where('weekOf', '==', weekKey), where('userId', '==', uid));
      const snap = await getDocs(q);

      const payload: any = {
        weekOf: weekKey,
        userId: uid,
        items: items,
        generatedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      let listId: string | null = null;
      if (snap && !snap.empty) {
        // existing -> overwrite without confirmation (by weekOf)
        const docSnap = snap.docs[0];
        await setDoc(doc(db, this.shoppingListCollection, docSnap.id), payload);
        listId = docSnap.id;
      } else {
        const docRef = await addDoc(col, payload);
        listId = docRef.id;
      }

      const now = new Date().toISOString();
      const saved: ShoppingList = {
        id: listId as string,
        weekOf: weekKey,
        userId: uid,
        items,
        generatedAt: now,
        updatedAt: now,
      };

      this._currentList.set(saved);
      this.toast.success(`Bevásárlólista elkészült! (${items.length} tétel)`);
    } catch (err) {
      console.error('generateList error:', err);
      this.toast.error('Hiba a lista generálásánál');
    }
  }

  clearList(): void {
    this._currentList.update(list => {
      if (!list) return list;
      // preserve previous state for rollback
      if (!this._pendingRollbackState) this._pendingRollbackState = JSON.parse(JSON.stringify(list));
      // ensure weekOf exists on the saved list
      const weekOf = list.weekOf ?? (this.weeklyMenuService.menu() ? (this.weeklyMenuService.menu() as any).weekStart : undefined) ?? (() => {
        const now = new Date();
        const day = now.getDay();
        const monday = new Date(now);
        monday.setDate(now.getDate() - ((day + 6) % 7));
        const y = monday.getFullYear();
        const mm = String(monday.getMonth() + 1).padStart(2, '0');
        const dd = String(monday.getDate()).padStart(2, '0');
        return `${y}-${mm}-${dd}`;
      })();
      const updated = { ...list, items: [], weekOf, updatedAt: new Date().toISOString() };
      // immediate save for clearList
      void this._performSave(JSON.parse(JSON.stringify(updated)));
      return updated;
    });
  }

  onItemToggled(itemId: string) {
    this._currentList.update(list => {
      if (!list) return list;
      if (!this._pendingRollbackState) this._pendingRollbackState = JSON.parse(JSON.stringify(list));
      const items = list.items.map(it => (it.id === itemId ? { ...it, checked: !it.checked } : it));
      const weekOf = list.weekOf ?? (this.weeklyMenuService.menu() ? (this.weeklyMenuService.menu() as any).weekStart : undefined);
      const updated = { ...list, items, weekOf, updatedAt: new Date().toISOString() };
      this._scheduleSave();
      return updated;
    });
  }

  onItemDeleted(itemId: string) {
    this._currentList.update(list => {
      if (!list) return list;
      if (!this._pendingRollbackState) this._pendingRollbackState = JSON.parse(JSON.stringify(list));
      const items = list.items.filter(it => it.id !== itemId);
      const weekOf = list.weekOf ?? (this.weeklyMenuService.menu() ? (this.weeklyMenuService.menu() as any).weekStart : undefined);
      const updated = { ...list, items, weekOf, updatedAt: new Date().toISOString() };
      this._scheduleSave();
      return updated;
    });
  }

  onItemAdded(payload: Partial<ShoppingItem>) {
    const newItem: ShoppingItem = {
      id: payload.id ?? `item_${Date.now()}`,
      ingredientId: payload.ingredientId,
      ingredientName: payload.ingredientName ?? payload.ingredientId ?? 'Új tétel',
      totalAmount: payload.totalAmount ?? 1,
      unit: payload.unit ?? Unit.Piece,
      categoryId: payload.categoryId,
      categoryName: payload.categoryName,
      checked: payload.checked ?? false,
      isManual: payload.isManual ?? false,
      fromRecipeIds: payload.fromRecipeIds ?? [],
    };
    this._currentList.update(list => {
      if (!list) return list;
      if (!this._pendingRollbackState) this._pendingRollbackState = JSON.parse(JSON.stringify(list));
      const weekOf = list.weekOf ?? (this.weeklyMenuService.menu() ? (this.weeklyMenuService.menu() as any).weekStart : undefined);
      const updated = { ...list, items: [...list.items, newItem], weekOf, updatedAt: new Date().toISOString() };
      this._scheduleSave();
      return updated;
    });
  }

  private _scheduleSave() {
    if (this._saveTimer) clearTimeout(this._saveTimer);
    this._saveTimer = setTimeout(() => {
      const snapshot = JSON.parse(JSON.stringify(this._currentList()));
      void this._performSave(snapshot);
      this._saveTimer = undefined;
    }, 1500);
  }

  private async _performSave(listSnapshot: ShoppingList | null) {
    if (!listSnapshot) return;
    this._saveStatus.set('saving');
    try {
      const resultId = await this._saveToFirestore(listSnapshot);
      if (resultId && !listSnapshot.id) {
        // set id on current list if it was newly created
        const current = this._currentList();
        if (current && !current.id) {
          this._currentList.update(l => l ? { ...l, id: resultId } : l);
        }
      }
      this._saveStatus.set('saved');
      this._pendingRollbackState = null;
    } catch (err) {
      console.error('ShoppingList save error:', err);
      this._saveStatus.set('error');
      this.toast.error('A bevásárlólista mentése sikertelen. Visszaállítom az előző állapotot.');
      if (this._pendingRollbackState) {
        this._currentList.set(this._pendingRollbackState);
        this._pendingRollbackState = null;
      }
    }
  }

  private async _saveToFirestore(list: ShoppingList): Promise<string | null> {
    const uid = this.auth.uid();
    if (!uid) throw new Error('A bevásárlólista mentéséhez be kell jelentkezni.');
    const col = collection(db, this.shoppingListCollection);

    // 1) If we have an id, try updateDoc
    if (list.id) {
      try {
        const ref = doc(db, this.shoppingListCollection, list.id);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          await updateDoc(ref, { userId: uid, items: list.items, updatedAt: serverTimestamp() });
          return list.id;
        }
      } catch (err) {
        // fall through to try queries/creation
        console.warn('update by id failed, falling back to query/create', err);
      }
    }

    // 2) try to find existing by weekOf only (week is canonical identifier)
    let existingSnap: any = null;
    if (list.weekOf) {
      const q = query(col, where('weekOf', '==', list.weekOf), where('userId', '==', uid));
      existingSnap = await getDocs(q);
    }
    if (existingSnap && !existingSnap.empty) {
      const docSnap = existingSnap.docs[0];
      const ref = doc(db, this.shoppingListCollection, docSnap.id);
      await updateDoc(ref, { userId: uid, items: list.items, updatedAt: serverTimestamp() });
      return docSnap.id;
    }

    // 3) create new document
    const payload: any = {
      weekOf: list.weekOf,
      userId: uid,
      items: list.items,
      generatedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    // Do not include weeklyMenuId when creating/saving shopping lists; lists are keyed by `weekOf`.
    const docRef = await addDoc(col, payload);
    return docRef.id;
  }

  copyText(): void {
    const text = this.toPlainText();
    if (navigator.clipboard) navigator.clipboard.writeText(text);
  }

  toPlainText(): string {
    const list = this._currentList();
    if (!list || !list.items.length) return '';
    const groups = new Map<string, ShoppingItem[]>();
    for (const it of list.items) {
      const k = it.categoryName ?? 'Egyéb';
      groups.set(k, [...(groups.get(k) ?? []), it]);
    }
    let out: string[] = [];
    for (const [title, items] of groups) {
      out.push(`${title}`);
      out.push(...items.map(i => `- ${i.ingredientName} ${i.totalAmount ?? ''}${i.unit ? ' ' + i.unit : ''}`));
      out.push('');
    }
    return out.join('\n').trim();
  }

  print(): void {
    window.print();
  }

  resetAll(): void {
    this._currentList.set(null);
  }
}

export default ShoppingService;
