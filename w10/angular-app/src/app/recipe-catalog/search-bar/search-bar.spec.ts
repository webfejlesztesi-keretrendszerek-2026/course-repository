import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TestBed as AngularTestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { SearchBar } from './search-bar';
import { RecipeService } from '../../services/recipe.service';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../services/auth.service';

// Ensure Firestore SDK is mocked in this spec too (some bundling paths import it)
vi.mock('firebase/firestore', () => ({
  getFirestore: () => ({}),
  collection: () => ({}),
  query: () => ({}),
  orderBy: () => ({}),
  where: () => ({}),
  getDocs: async () => ({ docs: [] }),
  addDoc: async () => ({}),
  serverTimestamp: () => ({}),
  doc: () => ({}),
  getDoc: async () => ({ exists: () => false, data: () => null }),
  updateDoc: async () => {},
  deleteDoc: async () => {},
  onSnapshot: (_q: any, _next?: any) => () => {},
}));

describe('SearchBar (integration)', () => {
  let fixture: ComponentFixture<SearchBar>;
  let component: SearchBar;
  let recipeService: RecipeService;

  beforeEach(async () => {
    // Provide real RecipeService, but stub ToastService and AuthService
    await TestBed.configureTestingModule({
      imports: [SearchBar],
      providers: [
        { provide: ToastService, useValue: {} },
        { provide: AuthService, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchBar);
    component = fixture.componentInstance;
    // inject the real service instance
    recipeService = TestBed.inject(RecipeService);
    // initialize view
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetAllMocks();
  });

  it('updates recipeService.searchTerm() after 300ms debounce (299ms no, 300ms yes)', async () => {
    vi.useFakeTimers();

    // initial should be empty
    expect(recipeService.searchTerm()).toBe('');

    component.inputValue = 'pasta';
    component.onInputChange();

    // advance 299ms -> still not updated
    vi.advanceTimersByTime(299);
    expect(recipeService.searchTerm()).toBe('');

    // advance 1ms -> now it should update
    vi.advanceTimersByTime(1);
    // run pending timers (the debounce) and allow microtasks to flush
    vi.runOnlyPendingTimers();
    await Promise.resolve();
    expect(recipeService.searchTerm()).toBe('pasta');
  });

  it('clearSearch() immediately clears searchTerm synchronously', async () => {
    vi.useFakeTimers();

    // set a pending debounce by changing input
    component.inputValue = 'soup';
    component.onInputChange();

    // Immediately call clearSearch() which should cancel debounce and set empty
    component.clearSearch();

    expect(recipeService.searchTerm()).toBe('');

    // Even after advancing time, nothing should change
    vi.advanceTimersByTime(500);
    await fixture.whenStable();
    expect(recipeService.searchTerm()).toBe('');
  });
});
