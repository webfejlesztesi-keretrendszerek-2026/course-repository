import { Component, ViewChild, OnInit, ChangeDetectorRef } from '@angular/core';
import { DatePipe, CommonModule, registerLocaleData } from '@angular/common';
import localeHu from '@angular/common/locales/hu';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MenuCalendar } from './menu-calendar/menu-calendar';
import { MiniRecipeCard } from './mini-recipe-card/mini-recipe-card';
import { MatDialogModule } from '@angular/material/dialog';
import { Overlay } from '@angular/cdk/overlay';
import { MAT_DATEPICKER_SCROLL_STRATEGY, MatDatepickerIntl } from '@angular/material/datepicker';
import { MAT_DATE_LOCALE, DateAdapter, NativeDateAdapter } from '@angular/material/core';
import { OverlayModule } from '@angular/cdk/overlay';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TemplateRef } from '@angular/core';
import { WeeklyMenu, MealSlot, Day, MealType } from '../models/index';
import { WeeklyMenuService } from '../services/weekly-menu.service';

export function scrollFactory(overlay: Overlay): () => any {
  return () => overlay.scrollStrategies.block();
}

export { WeeklyMenuPlannerComponent as WeeklyMenuPlanner };

@Component({
  selector: 'app-weekly-menu-planner',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    MenuCalendar,
    MiniRecipeCard,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    MatDialogModule,
    OverlayModule
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'hu' },
    // Custom DateAdapter to make week start on Monday
    {
      provide: DateAdapter,
      useClass: class extends NativeDateAdapter {
        override getFirstDayOfWeek(): number {
          return 1; // Monday
        }
      }
    }
    ,
    {
      provide: MatDatepickerIntl,
      useFactory: () => {
        const intl = new MatDatepickerIntl();
        // empty = no tooltip, or set to Hungarian labels if preferred
        intl.prevMonthLabel = '';
        intl.nextMonthLabel = '';
        intl.prevYearLabel = '';
        intl.nextYearLabel = '';
        intl.prevMultiYearLabel = '';
        intl.nextMultiYearLabel = '';
        intl.switchToMonthViewLabel = '';
        intl.switchToMultiYearViewLabel = '';
        return intl;
      }
    }
  ],
  templateUrl: './weekly-menu-planner.html',
  styleUrl: './weekly-menu-planner.scss',
})
export class WeeklyMenuPlannerComponent implements OnInit {
    // kept minimal: remove unused week-picker related fields
  selectedDate: Date = new Date();
  

  // Helper to format week label deterministically
  private formatWeekLabel(date: Date): string {
    const day = date.getDay();
    const monday = new Date(date);
    monday.setDate(date.getDate() - ((day + 6) % 7));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return `${monday.getFullYear()}. ${monday.getMonth() + 1}. ${monday.getDate()} – ${sunday.getFullYear()}. ${sunday.getMonth() + 1}. ${sunday.getDate()}`;
  }

  updateWeekLabel(date: Date): void {
    // Assign synchronously to keep change detection stable
    this.weekLabel = this.formatWeekLabel(date);
  }
  days = [
    { label: 'Hétfő' },
    { label: 'Kedd' },
    { label: 'Szerda' },
    { label: 'Csütörtök' },
    { label: 'Péntek' },
    { label: 'Szombat' },
    { label: 'Vasárnap' },
  ];
  meals = ['Reggeli', 'Ebéd', 'Vacsora'];

  // Current weekly menu is provided by WeeklyMenuService
  get currentMenu(): WeeklyMenu | null {
    return this.weeklyMenuService.menu();
  }

  // Helper arrays that correspond to Day / MealType keys used by the models
  dayKeys: Day[] = ['hetfo', 'kedd', 'szerda', 'csutortok', 'pentek', 'szombat', 'vasarnap'];
  mealTypes: MealType[] = ['reggeli', 'ebed', 'vacsora'];

