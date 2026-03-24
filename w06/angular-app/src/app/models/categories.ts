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

export default RecipeCategory;
