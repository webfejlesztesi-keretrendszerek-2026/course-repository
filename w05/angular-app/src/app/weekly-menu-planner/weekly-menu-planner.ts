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

export interface Recipe {
  title: string;
  image: string;
  time: string;
  calories: number;
}

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

  // Menü: [nap][étkezés] = Recipe | null
  menu: (Recipe | null)[][] = [
    [
      {
        title: 'Gyümölcsös zabkása',
        image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
        time: '10 perc',
        calories: 250
      },
      {
        title: 'Tojásrántotta',
        image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
        time: '15 perc',
        calories: 320
      },
      {
        title: 'Csirkés saláta',
        image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
        time: '20 perc',
        calories: 400
      }
    ],
    [
      {
        title: 'Sajtos szendvics',
        image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
        time: '8 perc',
        calories: 220
      },
      {
        title: 'Paradicsomos tészta',
        image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
        time: '25 perc',
        calories: 480
      },
      null
    ],
    [
      null,
      {
        title: 'Sült lazac',
        image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
        time: '30 perc',
        calories: 350
      },
      null
    ],
    [
      null,
      null,
      {
        title: 'Vegán curry',
        image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
        time: '40 perc',
        calories: 420
      }
    ],
    [
      {
        title: 'Túrós palacsinta',
        image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
        time: '18 perc',
        calories: 280
      },
      null,
      null
    ],
    [null, null, null],
    [null, null, null],
  ];

  weekLabel = this.formatWeekLabel(this.selectedDate);
  lastSaved = new Date();
  avgCalories = 1850;
  totalCookingTime = '4 óra 20 perc';

  currentDialogRef?: MatDialogRef<any>;

  constructor(public dialog: MatDialog, private cdRef: ChangeDetectorRef, private dateAdapter: DateAdapter<Date>) {}

  ngOnInit(): void {
    // register Hungarian locale and set date adapter locale so calendar shows Hungarian names
    try {
      registerLocaleData(localeHu);
    } catch {}
    try { this.dateAdapter.setLocale('hu'); } catch {}
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

  getDayCalories(dayIdx: number): number {
    return this.menu[dayIdx].reduce((sum, r) => sum + (r?.calories || 0), 0);
  }
}
