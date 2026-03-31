import { Injectable, signal, computed, WritableSignal, Signal } from '@angular/core';
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

  constructor() {
    // initialize demo shopping list (flattened from previous sections)
    const now = new Date().toISOString();
    const demoItems: ShoppingItem[] = [
      { id: 'item_1', ingredientName: 'Paradicsom', totalAmount: 4, unit: Unit.Piece, checked: false, isManual: false, fromRecipeIds: [], categoryId: 'veg', categoryName: '🥬 Zöldség & Gyümölcs' },
      { id: 'item_2', ingredientName: 'Uborka', totalAmount: 2, unit: Unit.Piece, checked: true, isManual: false, fromRecipeIds: [], categoryId: 'veg', categoryName: '🥬 Zöldség & Gyümölcs' },
      { id: 'item_3', ingredientName: 'Paprika', totalAmount: 3, unit: Unit.Piece, checked: false, isManual: false, fromRecipeIds: [], categoryId: 'veg', categoryName: '🥬 Zöldség & Gyümölcs' },
      { id: 'item_4', ingredientName: 'Csirkemell', totalAmount: 500, unit: Unit.Gram, checked: false, isManual: false, fromRecipeIds: [], categoryId: 'meat', categoryName: '🥩 Hús & Hal' },
      { id: 'item_5', ingredientName: 'Lazac', totalAmount: 2, unit: Unit.Slice, checked: true, isManual: false, fromRecipeIds: [], categoryId: 'meat', categoryName: '🥩 Hús & Hal' },
      { id: 'item_6', ingredientName: 'Tej', totalAmount: 2, unit: Unit.Liter, checked: false, isManual: false, fromRecipeIds: [], categoryId: 'dairy', categoryName: '🥛 Tejtermékek' },
      { id: 'item_7', ingredientName: 'Sajt', totalAmount: 200, unit: Unit.Gram, checked: false, isManual: false, fromRecipeIds: [], categoryId: 'dairy', categoryName: '🥛 Tejtermékek' },
      { id: 'item_8', ingredientName: 'Joghurt', totalAmount: 4, unit: Unit.Piece, checked: true, isManual: false, fromRecipeIds: [], categoryId: 'dairy', categoryName: '🥛 Tejtermékek' },
      { id: 'item_9', ingredientName: 'Tojás', totalAmount: 10, unit: Unit.Piece, checked: false, isManual: false, fromRecipeIds: [], categoryId: 'other', categoryName: '🧴 Egyéb' },
      { id: 'item_10', ingredientName: 'Kávé', totalAmount: 250, unit: Unit.Gram, checked: false, isManual: false, fromRecipeIds: [], categoryId: 'other', categoryName: '🧴 Egyéb' },
      { id: 'item_11', ingredientName: 'Papírtörlő', totalAmount: 2, unit: Unit.Piece, checked: true, isManual: false, fromRecipeIds: [], categoryId: 'other', categoryName: '🧴 Egyéb' },
    ];

    const demoList: ShoppingList = {
      id: 'list_demo_1',
      userId: 'user_demo',
      weeklyMenuId: 'menu_demo_1',
      items: demoItems,
      generatedAt: now,
      updatedAt: now,
    };

    this._currentList.set(demoList);
    this.filterNonPurchasable();
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
