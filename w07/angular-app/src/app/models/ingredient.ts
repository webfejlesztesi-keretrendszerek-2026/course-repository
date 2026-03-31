/**
 * Firestore collection: ingredients
 * Ingredients reference a category (ingredient-type Category). Default unit is provided
 * to help with shopping-list aggregation and unit conversions.
 */
export interface Ingredient {
  id: string;
  name: string;
  categoryId: string; // refers to a Category with type 'ingredient'
  defaultUnit: string;
  createdBy: string;
  createdAt: string; // Firestore Timestamp
}
