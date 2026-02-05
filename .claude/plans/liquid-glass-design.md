# Plan: iOS 26 Liquid Glass Design voor Huisplanner Mobile

## Overzicht Liquid Glass Design Stijl

Liquid Glass is Apple's nieuwe design taal, geïntroduceerd met iOS 26 (WWDC 2025). Het is de grootste visuele update sinds iOS 7 en verschilt fundamenteel van standaard glassmorphism.

### Kernprincipes van Liquid Glass

1. **Drie lagen model:**
   - **Highlight** - Lichtreflecties die reageren op beweging
   - **Shadow** - Diepte-scheiding tussen voorgrond en achtergrond
   - **Illumination** - Flexibele materiaal eigenschappen

2. **Dynamisch gedrag:**
   - Licht buigt en vervormt zoals echt glas
   - Specular highlights reageren op device beweging
   - UI elementen krimpen/expanderen vloeiend bij scrollen
   - Kleuren passen zich aan aan omgeving (licht/donker)

3. **Hiërarchie door diepte:**
   - Belangrijkheid via transparantie en refractie i.p.v. kleurcontrast
   - Glass alleen voor navigatie-laag (niet content)
   - "Avoid glass on glass" - geen gestapelde glass elementen

4. **Content-first:**
   - UI elementen wijken terug tijdens lezen/creëren
   - Tab bars krimpen automatisch bij scrollen
   - Controls morphen - verdwijnen voor focus, expanderen voor functionaliteit

---

## CSS Implementatie Specificaties

### Basis Glass Card
```css
.liquid-glass {
  /* Achtergrond met lage opaciteit */
  background: rgba(255, 255, 255, 0.15);

  /* Blur + saturatie voor glass effect */
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);

  /* Subtiele border voor definitie */
  border: 1px solid rgba(255, 255, 255, 0.3);

  /* Grote border-radius voor vloeiende vorm */
  border-radius: 24px;

  /* Gecombineerde shadows voor diepte */
  box-shadow:
    0 8px 32px rgba(31, 38, 135, 0.15),
    inset 0 4px 20px rgba(255, 255, 255, 0.2);
}
```

### Aanpasbare Parameters
| Parameter | Waarde | Beschrijving |
|-----------|--------|--------------|
| Blur | 16-24px | Hogere waarde = meer frosted |
| Background alpha | 0.1-0.2 | Transparantie niveau |
| Saturate | 150-200% | Kleur intensiteit |
| Border alpha | 0.2-0.4 | Rand zichtbaarheid |
| Border-radius | 20-28px | Hoek afronding |

### Dark Mode Variant
```css
.liquid-glass-dark {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}
```

---

## Implementatie Plan voor Huisplanner

### Fase 1: Tailwind Configuratie (15 min)

**tailwind.config.js uitbreiden:**
```javascript
theme: {
  extend: {
    backdropBlur: {
      'glass': '20px',
    },
    backdropSaturate: {
      'glass': '180%',
    },
    colors: {
      'glass': {
        'light': 'rgba(255, 255, 255, 0.15)',
        'dark': 'rgba(0, 0, 0, 0.3)',
        'border': 'rgba(255, 255, 255, 0.3)',
      }
    },
    boxShadow: {
      'glass': '0 8px 32px rgba(31, 38, 135, 0.15), inset 0 4px 20px rgba(255, 255, 255, 0.2)',
      'glass-dark': '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
    },
    borderRadius: {
      'glass': '24px',
    }
  }
}
```

**Custom CSS classes in index.css:**
```css
@layer components {
  .glass {
    @apply bg-white/15 backdrop-blur-[20px] backdrop-saturate-[180%];
    @apply border border-white/30 rounded-[24px];
    @apply shadow-[0_8px_32px_rgba(31,38,135,0.15),inset_0_4px_20px_rgba(255,255,255,0.2)];
  }

  .glass-dark {
    @apply bg-black/30 backdrop-blur-[20px] backdrop-saturate-[180%];
    @apply border border-white/10 rounded-[24px];
    @apply shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)];
  }
}
```

---

### Fase 2: Achtergrond Verbeteren (20 min)

Liquid Glass werkt het beste met een kleurrijke/dynamische achtergrond.

**MobileAppContent.tsx - Nieuwe achtergrond:**
- Gradient mesh achtergrond met zachte kleuren
- Of: blur van de plattegrond zelf als achtergrond

```jsx
// Achtergrond laag
<div className="fixed inset-0 bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100" />

// Of met animated gradient:
<div className="fixed inset-0">
  <div className="absolute inset-0 bg-gradient-to-br from-blue-200/60 via-purple-100/40 to-rose-200/60" />
  <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl" />
  <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-purple-300/30 rounded-full blur-3xl" />
</div>
```

---

### Fase 3: MobileHeader.tsx Restylen (30 min)

**Van:**
- Solid white background
- Standard borders

**Naar:**
```jsx
<header className="h-14 glass border-b-0 mx-3 mt-3 flex items-center justify-between px-4 safe-area-top">
```

**Specifieke aanpassingen:**
- `bg-white` → glass achtergrond
- `border-slate-200` → `border-white/30`
- `rounded-none` → `rounded-[24px]`
- Logo icon met glass effect
- Layout dropdown met glass styling
- Hamburger button met hover glass effect

---

### Fase 4: MobileToolbar.tsx Restylen (30 min)

