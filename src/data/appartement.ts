import { Kamer, Meubel, Deur, Raam, IngebouwdElement } from '../types'

// Schaal: 1 meter = 50 pixels
export const PIXELS_PER_METER = 50

// ============================================================================
// APPARTEMENT AFMETINGEN - Gebaseerd op de bouwtekening
// ============================================================================
// Totaal: 8.27m breed x 10.34m diep
// Het trappenhuis (2.10m breed) is gemeenschappelijke ruimte
//
// Horizontale maten (van links naar rechts):
// - Bovenaan: 3.68m (keuken) + 3.06m (slaapkamer) + 1.43m (kast) = 8.17m
// - Onderaan: 3.70m (woonkamer) + 2.10m (trappenhuis) + 2.31m (slaapkamer 2)
//
// De kast is 1.43m breed, NIET 1.53m!
// De 2.67m maat bovenaan is slaapkamer(1.71m buiten muur) + kast samen
// ============================================================================

export const appartementKamers: Kamer[] = [
  // === KEUKEN (linksboven) ===
  // Open verbinding met woonkamer, keukenapparatuur aan rechterzijde
  {
    id: 'keuken',
    naam: 'Keuken',
    x: 0,
    y: 0,
    breedte: 3.68,
    hoogte: 5.00,
    kleur: '#e8e8e8'
  },

  // === WOONKAMER (linksonder) ===
  // L-vormige ruimte, open naar keuken
  // Heeft een schuine hoek rechtsboven waar het naar de entree gaat
  {
    id: 'woonkamer',
    naam: 'Woonkamer',
    punten: [
      { x: 0, y: 5.00 },        // linksboven
      { x: 3.70, y: 5.00 },     // rechtsboven (voor de schuine hoek)
      { x: 3.70, y: 6.20 },     // begin schuine hoek
      { x: 3.50, y: 6.40 },     // schuine hoek punt
      { x: 3.70, y: 6.40 },     // na schuine hoek
      { x: 3.70, y: 10.34 },    // rechtsonder
      { x: 0, y: 10.34 },       // linksonder
    ],
    kleur: '#e8e8e8'
  },

  // === SLAAPKAMER 1 (rechtsboven) ===
  // 3.06m breed x 3.51m diep
  {
    id: 'slaapkamer1',
    naam: 'Slaapkamer',
    x: 3.68,
    y: 0,
    breedte: 3.06,
    hoogte: 3.51,
    kleur: '#dce8f0'
  },

  // === KAST bij slaapkamer 1 (rechtsboven hoek) ===
  // 1.43m breed (NIET 1.53m!) x 3.51m diep
  // 8.27 - 3.68 - 3.06 = 1.53, maar de maat zegt 1.43m
  // Het verschil zit in de muurdikte
  {
    id: 'kast',
    naam: 'Kast',
    x: 6.74,
    y: 0,
    breedte: 1.43,
    hoogte: 3.51,
    kleur: '#c8c8c8'
  },

  // === ENTREE (donkerblauw in tekening) ===
  // Heeft een schuine hoek linksonder richting trappenhuis
  {
    id: 'entree',
    naam: 'Entree',
    punten: [
      { x: 3.68, y: 3.51 },     // linksboven
      { x: 5.96, y: 3.51 },     // rechtsboven
      { x: 5.96, y: 5.45 },     // rechtsonder (bij toilet)
      { x: 5.30, y: 5.45 },     // naar links
      { x: 5.30, y: 6.34 },     // naar beneden
      { x: 3.70, y: 6.34 },     // linksonder bij trappenhuis
      { x: 3.70, y: 6.10 },     // omhoog
      { x: 3.50, y: 5.90 },     // schuine hoek
      { x: 3.68, y: 5.90 },     // terug naar links
    ],
    kleur: '#4a6078'
  },

  // === BADKAMER ===
  // 2.31m breed x 1.94m diep
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
  // Kleiner dan badkamer, ~1.40m breed x 0.89m diep
  {
    id: 'toilet',
    naam: 'Toilet',
    x: 5.96,
    y: 5.45,
    breedte: 1.40,
    hoogte: 0.89,
    kleur: '#c8dce8'
  },

  // === ALGEMEEN TRAPPENHUIS (gemeenschappelijk) ===
  // Heeft schuine/getrapte vorm aan de linkerkant
  {
    id: 'trappenhuis',
    naam: 'Trappenhuis',
    punten: [
      { x: 3.70, y: 6.34 },     // linksboven
      { x: 5.80, y: 6.34 },     // rechtsboven
      { x: 5.80, y: 10.34 },    // rechtsonder
      { x: 3.70, y: 10.34 },    // linksonder
    ],
    kleur: '#a0a8b0',
    isGemeenschappelijk: true
  },

  // === SLAAPKAMER 2 (rechtsonder) ===
  // 2.31m breed x 3.30m diep
  // Bevat een inbouwkast linksboven (voor wasmachine)
  {
    id: 'slaapkamer2',
    naam: 'Slaapkamer',
    x: 5.96,
    y: 7.04,
    breedte: 2.31,
    hoogte: 3.30,
    kleur: '#dce8f0'
  },

  // === BALKON ===
  // Linksboven, toegankelijk vanuit de keuken via schuifpui
  {
    id: 'balkon',
    naam: 'Balkon',
    x: 0.30,
    y: -1.50,
    breedte: 1.80,
    hoogte: 1.30,
    kleur: '#b0c0a8'
  }
]

