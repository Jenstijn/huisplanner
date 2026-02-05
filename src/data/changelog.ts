// Changelog data voor de Huisplanner app
// Elke release bevat versie, datum, titel en een lijst van wijzigingen

export type ChangeType = 'feature' | 'fix' | 'improvement'

export interface ChangelogEntry {
  type: ChangeType
  description: string
}

export interface Release {
  version: string
  date: string
  title: string
  entries: ChangelogEntry[]
}

export const changelog: Release[] = [
  {
    version: '1.6.2',
    date: '2026-02-05',
    title: 'Verbeterde Rotatie Fix',
    entries: [
      { type: 'fix', description: 'Gedraaide meubels kunnen nu tegen alle muren geplaatst worden (elke rotatiehoek)' },
      { type: 'improvement', description: 'Bounding box berekening werkt nu correct voor elke rotatie, niet alleen 90°/270°' },
    ]
  },
  {
    version: '1.6.1',
    date: '2026-02-05',
    title: 'Rotatie Bugfix',
    entries: [
      { type: 'fix', description: 'Gedraaide meubels (90°/270°) kunnen nu weer tegen alle muren geplaatst worden' },
    ]
  },
  {
    version: '1.6.0',
    date: '2026-02-05',
    title: 'Verbeteringen & Changelog',
    entries: [
      { type: 'feature', description: 'Changelog systeem toegevoegd - bekijk alle updates' },
      { type: 'feature', description: 'Pinch-to-rotate: draai meubels met twee vingers op iOS' },
      { type: 'fix', description: 'Lineaal/meten werkt nu correct op iOS en touchscreens' },
      { type: 'improvement', description: 'Versienummer nu zichtbaar in iOS menu' },
    ]
  },
  {
    version: '1.5.0',
    date: '2026-02-05',
    title: 'Prominente Deel-knop',
    entries: [
      { type: 'feature', description: 'Blauwe "Delen" knop in header voor snelle toegang' },
      { type: 'feature', description: '"Samenwerken" sectie toegevoegd in iOS menu' },
      { type: 'improvement', description: 'Delen nu toegankelijk zonder hover (werkt op touch)' },
    ]
  },
  {
    version: '1.4.0',
    date: '2026-02-05',
    title: 'Per-gebruiker Data & Delen',
    entries: [
      { type: 'feature', description: 'Elke gebruiker heeft nu eigen privé layouts' },
      { type: 'feature', description: 'Deel layouts via link of e-mail' },
      { type: 'feature', description: 'Kies tussen "Bekijken" of "Bewerken" rechten' },
      { type: 'feature', description: 'WhatsApp-knop voor snel delen' },
    ]
  },
  {
    version: '1.3.0',
    date: '2026-02-04',
    title: 'iOS 26 Liquid Glass Design',
    entries: [
      { type: 'feature', description: 'Nieuw design gebaseerd op Apple iOS 26 Liquid Glass' },
      { type: 'improvement', description: 'Frosted glass effecten en blur' },
      { type: 'improvement', description: 'Gradient mesh achtergronden' },
      { type: 'improvement', description: 'Vloeiende animaties' },
    ]
  },
  {
    version: '1.2.0',
    date: '2026-02-03',
    title: 'Mobile/iPhone Support',
    entries: [
      { type: 'feature', description: 'Volledige mobiele layout voor iPhone en tablets' },
      { type: 'feature', description: 'Tap-to-place meubels plaatsen' },
      { type: 'feature', description: 'Pinch-to-zoom op canvas' },
      { type: 'feature', description: 'Swipeable bottom sheet voor meubel selectie' },
      { type: 'feature', description: 'Hamburger menu met alle functies' },
    ]
  },
  {
    version: '1.1.0',
    date: '2026-02-02',
    title: 'Meerdere Layouts',
    entries: [
      { type: 'feature', description: 'Maak en beheer meerdere layouts' },
      { type: 'feature', description: 'Dupliceer bestaande layouts' },
      { type: 'feature', description: 'Hernoem layouts met dubbelklik' },
      { type: 'feature', description: 'Real-time sync tussen apparaten' },
    ]
  },
  {
    version: '1.0.0',
    date: '2026-02-01',
    title: 'Eerste Release',
    entries: [
      { type: 'feature', description: 'Plattegrond van je appartement' },
      { type: 'feature', description: 'Meubels slepen en plaatsen' },
      { type: 'feature', description: 'Meubels roteren en schalen' },
      { type: 'feature', description: 'Magnetische snap naar muren' },
      { type: 'feature', description: 'Lineaal tool voor afstanden meten' },
      { type: 'feature', description: 'Google login met Firebase' },
    ]
  },
]

// Helper om de nieuwste versie te krijgen
export const getLatestVersion = (): string => changelog[0]?.version ?? '1.0.0'

// Helper om een specifieke release te krijgen
export const getRelease = (version: string): Release | undefined =>
  changelog.find(r => r.version === version)
