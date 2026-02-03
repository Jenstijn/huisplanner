import { Kamer, Meubel } from '../types'

// Schaal: 1 meter = 50 pixels
export const PIXELS_PER_METER = 50

// Appartement afmetingen gebaseerd op de bouwtekening
// Totaal: 8.27m breed x 10.34m diep
// Het trappenhuis (2.10m breed) is gemeenschappelijke ruimte

// Belangrijke horizontale maten (van links naar rechts):
// - Onderaan: 3.70m (woonkamer) + 2.10m (trappenhuis) + 2.31m (slaapkamer 2) = 8.11m
// - Bovenaan: 3.68m (keuken) + 3.06m (slaapkamer) + 1.43m (kast) = 8.17m

// Belangrijke verticale maten (van boven naar beneden):
// - Links: keuken/woonkamer loopt door tot 10.34m
// - Rechts boven: 3.51m (slaapkamer + kast)
// - Rechts midden: 1.94m (badkamer) + 0.89m (toilet)
// - Rechts onder: 3.30m (slaapkamer 2)

export const appartementKamers: Kamer[] = [
  // === KEUKEN/WOONKAMER (L-vormige open ruimte) ===

  // De keuken en woonkamer vormen samen één grote L-vormige ruimte
  // Ik splits dit visueel in twee delen voor de duidelijkheid

  // Keuken deel (het smalle bovenstuk van de L)
  // Loopt van linksboven naar beneden, 3.68m breed
  // De keukenapparatuur staat aan de rechterkant (tegen de muur naar slaapkamer)
  {
    id: 'keuken',
    naam: 'Keuken',
    x: 0,
    y: 0,
    breedte: 3.68,
    hoogte: 5.20,  // Tot waar de L-vorm naar rechts uitsteekt
    kleur: '#e8e8e8'
  },

  // Woonkamer deel (het brede onderstuk van de L)
  // 3.70m breed, loopt tot de onderkant van het gebouw
  {
    id: 'woonkamer',
    naam: 'Woonkamer',
    x: 0,
    y: 5.20,
    breedte: 3.70,
    hoogte: 5.14,  // 10.34 - 5.20 = 5.14m
    kleur: '#e8e8e8'  // Zelfde kleur als keuken (open ruimte)
  },

  // === SLAAPKAMER 1 (rechtsboven) ===
  // De grote slaapkamer, 3.06m breed x 3.51m diep
  {
    id: 'slaapkamer1',
    naam: 'Slaapkamer',
    x: 3.68,
    y: 0,
    breedte: 3.06,
    hoogte: 3.51,
    kleur: '#dce8f0'
  },

  // === KAST (naast slaapkamer 1) ===
  // Inbouwkast, 1.43m breed x 3.51m diep
  {
    id: 'kast',
    naam: 'Kast',
    x: 6.74,  // 3.68 + 3.06
    y: 0,
    breedte: 1.53,  // 8.27 - 6.74
    hoogte: 3.51,
    kleur: '#c8c8c8'
  },

  // === ENTREE (donkerblauw in tekening) ===
  // Klein gangetje tussen keuken en badkamer/trappenhuis
  {
    id: 'entree',
    naam: 'Entree',
    x: 3.68,
    y: 3.51,
    breedte: 2.28,
    hoogte: 2.83,  // Tot aan de bovenkant van het trappenhuis
    kleur: '#4a6078'  // Donkerder om gang aan te duiden
  },

  // === BADKAMER ===
  // Rechts van de entree, 2.31m breed x 1.94m diep
  // Bevat douche/bad (rond element rechts in tekening)
  {
    id: 'badkamer',
    naam: 'Badkamer',
    x: 5.96,
    y: 3.51,
    breedte: 2.31,
    hoogte: 1.94,
    kleur: '#c8dce8'
  },

  // === TOILET ===
  // Onder de badkamer, kleiner dan badkamer
  // 0.89m diep
  {
    id: 'toilet',
    naam: 'Toilet',
    x: 5.96,  // Gelijk met badkamer
    y: 5.45,  // 3.51 + 1.94
    breedte: 1.40,
    hoogte: 0.89,
    kleur: '#c8dce8'
  },

  // === ALGEMEEN TRAPPENHUIS (gemeenschappelijk) ===
  // Dit is GEEN onderdeel van het appartement
  // 2.10m breed, begint onder de entree
  {
    id: 'trappenhuis',
    naam: 'Trappenhuis',
    x: 3.70,
    y: 6.34,  // Direct onder de entree
    breedte: 2.26,
    hoogte: 4.00,  // Tot de onderkant
    kleur: '#a0a8b0'  // Grijzer - niet van appartement
  },

  // === SLAAPKAMER 2 (rechtsonder) ===
  // Rechts van het trappenhuis, 2.31m breed x 3.30m diep
  {
    id: 'slaapkamer2',
    naam: 'Slaapkamer',
    x: 5.96,  // Rechts, op lijn met badkamer/toilet
    y: 7.04,  // 10.34 - 3.30 = 7.04
    breedte: 2.31,
    hoogte: 3.30,
    kleur: '#dce8f0'
  },

  // === BALKON ===
  // Linksboven, toegankelijk vanuit de keuken
  // Positie geschat op basis van tekening
  {
    id: 'balkon',
    naam: 'Balkon',
    x: 0.20,
    y: -1.60,
    breedte: 1.80,
    hoogte: 1.40,
    kleur: '#b0c0a8'
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