// ============================================================================
// DEUREN - Met openingsrichting
// ============================================================================

export const deuren: Deur[] = [
  // Voordeur - bij de entree, opent naar binnen (naar links)
  {
    id: 'voordeur',
    x: 4.50,
    y: 6.34,
    breedte: 0.90,
    richting: 'zuid',
    openingsHoek: 90,
    opensNaar: 'binnen'
  },
  // Deur slaapkamer 1 - aan de onderkant, opent naar binnen
  {
    id: 'deur-slaapkamer1',
    x: 4.20,
    y: 3.51,
    breedte: 0.80,
    richting: 'zuid',
    openingsHoek: 90,
    opensNaar: 'binnen'
  },
  // Deur badkamer - aan de linkerkant, opent naar binnen
  {
    id: 'deur-badkamer',
    x: 5.96,
    y: 4.20,
    breedte: 0.70,
    richting: 'west',
    openingsHoek: 90,
    opensNaar: 'binnen'
  },
  // Deur toilet - aan de linkerkant, opent naar binnen
  {
    id: 'deur-toilet',
    x: 5.96,
    y: 5.70,
    breedte: 0.65,
    richting: 'west',
    openingsHoek: 90,
    opensNaar: 'binnen'
  },
  // Deur slaapkamer 2 - aan de bovenkant, opent naar binnen
  {
    id: 'deur-slaapkamer2',
    x: 6.40,
    y: 7.04,
    breedte: 0.80,
    richting: 'noord',
    openingsHoek: 90,
    opensNaar: 'binnen'
  },
  // Balkondeur/schuifpui - in de keuken
  {
    id: 'deur-balkon',
    x: 0.50,
    y: 0,
    breedte: 1.50,
    richting: 'noord',
    openingsHoek: 0,  // Schuifpui
    opensNaar: 'buiten'
  }
]

// ============================================================================
// RAMEN
// ============================================================================

export const ramen: Raam[] = [
  // Raam slaapkamer 1 - aan de bovenkant (noordzijde)
  {
    id: 'raam-slaapkamer1',
    x: 4.50,
    y: 0,
    breedte: 1.50,
    richting: 'noord'
  },
  // Raam kast - klein raam rechtsboven
  {
    id: 'raam-kast',
    x: 7.20,
    y: 0,
    breedte: 0.60,
    richting: 'noord'
  },
  // Raam badkamer - klein raam rechts
  {
    id: 'raam-badkamer',
    x: 8.17,
    y: 4.00,
    breedte: 0.80,
    richting: 'oost'
  },
  // Raam slaapkamer 2 - aan de rechterkant
  {
    id: 'raam-slaapkamer2',
    x: 8.17,
    y: 8.50,
    breedte: 1.20,
    richting: 'oost'
  }
]

// ============================================================================
// INGEBOUWDE ELEMENTEN (kasten, sanitair, keukenapparatuur)
// ============================================================================

export const ingebouwdeElementen: IngebouwdElement[] = [
  // Keuken aanrecht met kookplaat (rechterzijde keuken)
  {
    id: 'aanrecht',
    naam: 'Aanrecht',
    x: 3.08,
    y: 0.80,
    breedte: 0.60,
    hoogte: 2.50,
    kleur: '#d0d0d0',
    type: 'aanrecht'
  },
  // Douche in badkamer (rond element rechts)
  {
    id: 'douche',
    naam: 'Douche',
    x: 7.37,
    y: 3.71,
    breedte: 0.90,
    hoogte: 0.90,
    kleur: '#a8c8e0',
    type: 'douche'
  },
  // Wastafel in badkamer
  {
    id: 'wastafel-badkamer',
    naam: 'Wastafel',
    x: 6.10,
    y: 3.71,
    breedte: 0.60,
    hoogte: 0.45,
    kleur: '#e0e0e0',
    type: 'wastafel'
  },
  // WC in toilet
  {
    id: 'wc',
    naam: 'WC',
    x: 6.80,
    y: 5.60,
    breedte: 0.40,
    hoogte: 0.60,
    kleur: '#e0e0e0',
    type: 'wc'
  },
  // Wasmachine kast in slaapkamer 2 (linksboven in de kamer)
  {
    id: 'waskast',
    naam: 'Waskast',
    x: 5.96,
    y: 7.04,
    breedte: 0.70,
    hoogte: 1.20,
    kleur: '#b8b8b8',
    type: 'wasmachine'
  }
]

// ============================================================================
// MEUBELS - Beschikbaar om te plaatsen
// ============================================================================

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
