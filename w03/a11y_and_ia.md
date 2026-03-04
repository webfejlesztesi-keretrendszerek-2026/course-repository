# Accessibility & Information Architecture — Best Practices

> **Cél:** Ez a dokumentum keretrendszer-független referencia az akadálymentesítés (a11y) és az információs architektúra (IA) legjobb gyakorlataihoz. Add kontextusként az AI-nak, amikor webes felületet tervezel vagy implementálsz. A szabályok WCAG 2.1 AA szintet céloznak.

---

## 1. Alapelvek

### Semantic HTML first, ARIA only when needed

A böngésző a HTML-ből építi fel az Accessibility Tree-t — ez az a struktúra, amit a segédeszközök (screen reader, switch control, braille kijelző) olvasnak. Ha a HTML szemantikus, az Accessibility Tree automatikusan helyes. ARIA attribútumokat csak akkor használj, ha nincs natív HTML elem a feladatra.

### WCAG 2.1 AA — 4 alapelv (POUR)

- **Perceivable (észlelhető):** a tartalom minden felhasználó számára érzékelhető legyen (alt szöveg képekre, elegendő kontraszt, feliratok videókhoz)
- **Operable (kezelhető):** minden funkció elérhető billentyűzettel, elegendő idő áll rendelkezésre, a tartalom nem okoz rohamot
- **Understandable (érthető):** a szöveg olvasható, az alkalmazás viselkedése kiszámítható, a hibák megelőzhetők és javíthatók
- **Robust (robosztus):** a kód szabványos, különböző böngészők és segédeszközök is értelmezni tudják

---

## 2. Szemantikus HTML

### Landmark elemek

A landmark-ok a weboldal fő szerkezeti egységei. A screen reader felhasználók ezek között ugrálnak, mint fejezetek között egy könyvben. Minden oldalon legyen jelen a következő alapstruktúra:

```html
<body>
  <a class="skip-link" href="#main-content">Ugrás a tartalomra</a>

  <header>
    <nav aria-label="Fő navigáció">
      <!-- navigációs elemek -->
    </nav>
  </header>

  <main id="main-content">
    <h1>Oldal címe</h1>
    <!-- fő tartalom -->
  </main>

  <footer>
    <!-- lábjegyzet -->
  </footer>
</body>
```

### Mikor melyik elemet használd

| Elem | Szerep | Mikor használd |
|---|---|---|
| `<header>` | Banner / fejléc | Oldal vagy section fejléce |
| `<nav>` | Navigációs blokk | Ha több `<nav>` van az oldalon, `aria-label`-lel különböztesd meg őket |
| `<main>` | Fő tartalom | Oldalanként pontosan egy |
| `<section>` | Tematikus egység | Mindig legyen heading az elején (`h2`–`h6`) |
| `<article>` | Önálló tartalom | Kártya, bejegyzés, komment — ami önmagában is megállna |
| `<aside>` | Kiegészítő tartalom | Oldalsáv, kapcsolódó tartalom |
| `<footer>` | Lábléc | Oldal vagy section lábléce |

### Rossz vs. jó: struktúra összehasonlítás

```html
<!-- ROSSZ — div soup, az Accessibility Tree-ben láthatatlan struktúra -->
<div class="header">
  <div class="nav">
    <div class="nav-item" onclick="goTo('recipes')">Receptek</div>
  </div>
</div>
<div class="content">
  <div class="title">Receptek</div>
</div>

<!-- JÓ — szemantikus, a segédeszközök automatikusan értelmezik -->
<header>
  <nav aria-label="Fő navigáció">
    <a href="/receptek">Receptek</a>
  </nav>
</header>
<main>
  <h1>Receptek</h1>
</main>
```

---

## 3. Heading hierarchia

A heading-ek (`h1`–`h6`) a tartalom vázát adják. A screen reader felhasználók heading-ek között navigálnak — ez a tartalomjegyzékük.

### Szabályok

