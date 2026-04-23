# Adatmodell (Firestore)

Rövid bevezető

- Ez a projekt Firestore NoSQL adatbázist használ. Az olvasási teljesítmény és a egyszerű UI megjelenítés miatt a modellen belül denormalizálunk ott, ahol a felhasználói felület gyors és egyszerű lekérdezést igényel (például recept nevét vagy képet beágyazni a heti menü slotjába, illetve összegzett bevásárlólista tételekhez denormalizált nevet, kategóriát tárolni).

---

## Entitások

Minden entitásnál: Entitás név — Firestore kollekció — rövid leírás

### User — `users`
- Rövid: Alkalmazás felhasználó és beállításai (preferences) tárolása.

| Mező | Típus | Leírás | Kötelező? |
|---|---|---:|---:|
| uid | string | Felhasználó azonosító (auth UID) | Igen |
| name | string | Felhasználó megjelenítendő neve | Igen |
| email | string | Email cím | Igen |
| avatarUrl | string \| null | Profilkép URL vagy null | Nem |
| preferences | object | Felhasználói beállítások (lásd alább) | Igen |
| createdAt | string | Létrehozás ideje // Firestore Timestamp | Igen |
| updatedAt | string | Utolsó módosítás // Firestore Timestamp | Nem |

Beágyazott `preferences` mező (részletek):

| Mező | Típus | Leírás | Kötelező? |
|---|---|---:|---:|
| diet | string[] | Diétás címkék (pl. `"vegetarian"`) | Nem |
| dailyCalorieGoal | number | Napi kalória cél | Nem |
| householdSize | number | Háztartás mérete | Nem |
| measurementSystem | 'metric'|'imperial' | Mértékegység rendszer | Nem |
| theme | 'light'|'dark'|'system' | UI téma választás | Nem |

---

### Category — `categories`
- Rövid: Címkék és kategóriák mind receptekhez, mind hozzávalókhoz.

| Mező | Típus | Leírás | Kötelező? |
|---|---|---:|---:|
| id | string | Dokumentum azonosító | Igen |
| name | string | Kategória megjelenítendő neve | Igen |
| type | 'recipe'|'ingredient' | Kategória típusa | Igen |
| icon | string | Emoji vagy rövid ikon string | Nem |
| sortOrder | number | Rendezési index | Nem |
| createdBy | string \| null | Létrehozó UID | Nem |
| createdAt | string | Létrehozás ideje // Firestore Timestamp | Igen |

---

### Ingredient — `ingredients`
- Rövid: Hozzávalók központi listája (alapegységek, kategória hivatkozás).

| Mező | Típus | Leírás | Kötelező? |
|---|---|---:|---:|
| id | string | Dokumentum azonosító | Igen |
| name | string | Hozzávaló neve | Igen |
| categoryId | string | Hivatkozás `categories` (type='ingredient') | Nem |
| defaultUnit | string | Alapértelmezett mértékegység (pl. 'g', 'db') | Nem |
| createdBy | string | Létrehozó UID | Nem |
| createdAt | string | Létrehozás ideje // Firestore Timestamp | Igen |

---

### RecipeIngredient (al-interface)
- Rövid: Recept hozzávaló sor egy recepten belül (denormalizált név).

| Mező | Típus | Leírás | Kötelező? |
|---|---|---:|---:|
| ingredientId | string | Hivatkozás `ingredients` dokumentumra | Nem |
| ingredientName | string | Denormalizált név a gyors megjelenítéshez | Igen |
| amount | number | Mennyiség | Igen |
| unit | string | Mértékegység | Igen |

---

### Recipe — `recipes`
- Rövid: Receptek és azok részletei (összetevők, elkészítés, tápérték).

