import { Kamer, Meubel } from '../types'

// Schaal: 1 meter = 50 pixels
export const PIXELS_PER_METER = 50

// Appartement afmetingen gebaseerd op de plattegrond
// Totaal: 8.27m breed x 10.34m diep

export const appartementKamers: Kamer[] = [
  // Woonkamer (linksonder, grote ruimte)
  {
    id: 'woonkamer',
    naam: 'Woonkamer',
    x: 0,
    y: 5.03,  // vanaf entree naar beneden
    breedte: 3.70,
    hoogte: 5.31,
    kleur: '#e8e8e8'
  },
  // Keuken (linksboven)
  {
    id: 'keuken',
    naam: 'Keuken',
    x: 0,
    y: 0,
    breedte: 3.68,
    hoogte: 5.03,
    kleur: '#e0e0e0'
  },
  // Slaapkamer 1 (rechtsboven)
  {
    id: 'slaapkamer1',
    naam: 'Slaapkamer 1',
    x: 3.68,
    y: 0,
    breedte: 3.06,
    hoogte: 3.51,
    kleur: '#d4e5f7'
  },
  // Kast (rechts van slaapkamer 1)
  {
    id: 'kast',
    naam: 'Kast',
    x: 6.74,
    y: 0,
    breedte: 1.43,
    hoogte: 3.51,
    kleur: '#c9c9c9'
  },
  // Badkamer
  {
    id: 'badkamer',
    naam: 'Badkamer',
    x: 5.96,
    y: 3.51,
    breedte: 2.31,
    hoogte: 1.94,
    kleur: '#cce5ff'
  },
  // Toilet
  {
    id: 'toilet',
    naam: 'Toilet',
    x: 5.96,
    y: 5.45,
    breedte: 1.42,
    hoogte: 0.89,
    kleur: '#cce5ff'
  },
  // Slaapkamer 2 (rechtsonder)
  {
    id: 'slaapkamer2',
    naam: 'Slaapkamer 2',
    x: 5.96,
    y: 6.34,
    breedte: 2.31,
    hoogte: 3.30,
    kleur: '#d4e5f7'
  },
  // Entree (midden)
  {
    id: 'entree',
    naam: 'Entree',
    x: 3.70,
    y: 3.51,
    breedte: 2.26,
    hoogte: 2.83,
    kleur: '#f0f0f0'
  },
  // Balkon (boven de keuken)
  {
    id: 'balkon',
    naam: 'Balkon',
    x: 0.5,
    y: -1.5,
    breedte: 2.0,
    hoogte: 1.2,
    kleur: '#d0d0d0'
  }
]

// Beschikbare meubels om te plaatsen
export const beschikbareMeubels: Meubel[] = [
  // Woonkamer meubels
  { id: 'bank', naam: 'Bank', breedte: 2.2, hoogte: 0.9, kleur: '#6b8e23' },
  { id: 'fauteuil', naam: 'Fauteuil', breedte: 0.9, hoogte: 0.9, kleur: '#8b7355' },
  { id: 'salontafel', naam: 'Salontafel', breedte: 1.2, hoogte: 0.6, kleur: '#cd853f' },
  { id: 'tv-meubel', naam: 'TV Meubel', breedte: 1.8, hoogte: 0.45, kleur: '#4a4a4a' },
  { id: 'boekenkast', naam: 'Boekenkast', breedte: 1.0, hoogte: 0.4, kleur: '#8b4513' },

  // Slaapkamer meubels
  { id: 'tweepersoonsbed', naam: '2-pers Bed', breedte: 1.8, hoogte: 2.0, kleur: '#4169e1' },
  { id: 'eenpersoonsbed', naam: '1-pers Bed', breedte: 0.9, hoogte: 2.0, kleur: '#4169e1' },
  { id: 'nachtkastje', naam: 'Nachtkastje', breedte: 0.45, hoogte: 0.45, kleur: '#deb887' },
  { id: 'kledingkast', naam: 'Kledingkast', breedte: 1.5, hoogte: 0.6, kleur: '#8b7355' },
  { id: 'bureau', naam: 'Bureau', breedte: 1.2, hoogte: 0.6, kleur: '#d2b48c' },
  { id: 'bureaustoel', naam: 'Bureaustoel', breedte: 0.5, hoogte: 0.5, kleur: '#2f4f4f' },

  // Eetkamer meubels
  { id: 'eettafel', naam: 'Eettafel', breedte: 1.6, hoogte: 0.9, kleur: '#a0522d' },
  { id: 'eetkamerstoel', naam: 'Stoel', breedte: 0.45, hoogte: 0.45, kleur: '#bc8f8f' },

  // Planten en accessoires
  { id: 'plant-groot', naam: 'Grote Plant', breedte: 0.5, hoogte: 0.5, kleur: '#228b22' },
  { id: 'plant-klein', naam: 'Kleine Plant', breedte: 0.3, hoogte: 0.3, kleur: '#32cd32' },
  { id: 'vloerlamp', naam: 'Vloerlamp', breedte: 0.35, hoogte: 0.35, kleur: '#ffd700' },
]
