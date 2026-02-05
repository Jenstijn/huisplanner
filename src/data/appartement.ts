import { Kamer, Meubel, IngebouwdElement, Muur } from '../types'

// Schaal: 1 meter = 50 pixels
export const PIXELS_PER_METER = 50

// ============================================================================
// COÖRDINAAT TRANSFORMATIE
// ============================================================================
// FML coördinaten zijn in centimeters met negatieve waarden
// We transformeren naar meters met positieve coördinaten:
// x_meter = (x_fml + 180) / 100
// y_meter = (y_fml + 5) / 100
// ============================================================================

const FML_OFFSET_X = 180 // cm
const FML_OFFSET_Y = 5   // cm

// Helper functie om FML coördinaten naar app coördinaten te converteren
const transformCoord = (x_fml: number, y_fml: number): { x: number; y: number } => {
  const x = (x_fml + FML_OFFSET_X) / 100
  const y = (y_fml + FML_OFFSET_Y) / 100
  return { x, y }
}

// Helper om een array van FML punten te transformeren
const transformPoly = (points: { x: number; y: number }[]): { x: number; y: number }[] => {
  return points.map(p => transformCoord(p.x, p.y))
}

// Helper functie voor items: FML x,y is CENTER-point, niet top-left!
const transformItem = (
  x_fml: number,
  y_fml: number,
  width_cm: number,
  height_cm: number,
  rotation: number
): { x: number; y: number; breedte: number; hoogte: number } => {
  const center_x = (x_fml + FML_OFFSET_X) / 100
  const center_y = (y_fml + FML_OFFSET_Y) / 100

  // Bij 90° of 270° rotatie: swap width/height voor display
  const swapped = rotation === 90 || rotation === 270
  const display_w = swapped ? height_cm / 100 : width_cm / 100
  const display_h = swapped ? width_cm / 100 : height_cm / 100

  return {
    x: center_x - display_w / 2,
    y: center_y - display_h / 2,
    breedte: display_w,
    hoogte: display_h
  }
}

// ============================================================================
// APPARTEMENT KAMERS - Exacte polygonen uit FML bestand
// ============================================================================

export const appartementKamers: Kamer[] = [
  // === WOONKAMER (grote L-vormige ruimte links) ===
  {
    id: 'woonkamer',
    naam: 'Woonkamer',
    punten: transformPoly([
      { x: -167.65, y: 1165.47 },
      { x: 71.37, y: 1165.47 },
      { x: 75.11, y: 1149.45 },
      { x: 121.25, y: 1149.45 },
      { x: 202.26, y: 1071.82 },
      { x: 202.26, y: 718.09 },
      { x: 202.26, y: 490.24 },
      { x: 202.26, y: 210.33 },
      { x: 128.15, y: 131.47 },
      { x: -167.65, y: 131.47 }
    ]),
    kleur: '#f5f5f5'
  },

  // === SLAAPKAMER 1 (rechtsboven) ===
  {
    id: 'slaapkamer1',
    naam: 'Slaapkamer',
    punten: transformPoly([
      { x: 212.26, y: 485.24 },
      { x: 385.25, y: 485.24 },
      { x: 511.01, y: 485.24 },
      { x: 596.73, y: 485.24 },
      { x: 596.73, y: 131.47 },
      { x: 212.26, y: 131.47 },
      { x: 212.26, y: 208.35 }
    ]),
    kleur: '#e8f0f8'
  },

  // === KAST (rechtsboven hoek) ===
  {
    id: 'kast',
    naam: 'Kast',
    punten: transformPoly([
      { x: 606.73, y: 485.24 },
      { x: 659.35, y: 485.24 },
      { x: 659.35, y: 131.47 },
      { x: 606.73, y: 131.47 }
    ]),
    kleur: '#d8d8d8'
  },

  // === SLAAPKAMER 2 (rechtsonder) ===
  {
    id: 'slaapkamer2',
    naam: 'Slaapkamer',
    punten: transformPoly([
      { x: 427.26, y: 802.47 },
      { x: 427.26, y: 1129.86 },
      { x: 446.94, y: 1129.86 },
      { x: 659.35, y: 1129.86 },
      { x: 659.35, y: 902.47 },
      { x: 586.85, y: 902.47 },
      { x: 586.85, y: 802.47 },
      { x: 511.01, y: 802.47 }
    ]),
    kleur: '#e8f0f8'
  },

  // === BADKAMER ===
  {
    id: 'badkamer',
    naam: 'Badkamer',
    punten: transformPoly([
      { x: 390.25, y: 495.24 },
      { x: 390.25, y: 587.93 },
      { x: 506.01, y: 587.93 },
      { x: 516.01, y: 592.93 },
      { x: 516.01, y: 692.18 },
      { x: 606.85, y: 692.18 },
      { x: 606.85, y: 627.18 },
      { x: 659.35, y: 627.18 },
      { x: 659.35, y: 495.24 },
      { x: 601.73, y: 495.24 },
      { x: 516.01, y: 495.24 },
      { x: 506.01, y: 495.24 }
    ]),
    kleur: '#d0e8f0'
  },

  // === TOILET ===
  {
    id: 'toilet',
    naam: 'Toilet',
    punten: transformPoly([
      { x: 516.01, y: 792.47 },
      { x: 591.85, y: 792.47 },
      { x: 642.19, y: 792.47 },
      { x: 642.19, y: 702.18 },
      { x: 611.85, y: 702.18 },
      { x: 516.01, y: 702.18 }
    ]),
    kleur: '#d0e8f0'
  },

  // === ENTREE ===
  {
    id: 'entree',
    naam: 'Entree',
    punten: transformPoly([
      { x: 212.26, y: 711.94 },
      { x: 306.98, y: 692.18 },
      { x: 394.97, y: 692.18 },
      { x: 427.26, y: 729.49 },
      { x: 427.26, y: 792.47 },
      { x: 506.01, y: 792.47 },
      { x: 506.01, y: 697.18 },
      { x: 506.01, y: 597.93 },
      { x: 380.25, y: 597.93 },
      { x: 380.25, y: 495.24 },
      { x: 212.26, y: 495.24 }
    ]),
    kleur: '#8a9eb0'
  },

  // === TRAPPENHUIS (gemeenschappelijk) ===
  {
    id: 'trappenhuis',
    naam: 'Trappenhuis',
    punten: transformPoly([
      { x: 212.26, y: 722.15 },
      { x: 212.26, y: 1073.96 },
      { x: 212.26, y: 1165.47 },
      { x: 417.26, y: 1165.47 },
      { x: 417.26, y: 1142.36 },
      { x: 417.26, y: 797.47 },
      { x: 417.26, y: 733.22 },
      { x: 390.40, y: 702.18 },
      { x: 308.01, y: 702.18 }
    ]),
    kleur: '#c0c8d0',
    isGemeenschappelijk: true
  },

  // === BALKON (buiten) ===
  {
    id: 'balkon',
    naam: 'Balkon',
    punten: transformPoly([
      { x: 257.13, y: 106.47 },
      { x: -178.25, y: 106.47 },
      { x: -178.25, y: -4.89 },
      { x: 222.36, y: -4.89 }
    ]),
    kleur: '#c8d8c8'
  }
]

