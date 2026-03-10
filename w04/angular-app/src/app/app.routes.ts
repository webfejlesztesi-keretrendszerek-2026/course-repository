import { Routes } from '@angular/router';
import { RecipeCatalog } from './recipe-catalog/recipe-catalog';
import { WeeklyMenuPlanner } from './weekly-menu-planner/weekly-menu-planner';
import { ShoppingList } from './shopping-list/shopping-list';
import { Profile } from './profile/profile';

export const routes: Routes = [
	{ path: '', redirectTo: 'recipes', pathMatch: 'full' },
	{ path: 'recipes', component: RecipeCatalog },
	{ path: 'menu', component: WeeklyMenuPlanner },
	{ path: 'shopping', component: ShoppingList },
	{ path: 'profile', component: Profile },
];
