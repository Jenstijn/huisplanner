# Huisplanner

Een webapp waarmee gebruikers hun nieuwe huis kunnen inrichten.

## Project Overzicht

Dit project is een interactieve webapp voor huisinrichting. Gebruikers kunnen:
- Plattegronden van kamers maken
- Meubels en decoratie plaatsen
- Verschillende indelingen uitproberen
- Hun ontwerpen opslaan en delen

## Tech Stack

- **Frontend**: React met TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context
- **Canvas/Visualisatie**: React-Konva
- **Build Tool**: Vite
- **Backend/Database**: Firebase (Firestore + Authentication)
- **Hosting**: Vercel (automatische deploys vanuit GitHub)

## Live Deployment

- **URL**: https://huisplanner.vercel.app
- **Auto-deploy**: Push naar `main` branch → Vercel bouwt en deployt automatisch
- **Firebase Project**: huisplanner-21925

## Projectstructuur

```
huisplanner/
├── src/
│   ├── components/     # React componenten (Plattegrond, MeubelLijst, LoginScherm, etc.)
│   ├── contexts/       # React Context providers (AuthContext)
│   ├── firebase/       # Firebase configuratie
│   ├── hooks/          # Custom React hooks (usePlattegrond voor Firestore sync)
│   ├── utils/          # Hulpfuncties (snapLogic)
│   ├── types/          # TypeScript types
│   ├── data/           # Statische data (appartement layout, meubels)
│   └── App.tsx         # Hoofdcomponent met auth flow
├── public/             # Statische bestanden
├── .env.local          # Firebase credentials (NIET in Git!)
├── package.json
└── README.md
```

## Development Commands

```bash
# Installeer dependencies
npm install

# Start development server
npm run dev

# Build voor productie
npm run build

# Run linter
npm run lint
```

## Code Conventies

- Gebruik functionele React componenten met hooks
- Schrijf TypeScript met strikte types
- Componentnamen in PascalCase
- Bestanden en mappen in kebab-case
- Voeg Nederlandse comments toe waar nodig voor duidelijkheid

## Belangrijke Notities

- Dit project wordt gebouwd door iemand zonder codeerervaring
- Houd code simpel en goed gedocumenteerd
- Vermijd over-engineering
- Focus op een werkende MVP eerst

## Testing Workflow

Bij het bouwen van nieuwe features moet je altijd je eigen werk testen:

