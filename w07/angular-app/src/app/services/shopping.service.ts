import { Injectable, signal, computed, WritableSignal, Signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ShoppingList, ShoppingItem } from '../models/shopping-list';
import { Unit, PURCHASABLE_UNITS } from '../models/units';

@Injectable({ providedIn: 'root' })
export class ShoppingService {
  private _currentList = signal<ShoppingList | null>(null);
  readonly currentList = this._currentList.asReadonly();

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

  constructor(private http: HttpClient) {
    this.loadFromAssets();
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

  filterNonPurchasable() {
    const allowed = new Set(PURCHASABLE_UNITS.map(u => String(u)));
    this._currentList.update(list => {
      if (!list) return list;
      const items = list.items.filter(i => i.unit && allowed.has(String(i.unit)));
      return { ...list, items };
    });
  }

  generateList(): void {
    // placeholder: real implementation could derive from weekly planner
    alert('Lista generálása (demo) — implementáld a generálást a heti menü alapján');
  }

  clearList(): void {
    this._currentList.update(list => {
      if (!list) return list;
      return { ...list, items: [], updatedAt: new Date().toISOString() };
    });
  }

  onItemToggled(itemId: string) {
    this._currentList.update(list => {
      if (!list) return list;
      const items = list.items.map(it => (it.id === itemId ? { ...it, checked: !it.checked } : it));
      return { ...list, items, updatedAt: new Date().toISOString() };
    });
  }

  onItemDeleted(itemId: string) {
    this._currentList.update(list => {
      if (!list) return list;
      const items = list.items.filter(it => it.id !== itemId);
      return { ...list, items, updatedAt: new Date().toISOString() };
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
      return { ...list, items: [...list.items, newItem], updatedAt: new Date().toISOString() };
    });
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
