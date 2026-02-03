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