- Oldalanként pontosan egy `h1`
- A szintek sorrendben követik egymást: `h1` → `h2` → `h3`
- Szintet ugrani TILOS: `h1` után `h3` nem jöhet `h2` nélkül
- A heading szint a hierarchiát jelöli, NEM a vizuális méretet — a méretet CSS-ben állítsd

### Példa helyes heading struktúra

```
h1: Receptek
  h2: Szűrők
  h2: Recept lista
    h3: Paradicsomos spagetti
    h3: Csirkemell salátával
    h3: Túrós csusza
```

---

## 4. Interaktív elemek

### Gombok és linkek — helyes használat

```html
<!-- HELYES — natív button műveletre -->
<button type="button" onclick="applyFilter()">Szűrés</button>

<!-- HELYES — natív link navigációra -->
<a href="/recept/123">Recept megtekintése</a>

<!-- HELYTELEN — div mint gomb -->
<div class="btn" onclick="applyFilter()">Szűrés</div>

<!-- HELYTELEN — link amit gombnak használunk -->
<a href="#" onclick="applyFilter(); return false;">Szűrés</a>
```

**Alapszabály:** `<button>` = műveletet hajt végre. `<a>` = navigál valahová. `<div>` és `<span>` = NEM interaktív elem, soha ne legyen kattintható.

### Miért számít ez?

A natív `<button>` automatikusan biztosítja, hogy:
- Fókuszálható Tab billentyűvel
- Aktiválható Enter és Space billentyűvel
- A screen reader "gomb"-ként jelenti be
- Megjelenik az Accessibility Tree-ben helyes role-lal

Egy `<div onclick>` ezek közül semmit nem ad. Még ha `role="button"` és `tabindex="0"` attribútumokkal kiegészíted, akkor is neked kell implementálni az Enter és Space kezelést. A natív elem mindig jobb.

---

## 5. Billentyűzetes navigáció

Minden interaktív elem elérhető kell legyen billentyűzettel. Ez nem extra funkció, hanem alapkövetelmény.

### Alapvető billentyűk

| Billentyű | Funkció |
|---|---|
| `Tab` | Következő interaktív elemre lépés |
| `Shift + Tab` | Előző interaktív elemre lépés |
| `Enter` | Link aktiválása, gomb megnyomása |
| `Space` | Gomb megnyomása, checkbox toggle |
| `Escape` | Modal, dropdown, dialog bezárása |
| `Arrow keys` | Lista, tab panel, rádiógomb csoporton belüli navigáció |

### tabindex értékek

| Érték | Viselkedés | Mikor használd |
|---|---|---|
| Nincs megadva | Natív interaktív elemek (button, a, input) automatikusan a tab sorrendben | Alapértelmezett — a legtöbb esetben ez kell |
| `tabindex="0"` | Bekerül a természetes tab sorrendbe | Nem-interaktív elemre, amit fókuszálhatóvá kell tenni (ritka) |
| `tabindex="-1"` | Programozottan fókuszálható, de Tab-bal nem érhető el | Modal megnyitás, route váltás utáni fókuszkezelés |
| `tabindex="1+"` | **SOHA NE HASZNÁLD** | Felborítja a természetes sorrendet, kaotikus navigációt okoz |

### Focus stílusok

```css
/* TILOS — globálisan eltávolítani a fókusz jelzőt */
/* *:focus { outline: none; }  ← SOHA */

/* HELYES — focus-visible: csak billentyűzetes navigációnál jelenik meg */
:focus-visible {
  outline: 2px solid var(--color-focus, #1a73e8);
  outline-offset: 2px;
}
```

A `:focus-visible` pszeudo-osztály a modern megoldás: billentyűzettel navigálva megjelenik a fókusz jelző, egérkattintásnál nem. Ha az AI `outline: none`-t generál, az törlendő.

---

## 6. Skip link

A skip link lehetővé teszi, hogy a billentyűzetes felhasználó átugorja a navigációt és egyből a fő tartalomra kerüljön. Az oldal legelső eleme, vizuálisan rejtett, fókuszra megjelenik.

```html
<a class="skip-link" href="#main-content">Ugrás a tartalomra</a>
```

