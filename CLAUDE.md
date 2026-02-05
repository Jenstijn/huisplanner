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
- **State Management**: React Context of Zustand
- **Canvas/Visualisatie**: HTML5 Canvas of een library zoals Konva.js
- **Build Tool**: Vite

## Projectstructuur

```
huisplanner/
├── src/
│   ├── components/     # React componenten
│   ├── hooks/          # Custom React hooks
│   ├── utils/          # Hulpfuncties
│   ├── types/          # TypeScript types
│   ├── assets/         # Afbeeldingen, iconen
│   └── App.tsx         # Hoofdcomponent
├── public/             # Statische bestanden
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