1. **Start de dev server** als deze nog niet draait (`npm run dev`)
2. **Open de app in de browser** via de Chrome-extensie (navigeer naar http://localhost:5173)
3. **Test de functionaliteit** visueel door:
   - Screenshots te maken
   - Interacties uit te voeren (klikken, slepen, formulieren invullen)
   - Te controleren of de UI correct rendert
4. **Fix eventuele fouten** direct als je ze tegenkomt
5. **Bevestig pas dat iets klaar is** nadat je het werkend hebt gezien in de browser

Dit voorkomt dat er bugs worden opgeleverd die pas later ontdekt worden.

## Lessons Learned

### Event Handling in React-Konva
- Gebruik `e.cancelBubble = true` om event propagation te stoppen in Konva Group onClick handlers
- Specifieke element handlers (Group onClick) triggeren VOOR Stage onClick
- Reset state NA succesvolle acties, niet ervoor - dit voorkomt race conditions

### Drag & Drop Implementatie
- Native HTML5 drag werkt goed samen met Konva canvas
- Drop zone vereist `onDragOver` met `e.preventDefault()` om drops te accepteren
- Ghost preview via `setDragImage()` met een tijdelijk DOM element dat na 0ms wordt verwijderd
- `e.dataTransfer.setData('application/json', ...)` voor meubel data overdracht

### Snap Functionaliteit
- Snap threshold van 20cm (0.2m) voelt natuurlijk aan voor muur-snap
- Stoelen 15cm inschuiven onder tafel ziet er realistisch uit
- Combineer snap prioriteiten: tafel-snap > muur-snap
- Bereken overlap met muren door te controleren of meubel binnen muur bounds valt

### State Management Patronen
- Houd "te plaatsen meubel" (`tePlaatsenMeubelId`) en "geselecteerd geplaatst meubel" (`geselecteerdItemId`) strict gescheiden
- Custom afmetingen apart bijhouden van meubel ID selectie (`customAfmetingen` state)
- Reset plaatsingsmodus NA plaatsing, niet tijdens - voorkomt bugs bij meubel selectie

### Meubel Afmetingen Systeem
- `beschikbareAfmetingen?: AfmetingOptie[]` voor preset maten (dropdown)
- `handmatigeAfmetingen?: boolean` voor custom invoer met min/max validatie
- `customBreedte` en `customHoogte` op `GeplaatstMeubel` voor opslag van gekozen maten
- Altijd fallback naar standaard meubel afmetingen: `item.customBreedte ?? meubel.breedte`

### React-Konva Renderers
- Maak herbruikbare render functies per meubel type (bank, tafel, stoel, etc.)
- Gebruik een `meubelRenderers` map om icoon-string naar renderer te mappen
- Geef `width`, `height`, en `isSelected` door als props voor flexibiliteit
- L-vormige meubels (hoekbank) vereisen meerdere Rect componenten

### TypeScript Best Practices
- Definieer interfaces in aparte `types/index.ts` voor herbruikbaarheid
- Gebruik `categorie?: 'woonkamer' | 'slaapkamer' | 'eetkamer' | 'accessoires'` voor type-safe categorieën
- Optional chaining (`meubel?.beschikbareAfmetingen?.[index]`) voor veilige data access

### Chaise Longue vs Hoekbank (Fout Geleerd)
- **FOUT:** Chaise longue eerst geïmplementeerd als L-vormige bank (hoekbank)
- **CORRECT:** Chaise longue is een rechte bank met verlengd liggedeelte aan één kant
- Het ligdeel steekt NAAR VOREN uit (grotere diepte), niet OPZIJ
- Bij onbekende meubeltypes: eerst visuele referentie opzoeken voordat je gaat bouwen

### Konva Rotatie met Center Pivot (Fout Geleerd)
- **FOUT:** Default Konva rotatie draait om top-left corner (0,0 van Group)
- **CORRECT:** Gebruik `offsetX={width/2}` en `offsetY={height/2}` voor center rotatie
- Compenseer offset door `+ width/2` bij x en `+ height/2` bij y te tellen
- Drag handlers moeten rekening houden met offset bij positie berekening:
  - Bij lezen: `(e.target.x() - OFFSET_X - width/2) / PIXELS_PER_METER`
  - Bij schrijven: `finalX * PIXELS_PER_METER + OFFSET_X + width/2`

### Live Preview vs State Thrashing (Best Practice)
- **FOUT:** `onItemResize` aanroepen in `onDragMove` = te veel re-renders
- **CORRECT:** Gebruik lokale preview state die alleen de UI update
- Sync naar parent state alleen in `onDragEnd`
- Voorbeeld: `const [resizePreview, setResizePreview] = useState<{id, width, height} | null>(null)`
- In rendering: `const displayWidth = resizePreview?.id === item.id ? resizePreview.width : baseWidth`

### Viewport Layout voor Single-Page Apps
- Gebruik `h-screen overflow-hidden` op root voor geen body scroll
- Header: expliciete vaste hoogte (`h-16` = 64px)
- Main: `h-[calc(100vh-64px)] overflow-hidden` voor resterende hoogte
- Sidebars: `h-full overflow-auto` voor interne scroll
- Flex container: `h-full` om parent height te respecteren
- Test layout op verschillende schermgroottes

### UI Input Velden Dimensionering
- Number inputs voor afmetingen: `w-16` (64px) is minimum voor getallen zoals "2.50"
- Gebruik `text-xs` i.p.v. `text-sm` voor compactere layout
- `px-1` i.p.v. `px-1.5` voor meer ruimte binnen het veld

### Firebase & Firestore Integratie
- **AuthContext** (`src/contexts/AuthContext.tsx`): Beheert login state met Google OAuth
- **usePlattegrond hook** (`src/hooks/usePlattegrond.ts`): Real-time sync van geplaatste meubels en layouts
- **onSnapshot**: Luistert naar Firestore wijzigingen, update lokale state automatisch
- **saveItems**: Slaat wijzigingen op naar Firestore, andere gebruikers zien het direct
- **Document structuur** (nieuwe layout structuur):
  ```
  plattegronden/gedeeld/
    layouts: {
      [layoutId]: { id, naam, items: GeplaatstMeubel[], createdAt, updatedAt }
    }
    activeLayoutId: string
  ```
- **Automatische migratie**: Oude structuur (direct `items` array) wordt automatisch naar layouts geconverteerd
- Environment variables beginnen met `VITE_` voor Vite toegang in browser

### Meerdere Layouts Feature (v1.1.0)
- **LayoutSelector component** (`src/components/LayoutSelector.tsx`): Dropdown UI in header
- **Functies**: createLayout, switchLayout, renameLayout, duplicateLayout, deleteLayout
- Inline editing voor layout namen (dubbelklik of edit icon)
- Bevestiging nodig voor verwijderen (2-staps: klik prullenbak, dan bevestig)
- Laatste layout kan niet worden verwijderd
- Real-time sync: layout wisselen door andere gebruiker update ook jouw scherm

### Airfryer Easter Egg 🍟
- **Component**: `src/components/AirfryerEasterEgg.tsx`
- Staat op keuken aanrecht, gedraaid zodat frikadel naar links vliegt
- Random interval: 10-30 sec (dev) of 2-5 min (productie)
- Animatie via Konva.Tween: spring naar links, roteer 720°, fade out
- Props: `x`, `y`, `pixelsPerMeter`, `rotatie` (in graden)

### App Versioning (VERPLICHT bij elke wijziging!)
**Bij ELKE code-wijziging die gepusht wordt:**
1. Update `APP_VERSION` in `src/App.tsx`
2. Voeg changelog entry toe in `src/data/changelog.ts`

**Versienummering (MAJOR.MINOR.PATCH):**
- **PATCH (1.6.x → 1.6.1)**: Bugfixes, kleine correcties
- **MINOR (1.6.x → 1.7.0)**: Nieuwe features, verbeteringen
- **MAJOR (1.x.x → 2.0.0)**: Breaking changes, grote redesigns

**Changelog entry formaat:**
```typescript
{
  version: '1.6.1',
  date: 'YYYY-MM-DD',
  title: 'Korte titel',
  entries: [
    { type: 'fix', description: 'Beschrijving van bugfix' },
    { type: 'feature', description: 'Beschrijving van feature' },
    { type: 'improvement', description: 'Beschrijving van verbetering' },
  ]
}
```

**Types:** `fix` (bugfix), `feature` (nieuw), `improvement` (beter)

- Versienummer weergegeven in sidebar footer (desktop) en menu (mobile)

### Deployment Workflow
- **Lokaal testen**: Maak wijzigingen, test met `npm run dev`
- **Pas pushen na goedkeuring**: Niet automatisch pushen na elke wijziging
- **Handmatige push**: Alleen na expliciete goedkeuring van gebruiker
- **Vercel auto-deploy**: Na push naar GitHub bouwt Vercel automatisch
- **Environment variables**: Staan in Vercel dashboard, NIET in Git

### Git Push Policy (BELANGRIJK!)
- **NOOIT automatisch pushen** naar GitHub na wijzigingen
- Altijd eerst aan gebruiker vragen: "Wil je dat ik dit push naar GitHub?"
- Pas pushen na expliciete goedkeuring ("ja", "push", "doe maar", etc.)
- Bij twijfel: NIET pushen, vraag eerst

### UI Wijzigingen Checklist (ALTIJD Controleren)
**Na elke UI wijziging: controleer visueel op overflow/afsnijding issues**

1. **Container overflow check:**
   - Wordt content afgesneden aan de randen?
   - Toolbars/menubars: gebruik `flex-wrap` en `max-w-full` om afsnijding te voorkomen
   - Lange lijsten: gebruik `overflow-auto` of `overflow-x-auto` met scroll indicators

2. **Responsieve layouts:**
   - Test op smalle viewports (sidebar dicht)
   - Inline-flex containers kunnen té breed worden - overweeg `flex-wrap`
   - `rounded-full` wordt lelijk bij wrap - gebruik dan `rounded-2xl`

3. **Oplossingspatronen voor overflow:**
   - Toolbar te breed: `flex-wrap items-center justify-center max-w-full`
   - Sidebar te hoog: `h-full overflow-auto`
   - Input velden: vaste `w-XX` + `text-xs` voor compactheid

### Zoom Initialisatie Bug (Fout Geleerd)
- **FOUT:** Zoom state initieel op `null` zetten en wachten op berekening
- **PROBLEEM:** Plattegrond was leeg/onzichtbaar bij eerste load tot gebruiker zoomde
- **CORRECT:** Begin met een default waarde (bijv. `0.6`) en update later indien nodig
- **EXTRA:** Gebruik `zoomInitialized` state om te tracken of auto-zoom al gedaan is
- **PATROON:** Voor waardes die direct nodig zijn voor rendering, NOOIT `null` als initial state

### Element Positionering Verifiëren (Fout Geleerd)
- **FOUT:** Airfryer gepositioneerd op basis van coördinaten zonder visuele check
- **PROBLEEM:** Element kwam op verkeerde plek terecht (oven/wasbak i.p.v. werkblad)
- **CORRECT:** Na elke positie-aanpassing een screenshot maken en visueel verifiëren
- **TIP:** Kleine aanpassingen (0.5m) kunnen groot verschil maken in plattegrond context

### Animatie Richting bij Rotatie
- **CONTEXT:** Frikadel animatie vloog "omhoog" maar moest "naar links" (van aanrecht af)
- **OPLOSSING:** Element 90° roteren zodat de oorspronkelijke animatie-as nu de gewenste richting is
- **ALTERNATIEF:** Animatie aanpassen van y-as naar x-as beweging
- **TIP:** Bij geroteerde elementen: denk na over welke richting "omhoog" of "vooruit" betekent

### Real-time Sync Architectuur
- **Firebase Firestore** biedt automatische real-time sync tussen alle apparaten
- Zodra data in Firestore staat, sync't het naar ALLE clients die luisteren
- Geen extra werk nodig voor cross-device sync (laptop ↔ telefoon)
- `onSnapshot` listener houdt lokale state automatisch in sync met Firestore

### Mobile/iPhone Support (v1.2.0)
**Responsive layout** met automatische detectie van mobile devices:
- **useIsMobile hook** (`src/hooks/useIsMobile.ts`): Detecteert mobile via viewport < 768px of touch support
- **MobileAppContent** (`src/components/mobile/MobileAppContent.tsx`): Volledige mobile layout wrapper
- **Conditional rendering** in `App.tsx`: Toont automatisch desktop of mobile versie

**Mobile componenten:**
- `MobileHeader.tsx` - Compacte header met logo, layout dropdown, hamburger menu
- `BottomSheet.tsx` - Swipeable sheet voor meubel selectie (drag-to-close)
- `MobileMeubelSelector.tsx` - Grid layout met grote touch targets (48x48px min)
- `MobileToolbar.tsx` - Floating action buttons: Meubel, Roteer, Meten, Verwijder
- `MobileMenu.tsx` - Slide-in drawer met user info, statistieken, layout acties

**Touch optimalisaties:**
- **Tap-to-place** in plaats van drag & drop: selecteer meubel → tap op canvas
- **Pinch-to-zoom** via Konva touch events (twee-vinger gesture)
- **Touch drag** voor meubels verplaatsen
- `touchAction: 'none'` op canvas voorkomt browser gestures

**Mobile UI flow:**
1. Tap "Meubel" → Bottom sheet opent
2. Selecteer meubel (met optionele afmeting)
3. Sheet sluit → status bar toont "Tap om te plaatsen"
4. Tap op canvas → meubel geplaatst
5. Tap op meubel → selecteren voor roteer/verwijder

### iOS 26 Liquid Glass Design (v1.3.0)
**Design systeem** gebaseerd op Apple's iOS 26 Liquid Glass richtlijnen:

**Core CSS classes** (`src/index.css`):
- `.glass` - Standaard glass effect met blur en transparantie
- `.glass-subtle` - Subtielere variant voor buttons/controls
- `.glass-active` - Blue-tinted variant voor geselecteerde items
- `.glass-dark` - Donkere variant voor modals
- `.glass-pill` - Ronde pill/badge vorm
- `.glass-button` - Button met hover/active states
- `.glass-fab` - Floating Action Button (cirkel)
- `.glass-fab-primary` - Primary FAB met gradient

**Liquid Glass kenmerken:**
- `backdrop-filter: blur(20px) saturate(1.8)` - Frosted glass blur
- `background: rgba(255, 255, 255, 0.15-0.22)` - Semi-transparante achtergrond
- `border: 1px solid rgba(255, 255, 255, 0.25-0.35)` - Subtiele rand
- `box-shadow: inset highlight + outer depth shadow` - Diepte effect
- `border-radius: 16-28px` - Afgeronde hoeken

**Gradient mesh achtergrond:**
```jsx
<div className="bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100">
  <div className="absolute ... bg-blue-300/40 rounded-full blur-3xl" />
  <div className="absolute ... bg-purple-300/30 rounded-full blur-3xl" />
</div>
```

**Animaties** (`tailwind.config.js`):
- `animate-float-up` - Fade in + slide up
- `animate-slide-up` - Sheet slide in
- `animate-fade-in` - Simple fade
- `animate-scale-in` - Pop in met scale

**Belangrijke principes (Apple HIG):**
- Glass alleen op navigatie-laag, niet op content
- "Avoid glass on glass" - geen gestapelde glass elementen
- Hiërarchie door diepte, niet alleen kleur
- Content-first: UI wijkt terug voor content

### UI Element Plaatsing (Fout Geleerd)
- **FOUT:** Nieuwe UI elementen (versienummer, changelog knop) als losse `fixed` elementen geplaatst
- **PROBLEEM:** Zwevende elementen voelen los en onsamenhangend, zien er amateuristisch uit
- **CORRECT:** Integreer nieuwe elementen in bestaande UI containers (sidebar footer, header, menu)
- **PATROON:** Bij nieuwe UI: eerst bepalen WAAR het logisch hoort (welke bestaande container)
- **VOORBEELD:** Versienummer + changelog knop horen in sidebar footer, niet als losstaande overlay

### Rotatie en Bounding Box (Fout Geleerd)
- **FOUT:** `constrainToBounds` en `snapToWalls` gebruikten originele breedte/hoogte zonder rotatie
- **PROBLEEM:** Gedraaide meubels (90°/270°) konden niet tegen muren geplaatst worden
- **CORRECT:** Bij 90° of 270° rotatie worden effectieve breedte en hoogte verwisseld:
  ```typescript
  const isRotated90or270 = item.rotatie === 90 || item.rotatie === 270
  const effectieveBreedte = isRotated90or270 ? baseHoogte : baseBreedte
  const effectieveHoogte = isRotated90or270 ? baseBreedte : baseHoogte
  ```
- **PATROON:** Overal waar meubel dimensies gebruikt worden voor collision/constraint, rekening houden met rotatie

### Google OAuth Testen
- **BEPERKING:** Google OAuth login kan niet automatisch uitgevoerd worden (beveiligingsbeperking)
- **WORKAROUND:** Gebruiker moet zelf inloggen via browser, daarna blijft sessie actief
- **TIP:** Test auth-gerelateerde features handmatig of vraag gebruiker om in te loggen

### Button Spacing in Mobile Menus (Fout Geleerd)
- **FOUT:** Nieuwe button toegevoegd aan bestaande sectie zonder expliciete margin
- **PROBLEEM:** Buttons plakten aan elkaar zonder visuele scheiding (bijv. "Deel deze layout" en "Exporteer als PDF")
- **CORRECT:** Bij toevoegen van buttons aan een sectie zonder `space-y-X` wrapper, altijd expliciet margin toevoegen (`mt-1` of `mt-2`)
- **PATROON:** Check altijd of de parent container automatische spacing heeft (zoals `space-y-1`). Zo niet, voeg zelf margin toe.
- **TIP:** Na het toevoegen van UI elementen aan bestaande lijsten/secties: maak een screenshot en controleer visueel op spacing issues

### Mobile Modal/Popup Layout (Fout Geleerd)
- **FOUT:** Modal content in `flex-col` zonder voldoende `gap` en elementen in een enkele `justify-between` div gepropt
- **PROBLEEM:** Elementen (input, karakterteller, buttons) werden samengedrukt of verdwenen achter andere elementen
- **CORRECT:**
  1. Gebruik voldoende `gap-4` op de parent container
  2. Wrap gerelateerde elementen (input + karakterteller) in een eigen `<div>`
  3. Geef elk element ruimte: `py-3` op inputs, `mt-2` op helper tekst
  4. Buttons in eigen div met `justify-end` en `gap-3`
- **PATROON:** Bij modals/popups altijd deze structuur:
  ```jsx
  <div className="flex flex-col gap-4">
    <div className="title">Titel</div>
    <div>
      <input className="py-3" />
      <div className="mt-2">Helper tekst</div>
    </div>
    <div className="flex justify-end gap-3">
      <button>Annuleer</button>
      <button>Opslaan</button>
    </div>
  </div>
  ```
- **TIP:** Test modals ALTIJD op mobile met keyboard open - elementen moeten zichtbaar blijven
