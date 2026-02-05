# Plan: Mobile/iPhone-Proof Versie Huisplanner

## Overzicht

De huidige desktop versie transformeren naar een responsive app die goed werkt op iPhone en andere mobiele apparaten. De focus ligt op touch-optimalisatie en een aangepaste mobile layout.

**Belangrijk:** Synchronisatie is al geregeld via Firebase Firestore - wijzigingen op laptop verschijnen direct op telefoon (en andersom).

---

## Analyse Huidige Situatie

### Desktop Layout (huidige structuur)
```
┌─────────────────────────────────────────────────────────┐
│ Header (64px): Logo | Sync | Layout | User              │
├──────────┬─────────────────────────────┬────────────────┤
│ Sidebar  │                             │ Eigenschappen  │
│ Meubels  │      Plattegrond Canvas     │ Paneel         │
│ (288px)  │                             │ (256px)        │
│          │                             │                │
└──────────┴─────────────────────────────┴────────────────┘
│ Zoom Controls (rechtsonder, fixed)                      │
│ Lineaal Button (midden-onder, fixed)                    │
│ Versienummer (linksonder, fixed)                        │
└─────────────────────────────────────────────────────────┘
```

### Probleem op Mobile
- Sidebars nemen te veel ruimte (288px + 256px = 544px, iPhone is 375-428px breed)
- Touch targets zijn te klein (veel knoppen < 44px)
- Drag & drop werkt niet goed met touch
- Toolbar past niet op smal scherm
- Geen pinch-to-zoom ondersteuning

---

## Voorgestelde Mobile Layout

### Landscape Mode (iPhone horizontaal)
```
┌─────────────────────────────────────────────────────────┐
│ Compact Header: Logo | Layout ▼ | ☰ Menu               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│              Plattegrond Canvas (fullscreen)            │
│                    (touch draggable)                    │
│                   (pinch-to-zoom)                       │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ [+] Meubel | [↻] Roteer | [🗑️] Verwijder | [📏] Meet   │
└─────────────────────────────────────────────────────────┘
```

### Portrait Mode (iPhone verticaal)
```
┌─────────────────────────┐
│ Header: 🏠 | Layout | ☰ │
├─────────────────────────┤
│                         │
│    Plattegrond Canvas   │
│    (scrollable/zoom)    │
│                         │
│                         │
├─────────────────────────┤
│ Floating Action Buttons │
│ [+] [↻] [🗑️] [📏]       │
├─────────────────────────┤
│ Bottom Sheet (swipe up) │
│ - Meubel selectie       │
│ - Eigenschappen         │
└─────────────────────────┘
```

---

## Implementatie Stappen

### Fase 1: Responsive Detection & Basis (1-2 uur)

**1.1 Custom Hook: `useIsMobile`**
```typescript
// src/hooks/useIsMobile.ts
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return isMobile
}
```

**1.2 Viewport Meta Tag**
Controleer dat `index.html` correct is:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
```

**1.3 Touch-action CSS**
```css
/* Voorkom browser gestures op canvas */
.touch-canvas {
  touch-action: none;
}
```

### Fase 2: Mobile Header Component (30 min)

**2.1 Nieuw component: `MobileHeader.tsx`**
```typescript
interface MobileHeaderProps {
  layouts: Layout[]
  activeLayoutId: string
  onLayoutSwitch: (id: string) => void
  onMenuOpen: () => void
  user: User | null
}