| Mező | Típus | Leírás | Kötelező? |
|---|---|---:|---:|
| id | string | Dokumentum azonosító | Igen |
| title | string | Recept címe | Igen |
| description | string | Részletes leírás | Igen |
| imageUrl | string | Kép URL | Nem |
| categoryId | string | Hivatkozás `categories` (type='recipe') | Nem |
| difficulty | 'könnyű'|'közepes'|'haladó' | Nehézségi szint | Nem |
| prepTime | number | Előkészítési idő (perc) | Nem |
| calories | number | Összes kalória | Nem |
| servings | number | Adagok száma | Nem |
| diet | string[] | Diéta címkék | Nem |
| nutrition | object | Egyszerű tápérték (protein/carbs/fat) | Nem |
| ingredients | RecipeIngredient[] | Hozzávalók listája (lásd feljebb) | Nem |
| steps | string[] | Lépések, egyszerű tömb | Nem |
| ownerId | string | Tulajdonos UID | Nem |
| isPublic | boolean | Nyilvános recept-e | Nem |
| createdAt | string | Létrehozás ideje // Firestore Timestamp | Igen |
| updatedAt | string | Utolsó módosítás // Firestore Timestamp | Nem |

`nutrition` mező:

| Mező | Típus | Leírás |
|---|---|---:|
| protein | number | Fehérje (g) |
| carbs | number | Szénhidrát (g) |
| fat | number | Zsír (g) |

---

### WeeklyMenu — `weeklyMenus`
- Rövid: Felhasználó heti menüje, slotokkal nap/étkezés szerint.

| Mező | Típus | Leírás | Kötelező? |
|---|---|---:|---:|
| id | string | Dokumentum azonosító | Igen |
| userId | string | Tulajdonos UID | Igen |
| weekStart | string | Hétfő dátuma ISO formátumban | Igen |
| slots | MealSlot[] | Menü slotok tömbje (lásd alább) | Igen |
| createdAt | string | Létrehozás ideje // Firestore Timestamp | Igen |
| updatedAt | string | Utolsó módosítás // Firestore Timestamp | Nem |

#### MealSlot (al-interface)

| Mező | Típus | Leírás | Kötelező? |
|---|---|---:|---:|
| day | 'hetfo'|'kedd'|'szerda'|'csutortok'|'pentek'|'szombat'|'vasarnap' | Nap | Igen |
| mealType | 'reggeli'|'ebed'|'vacsora' | Étkezés típus | Igen |
| recipeId | string \| null | Hivatkozott recept ID (vagy null ha üres) | Nem |
| recipeTitle | string \| null | Denormalizált recept cím gyors megjelenítéshez | Nem |
| recipeImageUrl | string \| null | Denormalizált kép URL | Nem |
| recipePrepTime | number \| null | Denormalizált előkészítési idő (perc) | Nem |
| recipeCalories | number \| null | Denormalizált kalóriaérték | Nem |

---

### ShoppingItem (al-interface)
- Rövid: Bevásárlólisták tételeinek egyedi leírása (összesített mennyiség).

| Mező | Típus | Leírás | Kötelező? |
|---|---|---:|---:|
| id | string | Tétel azonosító (lokális/dokumentum szintű) | Igen |
| ingredientId | string \| undefined | Hivatkozás `ingredients`-re ha van | Nem |
| ingredientName | string | Denormalizált név megjelenítéshez | Igen |
| totalAmount | number | Összegzett mennyiség | Igen |
| unit | string | Mértékegység | Igen |
| categoryId | string \| undefined | Kategória hivatkozás | Nem |
| categoryName | string \| undefined | Denormalizált kategória név | Nem |
| checked | boolean | Megvásárolt státusz | Igen |
| isManual | boolean | Kézzel hozzáadott tétel-e | Igen |
| fromRecipeIds | string[] | Hivatkozó receptek ID-i | Nem |

---

### ShoppingList — `shoppingLists`
- Rövid: Felhasználó vagy heti menühöz tartozó bevásárlólista.

| Mező | Típus | Leírás | Kötelező? |
|---|---|---:|---:|
| id | string | Dokumentum azonosító | Igen |
| userId | string | Tulajdonos UID | Igen |
| weeklyMenuId | string \| undefined | Hivatkozott WeeklyMenu | Nem |
| items | ShoppingItem[] | Lista tételek | Igen |
| generatedAt | string | Lista generálásának ideje // Firestore Timestamp | Igen |
| updatedAt | string | Utolsó módosítás // Firestore Timestamp | Nem |

