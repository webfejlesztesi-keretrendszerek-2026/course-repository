import { Injectable } from '@angular/core';
import { signal } from '@angular/core';
import { WeeklyMenu, MealSlot, Day } from '../models/weekly-menu';

@Injectable({ providedIn: 'root' })
export class WeeklyMenuService {
  private _menu = signal<WeeklyMenu | null>(null);
  readonly menu = this._menu.asReadonly();

  private _loading = signal(false);
  readonly loading = this._loading.asReadonly();

  private _error = signal<string | null>(null);
  readonly error = this._error.asReadonly();

  constructor() {}

  async loadWeeklyMenu(path = '/assets/data/weekly-menu.json') {
    this._loading.set(true);
    this._error.set(null);
    try {
      const res = await fetch(path);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const payload = await res.json();
      // Normalize slots: if slot.day is an ISO date string, convert to Day enum
      const normalized: WeeklyMenu = {
        id: payload.id,
        userId: payload.ownerId || payload.userId || 'unknown',
        weekStart: payload.weekStart,
        slots: (payload.slots || []).map((s: any) => this.normalizeSlot(s, payload.weekStart)),
        createdAt: payload.createdAt || new Date().toISOString(),
        updatedAt: payload.updatedAt || new Date().toISOString(),
      };
      this._menu.set(normalized);
    } catch (err: any) {
      this._error.set(err?.message || String(err));
      this._menu.set(null);
    } finally {
      this._loading.set(false);
    }
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
    return {
      day,
      mealType: raw.mealType,
      recipeId: raw.recipeId || null,
      recipeTitle: raw.recipeTitle || null,
      recipeImageUrl: raw.recipeImageUrl || null,
      recipePrepTime: raw.recipePrepTime || null,
      recipeCalories: raw.recipeCalories || null,
    } as MealSlot;
  }
}
