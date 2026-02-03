// Types voor de huisplanner

// Een kamer in de plattegrond
export interface Kamer {
  id: string
  naam: string
  x: number      // positie in meters
  y: number
  breedte: number  // afmetingen in meters
  hoogte: number
  kleur: string
}

// Een meubel dat geplaatst kan worden
export interface Meubel {
  id: string
  naam: string
  breedte: number  // afmetingen in meters
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
  rotatie: number  // in graden
}

// De volledige staat van de planner
export interface PlannerState {
  kamers: Kamer[]
  meubels: GeplaatstMeubel[]
  geselecteerdMeubel: string | null
}
