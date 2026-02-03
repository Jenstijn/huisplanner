// Types voor de huisplanner

// Een punt in 2D (x, y in meters)
export interface Punt {
  x: number
  y: number
}

// Een kamer in de plattegrond
// Kan een rechthoek zijn (x, y, breedte, hoogte) OF een polygoon (punten)
export interface Kamer {
  id: string
  naam: string
  // Voor rechthoekige kamers:
  x?: number
  y?: number
  breedte?: number
  hoogte?: number
  // Voor polygoon kamers (schuine muren):
  punten?: Punt[]
  kleur: string
  isGemeenschappelijk?: boolean  // Voor trappenhuis etc.
}

// Een deur in de plattegrond
export interface Deur {
  id: string
  x: number           // positie in meters
  y: number
  breedte: number     // breedte van de deuropening
  richting: 'noord' | 'oost' | 'zuid' | 'west'  // welke kant de deur op zit
  openingsHoek: number  // hoek in graden (0-180) voor de swing
  opensNaar: 'binnen' | 'buiten'  // naar welke kant opent de deur
}

// Een raam in de plattegrond
export interface Raam {
  id: string
  x: number
  y: number
  breedte: number
  richting: 'noord' | 'oost' | 'zuid' | 'west'
}

// Een ingebouwd element (kast, aanrecht, etc.)
export interface IngebouwdElement {
  id: string
  naam: string
  x: number
  y: number
  breedte: number
  hoogte: number
  kleur: string
  type: 'kast' | 'aanrecht' | 'wasmachine' | 'douche' | 'bad' | 'wc' | 'wastafel'
}

// Een meubel dat geplaatst kan worden
export interface Meubel {
  id: string
  naam: string
  breedte: number
  hoogte: number
  kleur: string
  icoon?: string
}

// Een geplaatst meubel op de plattegrond
export interface GeplaatstMeubel {
  id: string
  meubelId: string
  x: number
  y: number
  rotatie: number
}

// De volledige staat van de planner
export interface PlannerState {
  kamers: Kamer[]
  meubels: GeplaatstMeubel[]
  geselecteerdMeubel: string | null
}
