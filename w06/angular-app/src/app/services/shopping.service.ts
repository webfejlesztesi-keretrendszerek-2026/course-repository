import { Injectable, signal, computed, WritableSignal, Signal } from '@angular/core';
import { Section, ShoppingItem } from '../models/shopping';
import { Unit, PURCHASABLE_UNITS } from '../models/units';

@Injectable({ providedIn: 'root' })
export class ShoppingService {
  private _sections: WritableSignal<Section[]> = signal<Section[]>([
    {
      id: 'veg',
      title: '🥬 Zöldség & Gyümölcs',
      items: [
        { name: 'Paradicsom', amount: 4, unit: Unit.Piece, checked: false },
        { name: 'Uborka', amount: 2, unit: Unit.Piece, checked: true },
        { name: 'Paprika', amount: 3, unit: Unit.Piece, checked: false },
      ],
    },
    {
      id: 'meat',
      title: '🥩 Hús & Hal',
      items: [
        { name: 'Csirkemell', amount: 500, unit: Unit.Gram, checked: false },
        { name: 'Lazac', amount: 2, unit: Unit.Slice, checked: true },
      ],
    },
    {
      id: 'dairy',
      title: '🥛 Tejtermékek',
      items: [
        { name: 'Tej', amount: 2, unit: Unit.Liter, checked: false },
        { name: 'Sajt', amount: 200, unit: Unit.Gram, checked: false },
        { name: 'Joghurt', amount: 4, unit: Unit.Piece, checked: true },
      ],
    },
    {
      id: 'other',
      title: '🧴 Egyéb',
      items: [
        { name: 'Tojás', amount: 10, unit: Unit.Piece, checked: false },
        { name: 'Kávé', amount: 250, unit: Unit.Gram, checked: false },
        { name: 'Papírtörlő', amount: 2, unit: Unit.Piece, checked: true },
      ],
    },
  ]);

  // public read-only access
  readonly sections: Signal<Section[]> = this._sections;

  // computed signals
  readonly totalItems = computed(() => this._sections().reduce((acc, s) => acc + s.items.length, 0));
  readonly checkedItems = computed(() => this._sections().reduce((acc, s) => acc + s.items.filter(i => i.checked).length, 0));
  readonly progressPercent = computed(() => {
    const total = this.totalItems();
    const done = this.checkedItems();
    return total ? Math.round((done / total) * 100) : 0;
  });

  readonly sectionsProgress = computed(() => {
    const map: Record<string, { done: number; total: number; percent: number }> = {};
    for (const s of this._sections()) {
      const total = s.items.length;
      const done = s.items.filter(i => i.checked).length;
      map[s.id] = { done, total, percent: total ? Math.round((done / total) * 100) : 0 };
    }
    return map;
  });

  constructor() {
    this.filterNonPurchasable();
  }

  filterNonPurchasable() {
    const allowed = new Set(PURCHASABLE_UNITS.map(u => String(u)));
    this._sections.update(list =>
      list.map(s => ({ ...s, items: s.items.filter(i => i.unit && allowed.has(String(i.unit))) }))
    );
  }

  generateList(): void {
    // placeholder: real implementation could derive from weekly planner
    alert('Lista generálása (demo) — implementáld a generálást a heti menü alapján');
  }

  clearList(): void {
    this._sections.update(list => list.map(s => ({ ...s, items: [] })));
  }

  onItemToggled(payload: { sectionId: string; index: number }) {
    this._sections.update(list =>
      list.map(s => {
        if (s.id !== payload.sectionId) return s;
        return {
          ...s,
          items: s.items.map((it, i) => (i === payload.index ? { ...it, checked: !it.checked } : it)),
        };
      })
    );
  }

  onItemDeleted(payload: { sectionId: string; index: number }) {
    this._sections.update(list =>
      list.map(s => (s.id === payload.sectionId ? { ...s, items: s.items.filter((_, i) => i !== payload.index) } : s))
    );
  }

  onItemAdded(payload: { sectionId: string; name: string; amount?: number; unit?: string }) {
    this._sections.update(list =>
      list.map(s =>
        s.id === payload.sectionId
          ? { ...s, items: [...s.items, { name: payload.name, amount: payload.amount ?? 0, unit: payload.unit, checked: false }] }
          : s
      )
    );
  }

  copyText(): void {
    const text = this.toPlainText();
    if (navigator.clipboard) navigator.clipboard.writeText(text);
  }

  toPlainText(): string {
    return this._sections()
      .map(s => `${s.title}\n${s.items.map(i => `- ${i.name} ${i.amount ?? ''}${i.unit ? ' ' + i.unit : ''}`).join('\n')}`)
      .join('\n\n');
  }

  print(): void {
    window.print();
  }

  resetAll(): void {
    this._sections.set([]);
  }
}

export default ShoppingService;