```css
.skip-link {
  position: absolute;
  top: -100%;
  left: 0;
  z-index: 1000;
  padding: 0.75rem 1.5rem;
  background: var(--color-primary);
  color: var(--color-on-primary);
  font-weight: 600;
  text-decoration: none;
}

.skip-link:focus {
  top: 0;
}
```

---

## 7. ARIA attribútumok

### Aranyszabály

Ha van natív HTML elem a feladatra, azt használd. ARIA nem ad funkciót, csak információt — a screen readernek szól, de nem változtat a viselkedésen.

```html
<!-- FELESLEGES ARIA — a natív button már mindent tud -->
<button role="button">Mentés</button>

<!-- HELYES — ARIA nélkül, a natív elem elég -->
<button>Mentés</button>
```

### Mikor kell ARIA

Akkor kell, ha nincs natív HTML elem a funkcióra, vagy ha extra kontextust kell adni a segédeszközöknek.

### Legfontosabb attribútumok

#### aria-label — név adása, ha nincs látható szöveg

```html
<!-- Ikon gomb — a screen reader nem látja az ikont -->
<button aria-label="Recept törlése">
  <svg><!-- trash icon --></svg>
</button>

<!-- Több nav elem megkülönböztetése -->
<nav aria-label="Fő navigáció">...</nav>
<nav aria-label="Lábjegyzet linkek">...</nav>
```

#### aria-describedby — leírás hozzákapcsolása

```html
<label for="email">Email cím</label>
<input id="email" type="email" aria-describedby="email-error" aria-invalid="true" />
<p id="email-error" class="error">Kérlek adj meg egy érvényes email címet.</p>
```

Az `aria-describedby` a megadott id-jú elem szövegét olvassa fel kiegészítő leírásként. Ideális form hibaüzenetekhez és segítő szövegekhez.

#### aria-live — dinamikus tartalom változás bejelentése

```html
<!-- Keresési találatok száma — screen reader bejelenti ha változik -->
<p aria-live="polite">12 recept található.</p>
```

- `polite` — megvárja amíg a screen reader befejezi az aktuális mondatot (legtöbb esetben ez kell)
- `assertive` — azonnal megszakítja a felolvasást (csak sürgős hibaüzenetekre)

#### aria-expanded — nyitható/zárható elemek állapota

```html
<button aria-expanded="false" aria-controls="filter-panel">Szűrők</button>
<div id="filter-panel" hidden>
  <!-- szűrő tartalom -->
</div>
```

#### aria-current — aktuális navigációs elem jelzése

```html
<nav aria-label="Fő navigáció">
  <a href="/" aria-current="page">Receptek</a>
  <a href="/heti-menu">Heti menü</a>
  <a href="/lista">Bevásárlólista</a>
</nav>
```

---

## 8. Formok

A formok a legkritikusabb felületek accessibility szempontból, mert itt kérünk adatot a felhasználótól.

### Alapszabályok

```html
<!-- Minden input-nak KELL label — explicit for/id kapcsolattal -->
<label for="recipe-title">Recept neve</label>
<input id="recipe-title" type="text" required aria-describedby="title-hint" />
<p id="title-hint" class="hint">Legalább 3 karakter.</p>
```

- **Minden `<input>`-nak kell `<label>`** — a `placeholder` NEM helyettesíti a label-t
- **Hibaüzenet `aria-describedby`-val** legyen az input-hoz kötve
- **`aria-invalid="true"`** jelezze, ha a mező hibás állapotban van
- **Hibajelzés ne csak szín legyen** — ikon + szöveg + szegély együtt

### Összetartozó mezők csoportosítása

```html
<fieldset>
  <legend>Étkezési preferenciák</legend>
  <label><input type="checkbox" value="vegetarian" /> Vegetáriánus</label>
  <label><input type="checkbox" value="vegan" /> Vegán</label>
  <label><input type="checkbox" value="gluten-free" /> Gluténmentes</label>
</fieldset>
```

### Hibaüzenet minta

```html
<label for="email">Email cím</label>
<input
  id="email"
  type="email"
  aria-describedby="email-error"
  aria-invalid="true"
/>
<p id="email-error" class="error">
  ⚠️ Kérlek adj meg egy érvényes email címet.
</p>
```