// Compact header met:
// - Logo (verkleind)
// - Layout dropdown (inline)
// - Hamburger menu
```

### Fase 3: Bottom Sheet Component (1 uur)

**3.1 Nieuw component: `BottomSheet.tsx`**
- Swipe up/down gesture
- 3 posities: gesloten, half open, volledig open
- Snap naar dichtstbijzijnde positie
- Content scroll binnen sheet

```typescript
interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}
```

### Fase 4: Mobile Meubel Selector (1 uur)

**4.1 Nieuw component: `MobileMeubelSelector.tsx`**
- Grid layout van meubels (2-3 kolommen)
- Grote touch targets (min 48x48px)
- Afmeting selectie in modal/sheet
- "Tap to select, tap canvas to place" flow

```typescript
// In plaats van drag & drop:
// 1. Tap op meubel → geselecteerd (highlight)
// 2. Tap op canvas → meubel geplaatst
// 3. Auto-deselect of "Plaats nog een" optie
```

### Fase 5: Touch-Optimized Canvas (2 uur)

**5.1 Pinch-to-Zoom voor Konva**
React-Konva ondersteunt multi-touch. Implementeer:
```typescript
// In Plattegrond.tsx
const handleTouchMove = (e: KonvaEventObject<TouchEvent>) => {
  const touch1 = e.evt.touches[0]
  const touch2 = e.evt.touches[1]

  if (touch1 && touch2) {
    // Pinch zoom logica
    const dist = getDistance(touch1, touch2)
    const newZoom = lastZoom * (dist / lastDist)
    onZoomChange?.(Math.max(0.3, Math.min(3, newZoom)))
  }
}
```

**5.2 Touch Drag voor Meubels**
- Grotere hit areas voor selectie
- Long press (300ms) voor context menu
- Visual feedback tijdens drag

**5.3 Mobile Snap Feedback**
- Haptic feedback bij snap (indien beschikbaar)
- Grotere visuele indicatie van snap zones

### Fase 6: Mobile Toolbar (1 uur)

**6.1 Floating Action Buttons (FAB)**
```typescript
// src/components/MobileToolbar.tsx
// Circulaire FABs onderin scherm:
// - Primair: + (meubel toevoegen)
// - Secundair: roteer, verwijder, meet
// - Toon alleen relevante acties (context-aware)
```

**6.2 Rotatie Gesture**
- Twee-vinger rotatie op geselecteerd meubel
- Of: dedicated rotate dial in toolbar

### Fase 7: Mobile Menu/Drawer (30 min)

**7.1 Hamburger Menu Content**
- User info & logout
- Layout management
- "Wis alles" actie
- Instellingen (later)
- Sync status

### Fase 8: App.tsx Responsive Wrapper (1 uur)

**8.1 Conditional Rendering**
```typescript
function AppContent() {
  const isMobile = useIsMobile()

  if (isMobile) {
    return <MobileAppContent {...props} />
  }

  return <DesktopAppContent {...props} />
}
```

**8.2 Shared State**
- Alle state blijft in App.tsx
- Props doorgeven aan mobile/desktop varianten
- Hooks blijven herbruikbaar

---

## Nieuwe Bestanden

```
src/
├── hooks/
│   └── useIsMobile.ts          # Mobile detection hook
├── components/
│   ├── mobile/
│   │   ├── MobileAppContent.tsx    # Mobile layout wrapper
│   │   ├── MobileHeader.tsx        # Compact header
│   │   ├── MobileToolbar.tsx       # FAB toolbar
│   │   ├── MobileMeubelSelector.tsx # Grid meubel picker
│   │   ├── BottomSheet.tsx         # Swipeable sheet
│   │   └── MobileMenu.tsx          # Hamburger menu drawer
```

---

## Te Wijzigen Bestanden

1. **src/App.tsx**
   - Import useIsMobile hook
   - Conditional render desktop/mobile
   - Gedeelde state management

2. **src/components/Plattegrond.tsx**
   - Touch event handlers toevoegen
   - Pinch-to-zoom support
   - Grotere touch targets voor meubels

3. **src/index.css** (of Tailwind config)
   - Mobile-specifieke utilities
   - Touch-action rules

4. **index.html**
   - Viewport meta tag checken
   - PWA manifest (optioneel later)

---

## Touch Targets Checklist

Apple Human Interface Guidelines: minimum 44x44pt

- [ ] Meubel items in lijst: 48px height
- [ ] Toolbar buttons: 48x48px
- [ ] Zoom controls: 48x48px
- [ ] Layout dropdown: 44px height
- [ ] Delete/action buttons: 48x48px
- [ ] Geplaatste meubels: ruimere hit area

---

## Gestures Overzicht

| Gesture | Actie |
|---------|-------|
| Tap (canvas) | Plaats geselecteerd meubel |
| Tap (meubel) | Selecteer meubel |
| Long press (meubel) | Context menu (roteer/verwijder) |
| Drag (meubel) | Verplaats meubel |
| Pinch | Zoom in/out |
| Two-finger pan | Pan canvas (bij ingezoomd) |
| Two-finger rotate | Roteer geselecteerd meubel |
| Swipe up (bottom) | Open meubel sheet |
| Swipe down (sheet) | Sluit sheet |

---

## Prioriteit Volgorde

1. **Must Have (MVP)**
   - [x] Mobile detection
   - [ ] Responsive header
   - [ ] Bottom sheet voor meubels
   - [ ] Tap-to-place flow
   - [ ] Touch drag voor meubels
   - [ ] Basic pinch zoom

2. **Should Have**
   - [ ] FAB toolbar
   - [ ] Hamburger menu
   - [ ] Haptic feedback
   - [ ] Smooth animations

3. **Nice to Have**
   - [ ] Two-finger rotate
   - [ ] PWA support
   - [ ] Offline mode
   - [ ] Landscape optimalisatie

---

## Geschatte Tijd

| Fase | Tijd |
|------|------|
| Fase 1: Detection & Basis | 1-2 uur |
| Fase 2: Mobile Header | 30 min |
| Fase 3: Bottom Sheet | 1 uur |
| Fase 4: Meubel Selector | 1 uur |
| Fase 5: Touch Canvas | 2 uur |
| Fase 6: Mobile Toolbar | 1 uur |
| Fase 7: Menu/Drawer | 30 min |
| Fase 8: App Wrapper | 1 uur |
| **Totaal** | **8-9 uur** |

---

## Verificatie

### Desktop (moet blijven werken)
- [ ] Alle huidige functionaliteit intact
- [ ] Geen visuele regressies
- [ ] Drag & drop werkt nog

### Mobile (nieuwe functionaliteit)
- [ ] Header past op scherm
- [ ] Bottom sheet opent/sluit smooth
- [ ] Meubels selecteren en plaatsen werkt
- [ ] Meubels verslepen werkt met touch
- [ ] Pinch zoom werkt
- [ ] Rotatie werkt
- [ ] Verwijderen werkt
- [ ] Layouts wisselen werkt
- [ ] Sync werkt tussen devices
- [ ] Geen ongewenste browser gestures

### Devices te testen
- [ ] iPhone SE (375px)
- [ ] iPhone 14 (390px)
- [ ] iPhone 14 Pro Max (430px)
- [ ] iPad Mini (768px - grensgebied)
- [ ] Android telefoon

---

## Notities

- **Geen PWA voor nu**: Focus eerst op werkende mobile web experience
- **Landscape vs Portrait**: Start met portrait, landscape als bonus
- **Easter egg**: Airfryer werkt ook op mobile (geen aanpassingen nodig)
- **Sync**: Al werkend via Firestore, geen extra werk nodig
