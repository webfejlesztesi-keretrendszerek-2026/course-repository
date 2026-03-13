import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListSection } from './list-section/list-section';

@Component({
  selector: 'app-shopping-list',
  standalone: true,
  imports: [CommonModule, ListSection],
  templateUrl: './shopping-list.html',
  styleUrl: './shopping-list.scss',
})
export class ShoppingList {
  sections: any[] = [
    {
      id: 'veg',
      title: '🥬 Zöldség & Gyümölcs',
      items: [
        { name: 'Paradicsom', amount: '4 db', checked: false },
        { name: 'Uborka', amount: '2 db', checked: true },
        { name: 'Paprika', amount: '3 db', checked: false },
      ],
    },
    {
      id: 'meat',
      title: '🥩 Hús & Hal',
      items: [
        { name: 'Csirkemell', amount: '500 g', checked: false },
        { name: 'Lazac', amount: '2 szelet', checked: true },
      ],
    },
  ];

  generateList(): void {
    alert('Lista generálása (demo) — implementáld a generálást a heti menü alapján');
  }

  clearList(): void {
    this.sections.forEach(s => (s.items = []));
  }

  // Handlers for events coming from child components
  onItemToggled(payload: { sectionId: string; index: number }) {
    const s = this.sections.find(x => x.id === payload.sectionId);
    if (!s) return;
    const it = s.items[payload.index];
    if (it) it.checked = !it.checked;
  }

  onItemDeleted(payload: { sectionId: string; index: number }) {
    const s = this.sections.find(x => x.id === payload.sectionId);
    if (!s) return;
    s.items.splice(payload.index, 1);
  }

  onItemAdded(payload: { sectionId: string; name: string; amount: string }) {
    const s = this.sections.find(x => x.id === payload.sectionId);
    if (!s) return;
    s.items.push({ name: payload.name, amount: payload.amount || '', checked: false });
  }

  copyText(): void {
    const text = this.toPlainText();
    if (navigator.clipboard) navigator.clipboard.writeText(text);
  }

  toPlainText(): string {
    return this.sections
      .map(s => `${s.title}\n${s.items.map((i: any) => `- ${i.name} ${i.amount}`).join('\n')}`)
      .join('\n\n');
  }

  print(): void {
    window.print();
  }

  resetAll(): void {
    this.sections = [];
  }

  sectionProgress(section: any) {
    const total = section.items.length;
    const done = section.items.filter((i: any) => i.checked).length;
    return { done, total, percent: total ? Math.round((done / total) * 100) : 0 };
  }

  getTotals() {
    const done = this.sections.reduce((acc, s) => acc + s.items.filter((i: any) => i.checked).length, 0);
    const total = this.sections.reduce((acc, s) => acc + s.items.length, 0);
    return { done, total };
  }
}
