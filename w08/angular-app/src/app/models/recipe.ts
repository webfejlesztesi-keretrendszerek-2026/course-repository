/**
 * Firestore collection: recipes
 * Denormalization: ingredientName stored on RecipeIngredient for fast reads.
 * Nutrition and simple fields denormalized to avoid extra lookups.
 */
export interface RecipeIngredient {
  ingredientId: string;
  ingredientName: string; // denormalized for display
  amount: number;
  unit: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  /**
   * Backwards-compatibility: older templates use `image`.
   * Keep as optional alongside `imageUrl`.
   */
  image?: string;
  /**
   * Backwards-compatibility: older templates expect a single `meta` string.
   * Prefer `diet` and structured fields, but keep `meta` for compatibility.
   */
  meta?: string;
  /**
   * Backwards-compatibility: `desc` used in older templates.
   */
  desc?: string;
  /**
   * Backwards-compatibility: display badges like 'Saját', 'Könnyű', etc.
   */
  badges?: string[];
  /**
   * Backwards-compatibility: some code checks `own`.
   */
  own?: boolean;
  categoryId?: string;
  difficulty: 'könnyű' | 'közepes' | 'haladó';
  prepTime: number; // minutes
  calories: number;
  servings: number;
  diet: string[];
  nutrition: {
    protein: number;
    carbs: number;
    fat: number;
  };
  ingredients: RecipeIngredient[];
  steps: string[];
  ownerId: string;
  isPublic: boolean;
  createdAt: string; // Firestore Timestamp
  updatedAt: string; // Firestore Timestamp
}

/**
 * Legacy/preview shape used by UI and sample data.
 * This type includes older fields used by templates (`image`, `meta`, `desc`, `badges`, `own`).
 */
export type LegacyRecipe = Partial<Recipe> & {
  title: string;
  image?: string;
  meta?: string;
  desc?: string;
  badges?: string[];
  own?: boolean;
};

