import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'recipes', pathMatch: 'full' },
  { path: 'recipes', loadComponent: () => import('./recipe-catalog/recipe-catalog').then(m => m.RecipeCatalog) },
  { path: 'menu', loadComponent: () => import('./weekly-menu-planner/weekly-menu-planner').then(m => m.WeeklyMenuPlanner) },
  { path: 'shopping', loadComponent: () => import('./shopping-list/shopping-list').then(m => m.ShoppingList) },
  { path: 'profile', loadComponent: () => import('./profile/profile').then(m => m.Profile) },
  { path: '**', redirectTo: 'recipes' },
];