---

## 9. Képek

```html
<!-- Tartalmi kép — leíró alt szöveg, ami a kép által közölt információt adja át -->
<img src="spaghetti.jpg" alt="Paradicsomos spagetti fehér tányéron, friss bazsalikommal" />

<!-- Dekoratív kép — üres alt, a screen reader átugorja -->
<img src="decorative-divider.svg" alt="" />
```

### Szabályok

- Ha a kép információt hordoz: az `alt` írja le, amit a kép közöl
- Ha a kép tisztán dekoratív: `alt=""` (üres string, de az attribútum legyen ott)
- Ne írd az alt-ba: "kép", "fotó", "illusztráció" — a screen reader amúgy is bejelenti, hogy kép
- Ha a kép szöveget tartalmaz: az alt-ban szerepeljen a szöveg tartalma
- Nagy képlistáknál (pl. recept kártyák): `loading="lazy"` a hajtás alatti képekre

---

## 10. Szín és kontraszt

### Minimum kontraszt arányok (WCAG AA)

| Elem típus | Minimum arány |
|---|---|
| Normál szöveg (< 18px, vagy < 14px bold) | 4.5:1 |
| Nagy szöveg (≥ 18px, vagy ≥ 14px bold) | 3:1 |
| UI elemek, ikonok, szegélyek | 3:1 |

### Ne csak színnel közölj információt

```html
<!-- ROSSZ — csak piros szegély jelzi a hibát, színtévesztő nem érzékeli -->
<input style="border-color: red;" />

<!-- JÓ — szín + ikon + szöveg + aria együtt -->
<input aria-invalid="true" aria-describedby="error-msg" />
<p id="error-msg" class="error">⚠️ Kötelező mező.</p>
```

### Felhasználói preferenciák tiszteletben tartása

```css
/* Sötét téma — rendszer beállítás követése */
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #1a1a2e;
    --color-text: #e0e0e0;
    --color-surface: #16213e;
  }
}

/* Csökkentett mozgás — animációk letiltása */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 11. Screen reader only szöveg

Vizuálisan rejtett, de screen reader által felolvasott szöveg. Akkor használd, amikor a vizuális kontextus (ikon, elrendezés) egyértelmű a látó felhasználónak, de a screen reader extra szöveget igényel.

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

```html
<!-- Ikon gomb kiegészítő szöveggel -->
<button>
  <svg aria-hidden="true"><!-- edit icon --></svg>
  <span class="sr-only">Recept szerkesztése</span>
</button>

<!-- Dinamikus eredmény bejelentése -->
<p class="sr-only" aria-live="polite">12 recept található a szűrők alapján.</p>
```

---

## 12. Fókuszkezelés

### Modal / dialog megnyitáskor

1. Mentsd el, melyik elem nyitotta meg a modalt
2. Fókuszálj a modal elemre (vagy az első interaktív elemére)
3. A Tab billentyű a modalon belül maradjon (focus trap)
4. Escape billentyűre záródjon be
5. Bezáráskor a fókusz térjen vissza a kiváltó elemre

```html
<div role="dialog" aria-modal="true" aria-labelledby="modal-title" tabindex="-1">
  <h2 id="modal-title">Recept kiválasztása</h2>
  <!-- tartalom -->
  <button>Bezárás</button>
