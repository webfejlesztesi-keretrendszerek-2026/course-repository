import { Component, Output, EventEmitter, OnDestroy, ElementRef } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Recipe } from '../../models/recipe';
import { ALL_CATEGORIES, RecipeCategory } from '../../models/categories';

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
  dropdownOpen = false;
  private docClickUnlisten: (() => void) | null = null;

  constructor(private fb: FormBuilder, private elRef: ElementRef) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      desc: ['', Validators.required],
      image: [''],
      meta: [''],
      badges: [[]]
    });
  }

  toggleBadge(category: string) {
    const ctrl = this.form.get('badges');
    const arr: string[] = ctrl?.value || [];
    const exists = arr.some(a => a === category);
    let next: string[];
    if (exists) {
      next = arr.filter(a => a !== category);
    } else {
      next = [...arr, category];
    }
    ctrl?.setValue(next);
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
    if (this.dropdownOpen) {
      this.attachDocListener();
    } else {
      this.removeDocListener();
    }
  }

  private attachDocListener() {
    if (this.docClickUnlisten) return;
    const handler = (ev: Event) => {
      if (!this.elRef.nativeElement.contains(ev.target)) {
        this.dropdownOpen = false;
        this.removeDocListener();
      }
    };
    document.addEventListener('click', handler);
    this.docClickUnlisten = () => document.removeEventListener('click', handler);
  }

  private removeDocListener() {
    if (this.docClickUnlisten) {
      try { this.docClickUnlisten(); } catch {}
      this.docClickUnlisten = null;
    }
  }

  ngOnDestroy(): void {
    this.removeDocListener();
  }

  isBadgeSelected(category: string) {
    const arr: string[] = this.form.get('badges')?.value || [];
    return arr.some(a => a === category);
  }

  saveRecipe() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.value;
    const recipe: Recipe = {
      title: v.title,
      desc: v.desc,
      image: v.image || '',
      meta: v.meta || '',
      badges: v.badges || [],
      own: !!v.badges?.some((b: string) => b === RecipeCategory.Own)
    };

    this.save.emit(recipe);
  }
}
