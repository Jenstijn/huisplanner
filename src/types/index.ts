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

// Een opening in een muur (deur of raam)
export interface MuurOpening {
  type: 'deur' | 'raam'
  t: number           // 0-1 positie langs de muur
  breedte: number     // breedte in meters
  swing?: 'links' | 'rechts' | 'schuif'  // deur swing richting
}

// Een muur met mogelijke openingen
export interface Muur {
  id: string
  start: Punt         // startpunt van de muur
  eind: Punt          // eindpunt van de muur
  dikte: number       // dikte in cm
  isBuiten?: boolean  // buitenmuur?
  openings: MuurOpening[]
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

// Beschikbare standaard afmetingen voor een meubel
export interface AfmetingOptie {
  label: string        // bijv. "160cm x 200cm"
  breedte: number      // in meters
  hoogte: number       // in meters
}

// Een meubel dat geplaatst kan worden
export interface Meubel {
  id: string
  naam: string
  breedte: number                    // standaard breedte in meters
  hoogte: number                     // standaard hoogte in meters
  kleur: string
  icoon?: string
  // Uitgebreide opties:
  categorie?: 'woonkamer' | 'slaapkamer' | 'eetkamer' | 'accessoires'
  beschikbareAfmetingen?: AfmetingOptie[]  // preset afmetingen
  handmatigeAfmetingen?: boolean           // toestaan van custom afmetingen
  minBreedte?: number                      // minimale breedte voor handmatig (meters)
  maxBreedte?: number                      // maximale breedte voor handmatig
  minHoogte?: number
  maxHoogte?: number
}

// Een geplaatst meubel op de plattegrond
export interface GeplaatstMeubel {
  id: string
  meubelId: string
  x: number
  y: number
  rotatie: number
  // Custom afmetingen (overschrijft meubel defaults indien gezet):
  customBreedte?: number
  customHoogte?: number
}

// De volledige staat van de planner
export interface PlannerState {
  kamers: Kamer[]
  meubels: GeplaatstMeubel[]
  geselecteerdMeubel: string | null
}

// Een layout (indeling) met meubels
export interface Layout {
  id: string
  naam: string
  items: GeplaatstMeubel[]
  createdAt?: Date
  updatedAt?: Date
}

// De structuur van plattegrond data in Firestore
export interface PlattegrondData {
  layouts: Record<string, Layout>
  activeLayoutId: string
}
