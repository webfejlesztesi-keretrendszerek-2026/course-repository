import { Component, Output, EventEmitter } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Recipe } from '../../models/recipe';
import { ALL_CATEGORIES, CATEGORY_ID_MAP, RecipeCategory } from '../../models/categories';

@Component({
  selector: 'app-recipe-editor',
  standalone: true,
  imports: [NgIf, NgFor, ReactiveFormsModule],
  templateUrl: './recipe-editor.html',
  styleUrl: './recipe-editor.scss',
})
export class RecipeEditor {
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Recipe>();

  form: FormGroup;
  categories = ALL_CATEGORIES;
  

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      imageUrl: [''],
      category: [''],
      difficulty: ['könnyű'],
      prepTime: [30],
      calories: [0],
      servings: [1],
      ingredientsText: [''], // newline separated ingredient lines: "name|amount|unit"
      stepsText: [''], // newline separated steps
      protein: [0],
      carbs: [0],
      fat: [0],
      isPublic: [true]
    });
  }

  

  saveRecipe() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.value;

    const ingredients = (v.ingredientsText || '').split('\n').map((line: string) => line.trim()).filter((l: string) => !!l).map((l: string, idx: number) => {
      const parts = l.split('|').map((p: string) => p.trim());
      return {
        ingredientId: `ing_${Date.now()}_${idx}`,
        ingredientName: parts[0] || 'ingredient',
        amount: Number(parts[1] || 0),
        unit: parts[2] || ''
      };
    });

    const steps = (v.stepsText || '').split('\n').map((s: string) => s.trim()).filter((s: string) => !!s);

    const now = new Date().toISOString();
    const categoryId = v.category ? (CATEGORY_ID_MAP[v.category] || null) : null;

    const recipe: Recipe = {
      id: `recipe_${Date.now()}`,
      title: v.title,
      description: v.description,
      imageUrl: v.imageUrl || undefined,
      categoryId: categoryId || undefined,
      difficulty: v.difficulty || 'könnyű',
      prepTime: Number(v.prepTime) || 0,
      calories: Number(v.calories) || 0,
      servings: Number(v.servings) || 1,
      diet: [],
      nutrition: {
        protein: Number(v.protein) || 0,
        carbs: Number(v.carbs) || 0,
        fat: Number(v.fat) || 0
      },
      ingredients: ingredients,
      steps: steps,
      ownerId: 'user_demo',
      isPublic: !!v.isPublic,
      createdAt: now,
      updatedAt: now
    };

    this.save.emit(recipe);
  }
}
