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