---

### Units (enum)
- Rövid: Alap mértékegységek listája (használható UI megjelenítéshez és konverziók alapjául).

Példa enum értékek (kódban): `Piece='db'`, `Gram='g'`, `Kilogram='kg'`, `Slice='szelet'`, `Package='csomag'`, `Teaspoon='tk'`, `Tablespoon='ek'`, `Liter='l'`.

---

## Kapcsolatok

| Kapcsolat | Típus | Leírás |
|---|---|---:|
| Recipe.categoryId → Category.id | 1:N (Recipe → Category) | Recept kategória hivatkozás; denormalizálás miatt kategória név gyakran beágyazott a kliens oldalon is.
| Ingredient.categoryId → Category.id | 1:N (Ingredient → Category) | Hozzávaló kategória hivatkozás.
| Recipe.ingredients[].ingredientId → Ingredient.id | N:1 | Recept hozzávaló hivatkozhat központi `ingredients`-re; ugyanakkor `ingredientName` denormalizált a gyors megjelenítéshez.
| WeeklyMenu.userId → User.uid | N:1 | Heti menü tulajdonosa.
| WeeklyMenu.slots[].recipeId → Recipe.id | N:1 | Slotok hivatkoznak receptekre; denormalizált mezők (`recipeTitle`, `recipeImageUrl`) csökkentik a lekérések számát.
| ShoppingList.userId → User.uid | N:1 | Bevásárlólista tulajdonosa.
| ShoppingItem.ingredientId → Ingredient.id | N:1 | Bevásárló tétel esetén kapcsolat a központi hozzávalóhoz; gyakori denormalizáció: `ingredientName`, `categoryName`.
| ShoppingItem.fromRecipeIds → Recipe.id[] | N:M | Mely receptekhez kapcsolódik a tétel (összegzés miatt)

### Denormalizálási döntések
- A UI gyors renderelésére denormalizáljuk a gyakori megjelenítendő mezőket: `ingredientName` a `RecipeIngredient`-ben, `recipeTitle` és `recipeImageUrl` a `MealSlot`-ban, `categoryName` a `ShoppingItem`-ben. Ez csökkenti a dokumentumok közti lekérések számát és egyszerűsíti a komponenseket.
- A denormalizált mezők frissítése szükség esetén aszinkron szinkronizációt igényel (pl. ha egy recept címe megváltozik, a WeeklyMenu-ban lévő denormalizált cím nem automatikusan frissül). Frissítési stratégiát (batch, cloud function vagy manuális frissítés) a projekt igénye szerint kell kialakítani.

---

## Entitás-kapcsolati diagram (Mermaid)

```mermaid
flowchart LR
  User[User]
  Category[Category]
  Ingredient[Ingredient]
  Recipe[Recipe]
  WeeklyMenu[WeeklyMenu]
  ShoppingList[ShoppingList]

  User -->|userId| WeeklyMenu
  User -->|userId| ShoppingList
  Category -->|id| Ingredient
  Category -->|id| Recipe
  Ingredient -->|id| Recipe
  Recipe -->|id| WeeklyMenu
  Recipe -->|id[]| ShoppingList
  Ingredient -->|id| ShoppingList

  classDef entity fill:#f9f,stroke:#333,stroke-width:1px;
  class User,Category,Ingredient,Recipe,WeeklyMenu,ShoppingList entity;
```

---

Készenléti megjegyzés

- Az itt leírt mezők a TypeScript interfészek alapján készültek; a Firestore kollekciónevek javasoltak az implementációhoz (`users`, `categories`, `ingredients`, `recipes`, `weeklyMenus`, `shoppingLists`).
- Dátum mezők ISO stringként szerepelnek a modellben; Firestore-nál javasolt a `Timestamp` típus használata a pontos lekérdezésekhez és indexeléshez.


---

Vége.
