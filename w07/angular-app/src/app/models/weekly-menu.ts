/**
 * Firestore collection: weeklyMenus
 * Weekly menus are stored per-user per-week. MealSlot denormalizes key recipe fields
 * to avoid extra lookups when rendering the calendar.
 */
export type Day = 'hetfo' | 'kedd' | 'szerda' | 'csutortok' | 'pentek' | 'szombat' | 'vasarnap';
export type MealType = 'reggeli' | 'ebed' | 'vacsora';

export interface MealSlot {
  day: Day;
  mealType: MealType;
  recipeId: string | null;
  recipeTitle?: string | null;
  recipeImageUrl?: string | null;
  recipePrepTime?: number | null; // minutes
  recipeCalories?: number | null;
}

export interface WeeklyMenu {
  id: string;
  userId: string;
  weekStart: string; // ISO date of Monday for the week
  slots: MealSlot[];
  createdAt: string; // Firestore Timestamp
  updatedAt: string; // Firestore Timestamp
}
