import { Component } from '@angular/core';
import { RecipeList } from './recipe-list/recipe-list';
import { SearchBar } from './search-bar/search-bar';
import { EmptyState } from './empty-state/empty-state';
import { NgIf } from '@angular/common';
import { Recipe } from './recipe-list/recipe-list';
import { RecipeEditor } from './recipe-editor/recipe-editor';

const recipeImage = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80';

@Component({
  selector: 'app-recipe-catalog',
  standalone: true,
  imports: [RecipeList, SearchBar, EmptyState, NgIf, RecipeEditor],
  templateUrl: './recipe-catalog.html',
  styleUrl: './recipe-catalog.scss',
})
export class RecipeCatalog {
  recipes: Recipe[] = [
    {
      image: recipeImage,
      badges: ['Leves', 'Saját'],
      own: true,
      title: 'Tavaszi zöldborsóleves',
      meta: 'Elkészítési idő: 30 perc | Kalória: 320 | Nehézség: Könnyű',
      desc: 'Friss zöldborsóval, répával és petrezselyemmel.'
    },
    {
      image: recipeImage,
      badges: ['Főétel'],
      title: 'Sült csirkemell zöldségekkel',
      meta: 'Elkészítési idő: 45 perc | Kalória: 410 | Nehézség: Közepes',
      desc: 'Szaftos csirkemell, sült zöldségekkel tálalva.'
    },
    {
      image: recipeImage,
      badges: ['Desszert'],
      title: 'Csokis muffin',
      meta: 'Elkészítési idő: 25 perc | Kalória: 280 | Nehézség: Könnyű',
      desc: 'Puha, csokis muffin recept, tökéletes uzsonnára.'
    },
    {
      image: recipeImage,
      badges: ['Vegetáriánus', 'Főétel'],
      title: 'Zöldséges rizottó',
      meta: 'Elkészítési idő: 40 perc | Kalória: 350 | Nehézség: Közepes',
      desc: 'Krémes rizottó sok zöldséggel, vegetáriánusoknak.'
    },
    {
      image: recipeImage,
      badges: ['Leves'],
      title: 'Gulyásleves',
      meta: 'Elkészítési idő: 60 perc | Kalória: 420 | Nehézség: Haladó',
      desc: 'Magyaros gulyásleves, tartalmas és ízletes.'
    }
  ];

  showEditor = false;

  openEditor() {
    this.showEditor = true;
  }

  closeEditor() {
    this.showEditor = false;
  }

  addRecipe(recipe: Recipe) {
    this.recipes = [...this.recipes, recipe];
    this.closeEditor();
  }
}