// ============================================================================
// MUREN - ALLE muren uit FML walls array
// ============================================================================

export const muren: Muur[] = [
  // === BUITENMUREN ===

  // Westmuur (hele linkerkant)
  {
    id: 'buitenmuur-west',
    start: transformCoord(-180.15, 1177.97),
    eind: transformCoord(-180.15, 118.97),
    dikte: 25,
    isBuiten: true,
    openings: []
  },

  // Zuidmuur woonkamer links (met groot raam)
  {
    id: 'buitenmuur-zuid-links',
    start: transformCoord(73.60, 1177.97),
    eind: transformCoord(-180.15, 1177.97),
    dikte: 25,
    isBuiten: true,
    openings: [
      { type: 'raam', t: 0.4779, breedte: 2.26 }
    ]
  },

  // Zuidmuur midden
  {
    id: 'buitenmuur-zuid-midden',
    start: transformCoord(207.26, 1177.97),
    eind: transformCoord(73.60, 1177.97),
    dikte: 25,
    isBuiten: true,
    openings: []
  },

  // Zuidmuur trappenhuis
  {
    id: 'buitenmuur-zuid-trap',
    start: transformCoord(422.26, 1177.97),
    eind: transformCoord(207.26, 1177.97),
    dikte: 25,
    isBuiten: true,
    openings: []
  },

  // Noordmuur woonkamer (met balkondeur en 2 ramen)
  {
    id: 'buitenmuur-noord-woonkamer',
    start: transformCoord(-180.15, 118.97),
    eind: transformCoord(123.26, 118.97),
    dikte: 25,
    isBuiten: true,
    openings: [
      { type: 'raam', t: 0.1649, breedte: 0.67 },
      { type: 'deur', t: 0.5012, breedte: 1.36, swing: 'schuif' },
      { type: 'raam', t: 0.8339, breedte: 0.67 }
    ]
  },

  // Noordmuur hoek
  {
    id: 'buitenmuur-noord-hoek',
    start: transformCoord(123.26, 118.97),
    eind: transformCoord(207.26, 118.97),
    dikte: 25,
    isBuiten: true,
    openings: []
  },

  // Noordmuur slaapkamer 1 (met 2 ramen)
  {
    id: 'buitenmuur-noord-slaapkamer1',
    start: transformCoord(207.26, 118.97),
    eind: transformCoord(601.73, 118.97),
    dikte: 25,
    isBuiten: true,
    openings: [
      { type: 'raam', t: 0.3418, breedte: 1.00 },
      { type: 'raam', t: 0.7963, breedte: 1.00 }
    ]
  },

  // Noordmuur kast
  {
    id: 'buitenmuur-noord-kast',
    start: transformCoord(601.73, 118.97),
    eind: transformCoord(671.85, 118.97),
    dikte: 25,
    isBuiten: true,
    openings: []
  },

  // Oostmuur boven (kast + badkamer)
  {
    id: 'buitenmuur-oost-boven',
    start: transformCoord(671.85, 118.97),
    eind: transformCoord(671.85, 490.24),
    dikte: 25,
    isBuiten: true,
    openings: []
  },

  // Oostmuur midden
  {
    id: 'buitenmuur-oost-midden1',
    start: transformCoord(671.85, 490.24),
    eind: transformCoord(671.85, 632.18),
    dikte: 25,
    isBuiten: true,
    openings: []
  },

  // Oostmuur toilet
  {
    id: 'buitenmuur-oost-midden2',
    start: transformCoord(671.85, 632.18),
    eind: transformCoord(671.85, 697.18),
    dikte: 25,
    isBuiten: true,
    openings: []
  },

  // Oostmuur toilet-slaapkamer
  {
    id: 'buitenmuur-oost-midden3',
    start: transformCoord(671.85, 697.18),
    eind: transformCoord(671.85, 797.47),
    dikte: 25,
    isBuiten: true,
    openings: []
  },

  // Oostmuur slaapkamer 2 boven
  {
    id: 'buitenmuur-oost-midden4',
    start: transformCoord(671.85, 797.47),
    eind: transformCoord(671.85, 897.47),
    dikte: 25,
    isBuiten: true,
    openings: []
  },

  // Oostmuur slaapkamer 2 onder
  {
    id: 'buitenmuur-oost-onder',
    start: transformCoord(671.85, 897.47),
    eind: transformCoord(671.85, 1142.36),
    dikte: 25,
    isBuiten: true,
    openings: []
  },

  // Zuidmuur slaapkamer 2 (met groot raam)
  {
    id: 'buitenmuur-zuid-slaapkamer2',
    start: transformCoord(671.85, 1142.36),
    eind: transformCoord(446.94, 1142.36),
    dikte: 25,
    isBuiten: true,
    openings: [
      { type: 'raam', t: 0.5075, breedte: 1.94 }
    ]
  },

  // Zuidmuur slaapkamer 2 hoek
  {
    id: 'buitenmuur-zuid-slaapkamer2-hoek',
    start: transformCoord(446.94, 1142.36),
    eind: transformCoord(422.26, 1142.36),
    dikte: 25,
    isBuiten: true,
    openings: []
  },

  // Schuine muur slaapkamer 2
  {
    id: 'buitenmuur-schuin-slaapkamer2',
    start: transformCoord(422.26, 1177.97),
    eind: transformCoord(446.94, 1142.36),
    dikte: 25,
    isBuiten: true,
    openings: []
  },

  // === BINNENMUREN ===

  // Schuine muur woonkamer-entree
  {
    id: 'binnenmuur-schuin-woonkamer',
    start: transformCoord(123.26, 118.97),
    eind: transformCoord(207.26, 208.35),
    dikte: 10,
    openings: []
  },

  // Verticale muur bij keuken
  {
    id: 'binnenmuur-keuken',
    start: transformCoord(207.26, 208.35),
    eind: transformCoord(207.26, 118.97),
    dikte: 10,
    openings: []
  },

  // Muur woonkamer-entree verticaal (met deur naar woonkamer)
  {
    id: 'binnenmuur-woonkamer-entree',
    start: transformCoord(207.26, 718.09),
    eind: transformCoord(207.26, 490.24),
    dikte: 10,
    openings: [
      { type: 'deur', t: 0.2531, breedte: 0.85, swing: 'rechts' }
    ]
  },

  // Muur woonkamer-trappenhuis verticaal
  {
    id: 'binnenmuur-woonkamer-trap',
    start: transformCoord(207.26, 1073.96),
    eind: transformCoord(207.26, 718.09),
    dikte: 10,
    openings: []
  },

  // Muur entree-slaapkamer1 (met deur)
  {
    id: 'binnenmuur-entree-slaapkamer1',
    start: transformCoord(207.26, 490.24),
    eind: transformCoord(385.25, 490.24),
    dikte: 10,
    openings: [
      { type: 'deur', t: 0.4978, breedte: 0.85, swing: 'links' }
    ]
  },

  // Muur slaapkamer1-badkamer
  {
    id: 'binnenmuur-slaapkamer1-badkamer',
    start: transformCoord(385.25, 490.24),
    eind: transformCoord(511.01, 490.24),
    dikte: 10,
    openings: []
  },

  // Muur badkamer-kast
  {
    id: 'binnenmuur-badkamer-kast',
    start: transformCoord(511.01, 490.24),
    eind: transformCoord(601.73, 490.24),
    dikte: 10,
    openings: []
  },

  // Muur kast-buitenmuur
  {
    id: 'binnenmuur-kast-buiten',
    start: transformCoord(601.73, 490.24),
    eind: transformCoord(671.85, 490.24),
    dikte: 10,
    openings: []
  },

  // Kastmuur (GEEN swing arcs - gewoon gesloten)
  {
    id: 'binnenmuur-kast-verticaal',
    start: transformCoord(601.73, 490.24),
    eind: transformCoord(601.73, 118.97),
    dikte: 10,
    openings: []  // Geen deuren meer hier - kastdeuren zijn dicht
  },

  // Muur entree-badkamer verticaal (met deur)
  {
    id: 'binnenmuur-entree-badkamer',
    start: transformCoord(511.01, 490.24),
    eind: transformCoord(511.01, 571.63),
    dikte: 10,
    openings: [
      { type: 'deur', t: 0.6002, breedte: 0.85, swing: 'links' }
    ]
  },

  // Korte muur badkamer
  {
    id: 'binnenmuur-badkamer-kort',
    start: transformCoord(511.01, 578.56),
    eind: transformCoord(511.01, 592.93),
    dikte: 10,
    openings: []
  },

  // Muur badkamer horizontaal
  {
    id: 'binnenmuur-badkamer-horizontaal',
    start: transformCoord(385.25, 592.93),
    eind: transformCoord(511.01, 592.93),
    dikte: 10,
    openings: []
  },

  // Muur entree-badkamer verticaal onder (met deur naar gang)
  {
    id: 'binnenmuur-badkamer-gang',
    start: transformCoord(511.01, 592.93),
    eind: transformCoord(511.01, 697.18),
    dikte: 10,
    openings: [
      { type: 'deur', t: 0.5112, breedte: 0.85, swing: 'rechts' }
    ]
  },

  // Muur entree-toilet (met deur)
  {
    id: 'binnenmuur-entree-toilet',
    start: transformCoord(511.01, 697.18),
    eind: transformCoord(511.01, 797.47),
    dikte: 10,
    openings: [
      { type: 'deur', t: 0.4959, breedte: 0.79, swing: 'links' }
    ]
  },

  // Muur slaapkamer2 boven (met deur)
  {
    id: 'binnenmuur-slaapkamer2-boven',
    start: transformCoord(511.01, 797.47),
    eind: transformCoord(422.26, 797.47),
    dikte: 10,
    openings: [
      { type: 'deur', t: 0.5014, breedte: 0.75, swing: 'rechts' }
    ]
  },

  // Muur toilet boven
  {
    id: 'binnenmuur-toilet-boven',
    start: transformCoord(511.01, 797.47),
    eind: transformCoord(591.85, 797.47),
    dikte: 10,
    openings: []
  },

  // Muur toilet-slaapkamer2
  {
    id: 'binnenmuur-toilet-slaapkamer2',
    start: transformCoord(591.85, 797.47),
    eind: transformCoord(647.19, 797.47),
    dikte: 10,
    openings: []
  },

  // Muur slaapkamer2 verticaal (met deuren naar wasruimte)
  {
    id: 'binnenmuur-slaapkamer2-verticaal',
    start: transformCoord(591.85, 797.47),
    eind: transformCoord(591.85, 897.47),
    dikte: 10,
    openings: [
      { type: 'deur', t: 0.29, breedte: 0.40 },
      { type: 'deur', t: 0.69, breedte: 0.40 }
    ]
  },

  // Muur slaapkamer2-buitenmuur
  {
    id: 'binnenmuur-slaapkamer2-buiten',
    start: transformCoord(591.85, 897.47),
    eind: transformCoord(671.85, 897.47),
    dikte: 10,
    openings: []
  },

  // Muur toilet verticaal
  {
    id: 'binnenmuur-toilet-verticaal',
    start: transformCoord(647.19, 697.18),
    eind: transformCoord(647.19, 797.47),
    dikte: 10,
    openings: []
  },

  // Muur toilet-buitenmuur
  {
    id: 'binnenmuur-toilet-buiten',
    start: transformCoord(647.19, 797.47),
    eind: transformCoord(671.85, 797.47),
    dikte: 10,
    openings: []
  },

  // Muur toilet horizontaal boven
  {
    id: 'binnenmuur-toilet-horizontaal',
    start: transformCoord(671.85, 697.18),
    eind: transformCoord(647.19, 697.18),
    dikte: 10,
    openings: []
  },

  // Muur badkamer-doucheruimte (met deur)
  {
    id: 'binnenmuur-badkamer-douche',
    start: transformCoord(611.85, 697.18),
    eind: transformCoord(611.85, 632.18),
    dikte: 10,
    openings: [
      { type: 'deur', t: 0.5096, breedte: 0.50, swing: 'links' }
    ]
  },

  // Muur badkamer-douche horizontaal
  {
    id: 'binnenmuur-badkamer-douche-h',
    start: transformCoord(611.85, 632.18),
    eind: transformCoord(671.85, 632.18),
    dikte: 10,
    openings: []
  },

  // Muur badkamer-toilet horizontaal
  {
    id: 'binnenmuur-badkamer-toilet',
    start: transformCoord(611.85, 697.18),
    eind: transformCoord(511.01, 697.18),
    dikte: 10,
    openings: []
  },

  // Muur badkamer-toilet hoek
  {
    id: 'binnenmuur-toilet-hoek',
    start: transformCoord(647.19, 697.18),
    eind: transformCoord(611.85, 697.18),
    dikte: 10,
    openings: []
  },

  // Muur entree verticaal
  {
    id: 'binnenmuur-entree-verticaal',
    start: transformCoord(385.25, 490.24),
    eind: transformCoord(385.25, 592.93),
    dikte: 10,
    openings: []
  },

  // Muur entree-trappenhuis schuine
  {
    id: 'binnenmuur-entree-trap-schuin',
    start: transformCoord(392.69, 697.18),
    eind: transformCoord(422.26, 731.36),
    dikte: 10,
    openings: []
  },

  // Muur trappenhuis verticaal
  {
    id: 'binnenmuur-trap-verticaal',
    start: transformCoord(422.26, 731.36),
    eind: transformCoord(422.26, 797.47),
    dikte: 10,
    openings: []
  },

  // Muur trappenhuis-slaapkamer2
  {
    id: 'binnenmuur-trap-slaapkamer2',
    start: transformCoord(422.26, 797.47),
    eind: transformCoord(422.26, 1142.36),
    dikte: 10,
    openings: []
  },

  // Muur trappenhuis-slaapkamer2 hoek
  {
    id: 'binnenmuur-trap-hoek',
    start: transformCoord(422.26, 1142.36),
    eind: transformCoord(422.26, 1177.97),
    dikte: 10,
    openings: []
  },

  // Voordeur muur (schuine muur naar trappenhuis)
  {
    id: 'binnenmuur-voordeur',
    start: transformCoord(207.26, 718.09),
    eind: transformCoord(307.50, 697.18),
    dikte: 10,
    openings: [
      { type: 'deur', t: 0.4829, breedte: 0.87, swing: 'links' }
    ]
  },

  // Muur entree-trappenhuis horizontaal
  {
    id: 'binnenmuur-entree-trap-h',
    start: transformCoord(307.50, 697.18),
    eind: transformCoord(392.69, 697.18),
    dikte: 10,
    openings: []
  },

  // Schuine muren woonkamer-trappenhuis
  {
    id: 'binnenmuur-woonkamer-trap-schuin1',
    start: transformCoord(73.60, 1177.97),
    eind: transformCoord(79.08, 1154.45),
    dikte: 10,
    openings: []
  },
  {
    id: 'binnenmuur-woonkamer-trap-schuin2',
    start: transformCoord(79.08, 1154.45),
    eind: transformCoord(123.26, 1154.45),
    dikte: 10,
    openings: []
  },
  {
    id: 'binnenmuur-woonkamer-trap-schuin3',
    start: transformCoord(123.26, 1154.45),
    eind: transformCoord(207.26, 1073.96),
    dikte: 10,
    openings: []
  },
  {
    id: 'binnenmuur-woonkamer-trap-vert',
    start: transformCoord(207.26, 1177.97),
    eind: transformCoord(207.26, 1073.96),
    dikte: 10,
    openings: []
  }
]