</div>
```

### SPA route váltás

Egyoldalas alkalmazásban az oldal nem töltődik újra navigációkor, ezért a fókuszt manuálisan kell a fő tartalomra (`<main>`) helyezni route váltás után. A `<main>` elemnek `tabindex="-1"` kell, hogy programozottan fókuszálható legyen.

---

## 13. Information Architecture

### Mi az IA?

A tartalom szervezése, struktúrálása és címkézése úgy, hogy a felhasználó megtalálja, amit keres. Nem vizuális design — hanem a mögöttes rendszer, amiből a navigáció, a heading struktúra és a routing következik.

### Tervezési lépések

1. **Tartalom leltár:** milyen tartalomtípusok vannak az alkalmazásban
2. **Csoportosítás:** logikai egységek kialakítása (modulok, szekciók)
3. **Hierarchia:** fő oldalak és aloldalak viszonya — sitemap fa-diagram formájában
4. **Címkézés:** konzisztens, kiszámítható elnevezések a navigációban és az oldalakon
5. **Navigáció tervezése:** hogyan jut el a felhasználó A-ból B-be

### Sitemap sablon

```
App neve
├── Főoldal (/)
│   ├── Elem részletek (/:id)
│   ├── Új elem létrehozása (/uj)
│   └── Elem szerkesztése (/:id/szerkesztes)
├── Második modul (/modul-2)
├── Harmadik modul (/modul-3)
├── Profil (/profil)
├── Bejelentkezés (/login)
├── Regisztráció (/regisztracio)
└── 404 oldal (**)
```

### URL struktúra szabályai

- Legyen olvasható és kiszámítható: `/recept/uj`, nem `/r/n`
- Tükrözze a hierarchiát: `/recept/123/szerkesztes` → a recept al-útvonala
- Kisbetű és kötőjel: `/heti-menu`, nem `/hetiMenu` vagy `/Heti_Menu`

### Navigációs minták

- **Desktop:** felső navbar — logo bal oldalon, navigáció középen, profil jobb oldalon
- **Mobile:** bottom navigation bar (4-5 ikon + rövid label) — a hüvelykujj könnyen eléri, mindig látható
- **Aktív állapot:** az aktuális oldal vizuálisan kiemelve + `aria-current="page"` a screen readernek

### IA és accessibility kapcsolata

| IA döntés | Hogyan jelenik meg a kódban |
|---|---|
| Oldal hierarchia | Heading struktúra (`h1` → `h2` → `h3`) |
| Fő modulok | Landmark elemek (`nav`, `main`, `section`) |
| Navigációs elemek | `aria-label`, `aria-current="page"` |
| Tartalom csoportosítás | `<section>` + heading, `<article>`, `<fieldset>` |
| Sitemap / routing | Skip link, fókuszkezelés route váltáskor |

---

## 14. Ellenőrzési eszközök

| Eszköz | Mire jó | Hogyan használd |
|---|---|---|
| **axe DevTools** (böngésző extension) | Automatikus WCAG audit | Futtatás → hibák javítása → újra futtatás |
| **Lighthouse** (Chrome DevTools) | Accessibility pontszám és javaslatok | Accessibility tab → 90+ a cél |
| **Keyboard teszt** | Tab navigáció ellenőrzése | Tedd el az egeret, Tab-olj végig az oldalon |
| **WebAIM Contrast Checker** | Kontraszt arány ellenőrzése | Előtér + háttérszín megadása → arány leolvasása |
| **Screen reader** | Valós segédeszköz teszt | NVDA (Windows, ingyenes) vagy VoiceOver (Mac, beépített) |

**Fontos:** Az automatikus eszközök (axe, Lighthouse) a WCAG hibák kb. 30-40%-át találják meg. A maradék manuális ellenőrzést igényel: logikus heading struktúra, értelmes tab sorrend, kontextusnak megfelelő szövegek.

---

## 15. Tipikus AI-generált accessibility hibák

Ezekre figyelj, amikor AI-generált kódot kapsz:

1. **`<div onclick>` gomb vagy link helyett** — nincs fókusz, nincs billentyűzet kezelés
2. **Hiányzó `<label>` input mezőkön** — placeholder nem helyettesíti
3. **Heading szintek ugrálása** — `h1` után rögtön `h4`
4. **`outline: none` globálisan** — láthatatlanná teszi a fókusz jelzőt
5. **Hiányzó `alt` szöveg képeken** — vagy értelmetlen alt ("image1.jpg")
6. **Alacsony kontraszt** — divatos világosszürke szöveg fehér háttéren
7. **Hiányzó `aria-live`** — dinamikus tartalom változik, de a screen reader nem tud róla
8. **Felesleges ARIA** — `role="button"` egy `<button>` elemen (redundáns, zavaró)

---