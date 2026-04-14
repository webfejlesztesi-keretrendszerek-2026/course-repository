/**
 * Firestore collection: categories
 * Categories are stored as documents so they can be edited in-app.
 * Denormalization: icons and sortOrder included for fast rendering.
 */
export interface Category {
  id: string;
  name: string;
  type: 'recipe' | 'ingredient';
  icon: string; // emoji or short string
  sortOrder: number;
  createdBy: string | null;
  createdAt: string; // Firestore Timestamp
}