// ============================================================================
// INGEBOUWDE ELEMENTEN - Exacte posities uit FML items (GEEN labels)
// ============================================================================

export const ingebouwdeElementen: IngebouwdElement[] = [
  // === TOILET ===
  {
    id: 'wc',
    naam: '',
    ...transformItem(618.86, 747.14, 35.27, 46.67, 90),
    kleur: '#ffffff',
    type: 'wc'
  },
  {
    id: 'wastafel-toilet',
    naam: '',
    ...transformItem(548.12, 714.43, 30.80, 24.49, 0),
    kleur: '#ffffff',
    type: 'wastafel'
  },

  // === BADKAMER ===
  {
    id: 'douche',
    naam: '',
    ...transformItem(637.79, 662.75, 42, 42, 270),
    kleur: '#a8d8e8',
    type: 'douche'
  },
  {
    id: 'bad',
    naam: '',
    ...transformItem(633.32, 561.60, 131.16, 52.06, 90),
    kleur: '#a8d8e8',
    type: 'bad'
  },
  {
    id: 'wastafel-bad',
    naam: '',
    ...transformItem(632.19, 557.77, 39.09, 34.63, 90),
    kleur: '#ffffff',
    type: 'wastafel'
  },

  // === KEUKEN (WOONKAMER) ===
  {
    id: 'kookplaat',
    naam: '',
    ...transformItem(170.38, 240.38, 60.10, 63.75, 90),
    kleur: '#303030',
    type: 'aanrecht'
  },
  {
    id: 'aanrecht',
    naam: '',
    ...transformItem(169.60, 401.95, 263.05, 65.31, 90),
    kleur: '#e0e0e0',
    type: 'aanrecht'
  },
  {
    id: 'koelkast',
    naam: '',
    ...transformItem(170.12, 564.98, 62.99, 64.27, 90),
    kleur: '#c8c8c8',
    type: 'kast'
  },
  {
    id: 'spoelbak',
    naam: '',
    ...transformItem(172.16, 343.34, 55.20, 60.20, 180),
    kleur: '#b8b8b8',
    type: 'aanrecht'
  },
  {
    id: 'oven',
    naam: '',
    ...transformItem(167.95, 443.43, 45.80, 44.57, 90),
    kleur: '#404040',
    type: 'aanrecht'
  },

  // === SLAAPKAMER 2 ===
  {
    id: 'wasmachine',
    naam: '',
    ...transformItem(627.71, 846.39, 42, 49, 90),
    kleur: '#d8d8d8',
    type: 'wasmachine'
  }
]

