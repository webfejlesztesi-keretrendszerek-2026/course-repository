
/**
 * Compatibility layer: original in-memory recipe categories
 * Keep as module so existing imports (`ALL_CATEGORIES`, `RecipeCategory`) work.
 */
export enum RecipeCategory {
	Soup = 'Leves',
	Main = 'Főétel',
	Dessert = 'Desszert',
	Vegetarian = 'Vegetáriánus',
	Easy = 'Könnyű',
	Own = 'Saját'
}

export const ALL_CATEGORIES: string[] = [
	RecipeCategory.Soup,
	RecipeCategory.Main,
	RecipeCategory.Dessert,
	RecipeCategory.Vegetarian,
	RecipeCategory.Easy,
	RecipeCategory.Own
];

/**
 * Map human-friendly category labels to internal category IDs
 * (used by the Recipe model's `categoryId` field).
 */
export const CATEGORY_ID_MAP: Record<string, string> = {
  [RecipeCategory.Soup]: 'cat_leves',
  [RecipeCategory.Main]: 'cat_foetel',
  [RecipeCategory.Dessert]: 'cat_desszert',
  [RecipeCategory.Vegetarian]: 'cat_vegetarian',
  [RecipeCategory.Easy]: 'cat_easy',
  [RecipeCategory.Own]: 'cat_own'
};



