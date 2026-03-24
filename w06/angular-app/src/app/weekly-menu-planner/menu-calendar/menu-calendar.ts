import { Component, Input, Output, EventEmitter, AfterViewInit, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MiniRecipeCard } from '../mini-recipe-card/mini-recipe-card';
import { SlotEqualHeightDirective } from '../slot-equal-height.directive';
import { Recipe } from '../weekly-menu-planner';

@Component({
  selector: 'app-menu-calendar',
  standalone: true,
  imports: [CommonModule, MiniRecipeCard, SlotEqualHeightDirective],
  templateUrl: './menu-calendar.html',
  styleUrl: './menu-calendar.scss',
})
export class MenuCalendar implements AfterViewInit {
    @ViewChildren('slot') slotElements!: QueryList<ElementRef>;
    maxSlotHeight = 200;
    ngAfterViewInit() {
      setTimeout(() => {
        const heights = this.slotElements.map(el => el.nativeElement.offsetHeight);
        this.maxSlotHeight = Math.max(...heights, 200);
      });
    }
  @Input() days: { label: string }[] = [];
  @Input() menu: (Recipe | null)[][] = [];
  @Output() editMeal = new EventEmitter<{ day: number; meal: number }>();
  @Output() deleteMeal = new EventEmitter<{ day: number; meal: number }>();
}