**Floating toolbar met glass:**
```jsx
<div className="fixed bottom-6 left-4 right-4 glass px-4 py-3 safe-area-bottom">
```

**FAB buttons:**
```jsx
<button className="w-14 h-14 glass flex items-center justify-center transition-all active:scale-95">
```

**Status indicator (geselecteerd meubel):**
```jsx
<div className="glass px-4 py-2 mb-3">
  {/* Meubel info */}
</div>
```

---

### Fase 5: BottomSheet.tsx Restylen (30 min)

**Sheet container:**
```jsx
<div className="fixed bottom-0 left-0 right-0 glass rounded-b-none rounded-t-[28px]">
```

**Drag handle:**
```jsx
<div className="w-12 h-1.5 bg-white/40 rounded-full mx-auto my-3" />
```

**Achtergrond overlay:**
```jsx
<div className="fixed inset-0 bg-black/20 backdrop-blur-sm" />
```

---

### Fase 6: MobileMenu.tsx Restylen (30 min)

**Slide-in drawer:**
```jsx
<div className="fixed top-3 right-3 bottom-3 w-72 glass flex flex-col">
```

**Menu items:**
```jsx
<button className="flex items-center gap-3 px-3 py-2.5 rounded-[16px] hover:bg-white/10 active:bg-white/20">
```

**Statistieken cards:**
```jsx
<div className="glass p-4 text-center">
  <div className="text-2xl font-bold">{aantal}</div>
  <div className="text-xs opacity-70">Meubels</div>
</div>
```

---

### Fase 7: MobileMeubelSelector.tsx Restylen (30 min)

**Category tabs:**
```jsx
<button className={`px-4 py-2 rounded-full transition-all ${
  active
    ? 'glass bg-white/20 font-medium'
    : 'text-slate-600 hover:bg-white/10'
}`}>
```

**Meubel cards:**
```jsx
<button className="glass p-3 flex flex-col items-center gap-2 transition-all active:scale-95">
  <div className="w-12 h-12 rounded-[12px]" style={{ backgroundColor: kleur }} />
  <span className="text-xs font-medium">{naam}</span>
</button>
```

---

### Fase 8: Animaties & Micro-interacties (45 min)

**Smooth transitions:**
```css
.glass {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

**Shrinking toolbar on scroll (optioneel):**
- Detecteer scroll richting
- Toolbar krimpt naar compactere versie
- Expandeert weer bij omhoog scrollen

**Button feedback:**
```jsx
className="active:scale-95 active:bg-white/25 transition-all duration-150"
```

**Sheet animatie:**
```css
@keyframes sheetSlideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
```

---

### Fase 9: Canvas Container (15 min)

De plattegrond canvas zelf blijft functioneel, maar de container krijgt glass styling:

```jsx
<div className="flex-1 p-3">
  <div className="h-full glass p-2 overflow-hidden">
    <Plattegrond ... />
  </div>
</div>
```

---

## Visueel Verschil

### VOOR (Huidige stijl):
- Solid white backgrounds
- Sharp borders
- Flat appearance
- Traditional shadows

### NA (Liquid Glass):
- Translucent backgrounds (15-20% opacity)
- Soft blurred edges
- Depth through layering
- Specular highlights
- Frosted glass effect
- Colorful background shines through

---

## Technische Overwegingen

### Browser Support
- `backdrop-filter`: ✅ Chrome, Safari, Edge, Firefox
- Fallback voor oudere browsers: solid background met lagere opacity

### Performance
- Backdrop blur is GPU-intensief
- Beperk tot navigatie elementen (niet content)
- Test op oudere iPhones (iPhone 8, SE)

### Accessibility
- Zorg voor voldoende contrast (WCAG AA)
- Text op glass: gebruik `text-shadow` voor leesbaarheid
- Test met reduced-motion preference

---

## Bestanden te Wijzigen

1. `tailwind.config.js` - Custom glass utilities
2. `src/index.css` - Glass component classes
3. `src/components/mobile/MobileAppContent.tsx` - Achtergrond
4. `src/components/mobile/MobileHeader.tsx` - Header glass
5. `src/components/mobile/MobileToolbar.tsx` - Floating toolbar
6. `src/components/mobile/BottomSheet.tsx` - Sheet glass
7. `src/components/mobile/MobileMenu.tsx` - Drawer glass
8. `src/components/mobile/MobileMeubelSelector.tsx` - Cards glass

---

## Geschatte Tijd

| Fase | Tijd |
|------|------|
| Tailwind config | 15 min |
| Achtergrond | 20 min |
| Header | 30 min |
| Toolbar | 30 min |
| BottomSheet | 30 min |
| Menu | 30 min |
| MeubelSelector | 30 min |
| Animaties | 45 min |
| Canvas container | 15 min |
| Testen & tweaken | 30 min |
| **Totaal** | **~4.5 uur** |

---

## Bronnen

- [Apple Newsroom - Liquid Glass](https://www.apple.com/newsroom/2025/06/apple-introduces-a-delightful-and-elegant-new-software-design/)
- [CSS-Tricks - Liquid Glass](https://css-tricks.com/getting-clarity-on-apples-liquid-glass/)
- [DEV.to - Liquid Glass CSS](https://dev.to/gruszdev/apples-liquid-glass-revolution-how-glassmorphism-is-shaping-ui-design-in-2025-with-css-code-1221)
- [Liquid Glass CSS Generator](https://liquidglassgen.com/)
