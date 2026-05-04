import { TestBed } from '@angular/core/testing'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { RecipeService } from './recipe.service'
import { ToastService } from './toast.service'
import { AuthService } from './auth.service'

vi.mock('firebase/firestore', () => ({
  getDocs: vi.fn(async () => ({ docs: [] })),
  query: vi.fn(() => ({})),
  collection: vi.fn(() => ({})),
  orderBy: vi.fn(() => ({})),
  getFirestore: vi.fn(() => ({})),
  doc: vi.fn(() => ({})),
  onSnapshot: vi.fn(() => ({})),
  addDoc: vi.fn(async () => ({})),
  serverTimestamp: vi.fn(() => ({})),
}))

const MOCK_RECIPES = [
  { id: 'r1', title: 'Apple Pie', description: 'A delicious apple dessert', categoryId: 'cat1', difficulty: 'könnyű', prepTime: 45 },
  { id: 'r2', title: 'Banana Bread', description: 'Sweet bread', categoryId: 'cat2', difficulty: 'közepes', prepTime: 60 },
  { id: 'r3', title: 'Caesar Salad', description: 'Fresh and healthy', categoryId: 'cat1', difficulty: 'könnyű', prepTime: 20 },
  { id: 'r4', title: 'Egg Omelette', description: 'Quick breakfast', categoryId: 'cat3', difficulty: 'könnyű', prepTime: 10 },
]

describe('RecipeService filtering and sorting', () => {
  let service: RecipeService

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RecipeService,
        { provide: ToastService, useValue: {} },
        { provide: AuthService, useValue: {} },
      ],
    })
    service = TestBed.inject(RecipeService)
  })

  it('returns empty array when no recipes', () => {
    // Arrange: no recipes added
    // Act
    const result = service.filteredRecipes()
    // Assert
    expect(result).toEqual([])
  })

  it('search term filters by title (case-insensitive substring)', () => {
    // Arrange: set local recipes without calling Firestore
    (service as any)._recipes.set([MOCK_RECIPES[0], MOCK_RECIPES[1]])
    // Act
    service.setSearchTerm('apple')
    const titles = service.filteredRecipes().map((r: any) => r.title)
    // Assert
    expect(titles).toEqual(['Apple Pie'])
  })

  it('search term filters by description', () => {
    // Arrange
    (service as any)._recipes.set([MOCK_RECIPES[0], MOCK_RECIPES[2]])
    // Act
    service.setSearchTerm('delicious')
    const titles = service.filteredRecipes().map((r: any) => r.title)
    // Assert
    expect(titles).toEqual(['Apple Pie'])
  })

  it('selectedCategory filters by categoryId', () => {
    // Arrange
    (service as any)._recipes.set([...MOCK_RECIPES])
    // Act
    service.setCategory('cat1')
    const titles = service.filteredRecipes().map((r: any) => r.title)
    // Assert
    expect(titles).toEqual(['Apple Pie', 'Caesar Salad'])
  })

  it("selectedDifficulty filters by difficulty (e.g. 'könnyű')", () => {
    // Arrange
    (service as any)._recipes.set([...MOCK_RECIPES])
    // Act
    service.setDifficulty('könnyű')
    const titles = service.filteredRecipes().map((r: any) => r.title)
    // Assert
    expect(titles).toEqual(['Apple Pie', 'Caesar Salad', 'Egg Omelette'])
  })

  it('maxPrepTime filters recipes with prepTime <= given minutes', () => {
    // Arrange
    (service as any)._recipes.set([...MOCK_RECIPES])
    // Act
    service.setMaxPrepTime(30)
    const titles = service.filteredRecipes().map((r: any) => r.title)
    // Assert
    expect(titles).toEqual(['Caesar Salad', 'Egg Omelette'])
  })

  it("sortBy='titleAsc' sorts recipes alphabetically by title", () => {
    // Arrange: custom small set to verify ordering
    (service as any)._recipes.set([
      { id: 'a', title: 'B Title', description: '', categoryId: '', difficulty: '', prepTime: 1 },
      { id: 'b', title: 'A Title', description: '', categoryId: '', difficulty: '', prepTime: 1 },
      { id: 'c', title: 'C Title', description: '', categoryId: '', difficulty: '', prepTime: 1 },
    ])
    // Act
    service.setSortBy('titleAsc')
    const titles = service.filteredRecipes().map((r: any) => r.title)
    // Assert
    expect(titles).toEqual(['A Title', 'B Title', 'C Title'])
  })

  it('multiple filters are combined with AND logic', () => {
    // Arrange: create recipes to ensure only one matches both filters
    (service as any)._recipes.set([
      { id: 'x1', title: 'Match', description: '', categoryId: 'catX', difficulty: 'könnyű', prepTime: 10 },
      { id: 'x2', title: 'NoMatchCat', description: '', categoryId: 'catY', difficulty: 'könnyű', prepTime: 10 },
      { id: 'x3', title: 'NoMatchDiff', description: '', categoryId: 'catX', difficulty: 'közepes', prepTime: 10 },
    ])
    // Act
    service.setCategory('catX')
    service.setDifficulty('könnyű')
    const titles = service.filteredRecipes().map((r: any) => r.title)
    // Assert
    expect(titles).toEqual(['Match'])
  })

  it('clearFilters() resets filters and returns all recipes', () => {
    // Arrange
    (service as any)._recipes.set([...MOCK_RECIPES])
    service.setSearchTerm('apple')
    service.setCategory('cat1')
    // Act
    service.clearFilters()
    const results = service.filteredRecipes()
    // Assert
    expect(results.length).toEqual(MOCK_RECIPES.length)
  })
})
