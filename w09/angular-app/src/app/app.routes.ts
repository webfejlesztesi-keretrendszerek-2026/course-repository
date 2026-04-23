import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'recipes', pathMatch: 'full' },
  { path: 'recipes', loadComponent: () => import('./recipe-catalog/recipe-catalog').then(m => m.RecipeCatalog) },
  { path: 'menu', loadComponent: () => import('./weekly-menu-planner/weekly-menu-planner').then(m => m.WeeklyMenuPlanner), canActivate: [authGuard] },
  { path: 'shopping', loadComponent: () => import('./shopping-list/shopping-list').then(m => m.ShoppingList), canActivate: [authGuard] },
  { path: 'profile', loadComponent: () => import('./profile/profile').then(m => m.Profile), canActivate: [authGuard] },
  { path: 'login', loadComponent: () => import('./auth/login/login').then(m => m.Login), canActivate: [guestGuard] },
  { path: 'register', loadComponent: () => import('./auth/register/register').then(m => m.Register), canActivate: [guestGuard] },
  { path: '**', redirectTo: 'recipes' },
];
