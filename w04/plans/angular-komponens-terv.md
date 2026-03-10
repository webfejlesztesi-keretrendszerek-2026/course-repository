# Angular Komponens Tervezet

## Fő komponensek
- **RecipeCatalogComponent**
  - SearchBarComponent
  - RecipeListComponent
  - RecipeDetailComponent
  - RecipeEditorComponent
- **WeeklyMenuPlannerComponent**
  - MenuCalendarComponent
  - MiniRecipeCardComponent
- **ShoppingListComponent**
  - ListSectionComponent
  - ListItemComponent
  - ListEditorComponent
- **ProfileComponent**

## Modulok és hierarchia

- RecipeCatalogComponent
  - Keresés, szűrés, listázás, részletek, szerkesztés
- WeeklyMenuPlannerComponent
  - Menü naptár, mini-recept kártyák
- ShoppingListComponent
  - Szekciók, lista elemek, szerkesztés
- ProfileComponent
  - Felhasználói profil és beállítások

## Navigáció
- Minden fő komponens külön route-on érhető el.
- A fő navigációval választható modulok.

---
Ez a tervezet a plans mappában található specifikációk és UI tervek alapján készült. A részletes implementáció során a komponensek egymásba ágyazása, adatátadás és routing is kidolgozásra kerül.