/**
 * Firestore collection: shoppingLists
 * Shopping items are aggregated from recipes but keep denormalized names and category
 * info to render and to allow manual items. fromRecipeIds tracks origins.
 */
export interface ShoppingItem {
  id: string;
  ingredientId?: string;
  ingredientName: string; // denormalized
  totalAmount: number;
  unit: string;
  categoryId?: string;
  categoryName?: string; // denormalized
  checked: boolean;
  isManual: boolean;
  fromRecipeIds: string[];
}

export interface ShoppingList {
  id: string;
  weekOf?: string; // ISO date identifying the week (e.g., 2026-03-29)
  userId: string;
  weeklyMenuId?: string;
  items: ShoppingItem[];
  generatedAt: string; // Firestore Timestamp
  updatedAt: string; // Firestore Timestamp
}