  weekLabel = this.formatWeekLabel(this.selectedDate);
  lastSaved = new Date();
  avgCalories = 1850;
  totalCookingTime = '4 óra 20 perc';

  currentDialogRef?: MatDialogRef<any>;

  constructor(public dialog: MatDialog, private cdRef: ChangeDetectorRef, private dateAdapter: DateAdapter<Date>, public weeklyMenuService: WeeklyMenuService) {}

  ngOnInit(): void {
    // register Hungarian locale and set date adapter locale so calendar shows Hungarian names
    try {
      registerLocaleData(localeHu);
    } catch {}
    try { this.dateAdapter.setLocale('hu'); } catch {}
    // Load weekly menu from service
    try { this.weeklyMenuService.loadWeeklyMenu(); } catch {}
  }

  openDatePicker(): void {
    const dialogRef = this.dialog.open(this.datePickerDialog);
    this.currentDialogRef = dialogRef;

    // no-op: using MatDatepickerIntl provider to control nav labels/tooltips

    dialogRef.afterClosed().subscribe(result => {
      this.currentDialogRef = undefined;
      // no MutationObserver to disconnect (labels handled by MatDatepickerIntl)
      if (result) {
        // if dialog closed with a date passed, defer applying the date to the next tick
        // to avoid changing bindings during the current change-detection cycle.
        const date = result instanceof Date ? result : (result && (result as any).value) || null;
        if (date) {
          setTimeout(() => this.applySelectedDate(date), 0);
        }
      }
    });
  }

  // tooltips handled by MatDatepickerIntl provider

  @ViewChild('datePickerDialog') datePickerDialog!: TemplateRef<any>;

  prevWeek(): void {
    // Visszalépés az előző hétre
    const date = new Date(this.selectedDate);
    date.setDate(date.getDate() - 7);
    this.selectedDate = date;
    this.updateWeekLabel(date);
  }

  nextWeek(): void {
    // Előrelépés a következő hétre
    const date = new Date(this.selectedDate);
    date.setDate(date.getDate() + 7);
    this.selectedDate = date;
    this.updateWeekLabel(date);
  }

  

  // Called from the calendar's selectedChange to close the dialog with the selected date
  handleCalendarSelect(event: any): void {
    const date = this.extractDateFromEvent(event);
    if (date) {
      this.currentDialogRef?.close(date);
    }
  }

  private applySelectedDate(date: Date): void {
    // Apply date synchronously now that dialog is closed
    const day = date.getDay();
    const monday = new Date(date);
    monday.setDate(date.getDate() - ((day + 6) % 7));
    this.selectedDate = monday;
    this.updateWeekLabel(monday);
    // ensure UI updates immediately
    try { this.cdRef.detectChanges(); } catch { /* ignore if not allowed */ }
  }

  private extractDateFromEvent(event: any): Date | null {
    if (!event) return null;
    if (event instanceof Date) return event;
    if (event.value instanceof Date) return event.value;
    if (event.selected instanceof Date) return event.selected;
    if (event.target && event.target.value) {
      const d = new Date(event.target.value);
      if (!isNaN(d.getTime())) return d;
    }
    return null;
  }
  copyWeek() {
    // TODO: implementálható
  }
  deleteWeek() {
    // TODO: implementálható
  }

  onEditMeal(event: {day: number, meal: number}) {
    // TODO: implementálható
  }
  onDeleteMeal(event: {day: number, meal: number}) {
    // TODO: implementálható
  }

  getSlot(day: Day, mealType: MealType): MealSlot | undefined {
    const menu = this.currentMenu;
    if (!menu) return undefined;
    return menu.slots.find(s => s.day === day && s.mealType === mealType);
  }

  getDayCalories(day: Day): number {
    const menu = this.currentMenu;
    if (!menu) return 0;
    return menu.slots
      .filter(s => s.day === day)
      .reduce((sum, s) => sum + (s.recipeCalories || 0), 0);
  }
}