// ============================================================================
// MEUBELS - Beschikbaar om te plaatsen
// ============================================================================

export const beschikbareMeubels: Meubel[] = [
  // === WOONKAMER ===
  {
    id: 'bank',
    naam: 'Bank',
    breedte: 2.2,
    hoogte: 0.9,
    kleur: '#6b8e23',
    icoon: 'bank',
    categorie: 'woonkamer',
    beschikbareAfmetingen: [
      { label: '2-zits (180cm)', breedte: 1.8, hoogte: 0.9 },
      { label: '3-zits (220cm)', breedte: 2.2, hoogte: 0.9 },
      { label: '4-zits (260cm)', breedte: 2.6, hoogte: 0.9 },
    ],
    handmatigeAfmetingen: true,
    minBreedte: 1.0,
    maxBreedte: 4.0,
    minHoogte: 0.6,
    maxHoogte: 1.5
  },
  {
    id: 'hoekbank',
    naam: 'Hoekbank',
    breedte: 2.8,
    hoogte: 2.2,
    kleur: '#6b8e23',
    icoon: 'hoekbank',
    categorie: 'woonkamer',
    beschikbareAfmetingen: [
      { label: 'Klein (240x200)', breedte: 2.4, hoogte: 2.0 },
      { label: 'Groot (280x220)', breedte: 2.8, hoogte: 2.2 },
    ],
    handmatigeAfmetingen: true,
    minBreedte: 2.0,
    maxBreedte: 4.0,
    minHoogte: 1.5,
    maxHoogte: 3.0
  },
  {
    id: 'fauteuil',
    naam: 'Fauteuil',
    breedte: 0.9,
    hoogte: 0.9,
    kleur: '#8b7355',
    icoon: 'fauteuil',
    categorie: 'woonkamer',
    handmatigeAfmetingen: true,
    minBreedte: 0.6,
    maxBreedte: 1.2,
    minHoogte: 0.6,
    maxHoogte: 1.2
  },
  {
    id: 'chaise-longue-links',
    naam: 'Chaise Longue (Links)',
    breedte: 2.0,
    hoogte: 0.9,
    kleur: '#7a9a50',
    icoon: 'chaise-longue-links',
    categorie: 'woonkamer',
    beschikbareAfmetingen: [
      { label: 'Compact (180x85)', breedte: 1.8, hoogte: 0.85 },
      { label: 'Standaard (200x90)', breedte: 2.0, hoogte: 0.9 },
      { label: 'Groot (220x95)', breedte: 2.2, hoogte: 0.95 },
    ],
    handmatigeAfmetingen: true,
    minBreedte: 1.5,
    maxBreedte: 2.5,
    minHoogte: 0.7,
    maxHoogte: 1.1
  },
  {
    id: 'chaise-longue-rechts',
    naam: 'Chaise Longue (Rechts)',
    breedte: 2.0,
    hoogte: 0.9,
    kleur: '#7a9a50',
    icoon: 'chaise-longue-rechts',
    categorie: 'woonkamer',
    beschikbareAfmetingen: [
      { label: 'Compact (180x85)', breedte: 1.8, hoogte: 0.85 },
      { label: 'Standaard (200x90)', breedte: 2.0, hoogte: 0.9 },
      { label: 'Groot (220x95)', breedte: 2.2, hoogte: 0.95 },
    ],
    handmatigeAfmetingen: true,
    minBreedte: 1.5,
    maxBreedte: 2.5,
    minHoogte: 0.7,
    maxHoogte: 1.1
  },
  {
    id: 'salontafel',
    naam: 'Salontafel',
    breedte: 1.2,
    hoogte: 0.6,
    kleur: '#cd853f',
    icoon: 'salontafel',
    categorie: 'woonkamer',
    beschikbareAfmetingen: [
      { label: 'Klein (100x50)', breedte: 1.0, hoogte: 0.5 },
      { label: 'Medium (120x60)', breedte: 1.2, hoogte: 0.6 },
      { label: 'Groot (140x70)', breedte: 1.4, hoogte: 0.7 },
    ],
    handmatigeAfmetingen: true,
    minBreedte: 0.6,
    maxBreedte: 2.0,
    minHoogte: 0.4,
    maxHoogte: 1.2
  },
  {
    id: 'salontafel-rond',
    naam: 'Ronde Salontafel',
    breedte: 0.8,
    hoogte: 0.8,
    kleur: '#cd853f',
    icoon: 'salontafel-rond',
    categorie: 'woonkamer',
    beschikbareAfmetingen: [
      { label: 'Klein (60cm)', breedte: 0.6, hoogte: 0.6 },
      { label: 'Medium (80cm)', breedte: 0.8, hoogte: 0.8 },
      { label: 'Groot (100cm)', breedte: 1.0, hoogte: 1.0 },
    ],
    handmatigeAfmetingen: true,
    minBreedte: 0.4,
    maxBreedte: 1.5,
    minHoogte: 0.4,
    maxHoogte: 1.5
  },
  {
    id: 'tv-meubel',
    naam: 'TV Meubel',
    breedte: 1.8,
    hoogte: 0.45,
    kleur: '#4a4a4a',
    icoon: 'tv-meubel',
    categorie: 'woonkamer',
    beschikbareAfmetingen: [
      { label: 'Klein (120cm)', breedte: 1.2, hoogte: 0.45 },
      { label: 'Medium (180cm)', breedte: 1.8, hoogte: 0.45 },
      { label: 'Groot (220cm)', breedte: 2.2, hoogte: 0.45 },
    ],
    handmatigeAfmetingen: true,
    minBreedte: 0.8,
    maxBreedte: 3.0,
    minHoogte: 0.3,
    maxHoogte: 0.8
  },
  {
    id: 'boekenkast',
    naam: 'Boekenkast',
    breedte: 1.0,
    hoogte: 0.4,
    kleur: '#8b4513',
    icoon: 'boekenkast',
    categorie: 'woonkamer',
    beschikbareAfmetingen: [
      { label: 'Smal (80cm)', breedte: 0.8, hoogte: 0.4 },
      { label: 'Normaal (100cm)', breedte: 1.0, hoogte: 0.4 },
      { label: 'Breed (120cm)', breedte: 1.2, hoogte: 0.4 },
    ],
    handmatigeAfmetingen: true,
    minBreedte: 0.4,
    maxBreedte: 3.0,
    minHoogte: 0.3,
    maxHoogte: 0.8
  },

  // === SLAAPKAMER ===
  {
    id: 'tweepersoonsbed',
    naam: '2-pers Bed',
    breedte: 1.6,
    hoogte: 2.0,
    kleur: '#4169e1',
    icoon: 'bed-dubbel',
    categorie: 'slaapkamer',
    beschikbareAfmetingen: [
      { label: '120x200cm', breedte: 1.2, hoogte: 2.0 },
      { label: '140x200cm', breedte: 1.4, hoogte: 2.0 },
      { label: '160x200cm', breedte: 1.6, hoogte: 2.0 },
      { label: '180x200cm', breedte: 1.8, hoogte: 2.0 },
      { label: '180x210cm', breedte: 1.8, hoogte: 2.1 },
    ],
    handmatigeAfmetingen: true,
    minBreedte: 1.0,
    maxBreedte: 2.0,
    minHoogte: 1.9,
    maxHoogte: 2.2
  },
  {
    id: 'eenpersoonsbed',
    naam: '1-pers Bed',
    breedte: 0.9,
    hoogte: 2.0,
    kleur: '#4169e1',
    icoon: 'bed-enkel',
    categorie: 'slaapkamer',
    beschikbareAfmetingen: [
      { label: '80x200cm', breedte: 0.8, hoogte: 2.0 },
      { label: '90x200cm', breedte: 0.9, hoogte: 2.0 },
      { label: '100x200cm', breedte: 1.0, hoogte: 2.0 },
    ],
    handmatigeAfmetingen: true,
    minBreedte: 0.7,
    maxBreedte: 1.2,
    minHoogte: 1.9,
    maxHoogte: 2.2
  },
  {
    id: 'nachtkastje',
    naam: 'Nachtkastje',
    breedte: 0.45,
    hoogte: 0.45,
    kleur: '#deb887',
    icoon: 'nachtkastje',
    categorie: 'slaapkamer',
    handmatigeAfmetingen: true,
    minBreedte: 0.3,
    maxBreedte: 0.7,
    minHoogte: 0.3,
    maxHoogte: 0.7
  },
  {
    id: 'kledingkast',
    naam: 'Kledingkast',
    breedte: 1.5,
    hoogte: 0.6,
    kleur: '#8b7355',
    icoon: 'kledingkast',
    categorie: 'slaapkamer',
    beschikbareAfmetingen: [
      { label: '2-deurs (100cm)', breedte: 1.0, hoogte: 0.6 },
      { label: '3-deurs (150cm)', breedte: 1.5, hoogte: 0.6 },
      { label: '4-deurs (200cm)', breedte: 2.0, hoogte: 0.6 },
    ],
    handmatigeAfmetingen: true,
    minBreedte: 0.5,
    maxBreedte: 3.0,
    minHoogte: 0.4,
    maxHoogte: 0.8
  },
  {
    id: 'bureau',
    naam: 'Bureau',
    breedte: 1.2,
    hoogte: 0.6,
    kleur: '#d2b48c',
    icoon: 'bureau',
    categorie: 'slaapkamer',
    beschikbareAfmetingen: [
      { label: 'Compact (100x50)', breedte: 1.0, hoogte: 0.5 },
      { label: 'Standaard (120x60)', breedte: 1.2, hoogte: 0.6 },
      { label: 'Groot (160x80)', breedte: 1.6, hoogte: 0.8 },
    ],
    handmatigeAfmetingen: true,
    minBreedte: 0.6,
    maxBreedte: 2.5,
    minHoogte: 0.4,
    maxHoogte: 1.0
  },
  {
    id: 'bureaustoel',
    naam: 'Bureaustoel',
    breedte: 0.5,
    hoogte: 0.5,
    kleur: '#2f4f4f',
    icoon: 'bureaustoel',
    categorie: 'slaapkamer',
    handmatigeAfmetingen: true,
    minBreedte: 0.4,
    maxBreedte: 0.7,
    minHoogte: 0.4,
    maxHoogte: 0.7
  },

  // === EETKAMER ===
  {
    id: 'eettafel',
    naam: 'Eettafel',
    breedte: 1.6,
    hoogte: 0.9,
    kleur: '#a0522d',
    icoon: 'eettafel',
    categorie: 'eetkamer',
    beschikbareAfmetingen: [
      { label: '4-persoons (140x80)', breedte: 1.4, hoogte: 0.8 },
      { label: '6-persoons (160x90)', breedte: 1.6, hoogte: 0.9 },
      { label: '8-persoons (200x100)', breedte: 2.0, hoogte: 1.0 },
      { label: '10-persoons (240x100)', breedte: 2.4, hoogte: 1.0 },
    ],
    handmatigeAfmetingen: true,
    minBreedte: 0.8,
    maxBreedte: 3.5,
    minHoogte: 0.6,
    maxHoogte: 1.5
  },
  {
    id: 'eettafel-rond',
    naam: 'Ronde Eettafel',
    breedte: 1.2,
    hoogte: 1.2,
    kleur: '#a0522d',
    icoon: 'eettafel-rond',
    categorie: 'eetkamer',
    beschikbareAfmetingen: [
      { label: '4-persoons (100cm)', breedte: 1.0, hoogte: 1.0 },
      { label: '6-persoons (120cm)', breedte: 1.2, hoogte: 1.2 },
      { label: '8-persoons (150cm)', breedte: 1.5, hoogte: 1.5 },
    ],
    handmatigeAfmetingen: true,
    minBreedte: 0.8,
    maxBreedte: 2.0,
    minHoogte: 0.8,
    maxHoogte: 2.0
  },
  {
    id: 'eetkamerstoel',
    naam: 'Eetkamerstoel',
    breedte: 0.45,
    hoogte: 0.45,
    kleur: '#bc8f8f',
    icoon: 'stoel',
    categorie: 'eetkamer',
    handmatigeAfmetingen: true,
    minBreedte: 0.35,
    maxBreedte: 0.6,
    minHoogte: 0.35,
    maxHoogte: 0.6
  },

  // === ACCESSOIRES ===
  {
    id: 'plant-groot',
    naam: 'Grote Plant',
    breedte: 0.5,
    hoogte: 0.5,
    kleur: '#228b22',
    icoon: 'plant',
    categorie: 'accessoires',
    handmatigeAfmetingen: true,
    minBreedte: 0.3,
    maxBreedte: 1.0,
    minHoogte: 0.3,
    maxHoogte: 1.0
  },
  {
    id: 'plant-klein',
    naam: 'Kleine Plant',
    breedte: 0.3,
    hoogte: 0.3,
    kleur: '#32cd32',
    icoon: 'plant',
    categorie: 'accessoires',
    handmatigeAfmetingen: true,
    minBreedte: 0.2,
    maxBreedte: 0.6,
    minHoogte: 0.2,
    maxHoogte: 0.6
  },
  {
    id: 'vloerlamp',
    naam: 'Vloerlamp',
    breedte: 0.35,
    hoogte: 0.35,
    kleur: '#ffd700',
    icoon: 'lamp',
    categorie: 'accessoires',
    handmatigeAfmetingen: true,
    minBreedte: 0.2,
    maxBreedte: 0.6,
    minHoogte: 0.2,
    maxHoogte: 0.6
  },
  {
    id: 'dressoir',
    naam: 'Dressoir',
    breedte: 1.5,
    hoogte: 0.45,
    kleur: '#8b7355',
    icoon: 'dressoir',
    categorie: 'accessoires',
    beschikbareAfmetingen: [
      { label: 'Klein (120cm)', breedte: 1.2, hoogte: 0.45 },
      { label: 'Groot (150cm)', breedte: 1.5, hoogte: 0.45 },
    ],
    handmatigeAfmetingen: true,
    minBreedte: 0.8,
    maxBreedte: 2.5,
    minHoogte: 0.3,
    maxHoogte: 0.6
  },
]
