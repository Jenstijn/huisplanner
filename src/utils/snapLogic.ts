import { Muur, GeplaatstMeubel } from '../types'

// Snap threshold in meters (20cm om te snappen)
const SNAP_THRESHOLD = 0.2
// Grotere threshold om los te breken van snap (35cm) - hysteresis
const RELEASE_THRESHOLD = 0.35

// Result type voor snap functies
export interface SnapResult {
  x: number
  y: number
  snapped: boolean
  snapType?: 'muur' | 'tafel'
}

// Bounds voor constraint checking
export interface Bounds {
  minX: number
  maxX: number
  minY: number
  maxY: number
}

/**
 * Bereken de buitengrenzen van het appartement op basis van buitenmuren.
 */
export function getBuitenGrenzen(muren: Muur[]): Bounds {
  // Filter alleen buitenmuren
  const buitenMuren = muren.filter(m => m.isBuiten)

  if (buitenMuren.length === 0) {
    // Fallback: gebruik alle muren
    const alleMuren = muren
    let minX = Infinity, maxX = -Infinity
    let minY = Infinity, maxY = -Infinity

    alleMuren.forEach(muur => {
      minX = Math.min(minX, muur.start.x, muur.eind.x)
      maxX = Math.max(maxX, muur.start.x, muur.eind.x)
      minY = Math.min(minY, muur.start.y, muur.eind.y)
      maxY = Math.max(maxY, muur.start.y, muur.eind.y)
    })

    return { minX, maxX, minY, maxY }
  }

  let minX = Infinity, maxX = -Infinity
  let minY = Infinity, maxY = -Infinity

  buitenMuren.forEach(muur => {
    minX = Math.min(minX, muur.start.x, muur.eind.x)
    maxX = Math.max(maxX, muur.start.x, muur.eind.x)
    minY = Math.min(minY, muur.start.y, muur.eind.y)
    maxY = Math.max(maxY, muur.start.y, muur.eind.y)
  })

  return { minX, maxX, minY, maxY }
}

/**
 * Houd een meubel binnen de gegeven grenzen (harde stop).
 */
export function constrainToBounds(
  x: number,
  y: number,
  breedte: number,
  hoogte: number,
  grenzen: Bounds
): { x: number; y: number } {
  return {
    x: Math.max(grenzen.minX, Math.min(grenzen.maxX - breedte, x)),
    y: Math.max(grenzen.minY, Math.min(grenzen.maxY - hoogte, y))
  }
}

/**
 * Snap een meubel naar de dichtstbijzijnde muur als het binnen de threshold is.
 * Werkt met zowel horizontale als verticale muren.
 * @param wasSnapped - Was het meubel al gesnapt? Gebruikt grotere threshold voor loslaten (hysteresis)
 */
export function snapToWalls(
  meubelX: number,
  meubelY: number,
  meubelBreedte: number,
  meubelHoogte: number,
  muren: Muur[],
  wasSnapped: boolean = false
): SnapResult {
  // Gebruik grotere threshold als meubel al gesnapt was (hysteresis)
  const threshold = wasSnapped ? RELEASE_THRESHOLD : SNAP_THRESHOLD
  let resultX = meubelX
  let resultY = meubelY
  let snapped = false
  let minDistance = threshold

  // Bereken meubel hoekpunten
  const meubelLinks = meubelX
  const meubelRechts = meubelX + meubelBreedte
  const meubelBoven = meubelY
  const meubelOnder = meubelY + meubelHoogte

  muren.forEach((muur) => {
    // Bepaal of de muur horizontaal of verticaal is
    const isHorizontaal = Math.abs(muur.start.y - muur.eind.y) < 0.01
    const isVerticaal = Math.abs(muur.start.x - muur.eind.x) < 0.01

    if (isHorizontaal) {
      // Horizontale muur: snap boven of onder kant van meubel
      const muurY = muur.start.y
      const muurMinX = Math.min(muur.start.x, muur.eind.x)
      const muurMaxX = Math.max(muur.start.x, muur.eind.x)

      // Check of meubel horizontaal overlapt met muur
      if (meubelRechts > muurMinX && meubelLinks < muurMaxX) {
        // Snap onderkant meubel naar muur
        const distanceOnder = Math.abs(meubelOnder - muurY)
        if (distanceOnder < minDistance) {
          minDistance = distanceOnder
          resultY = muurY - meubelHoogte
          snapped = true
        }

        // Snap bovenkant meubel naar muur
        const distanceBoven = Math.abs(meubelBoven - muurY)
        if (distanceBoven < minDistance) {
          minDistance = distanceBoven
          resultY = muurY
          snapped = true
        }
      }
    } else if (isVerticaal) {
      // Verticale muur: snap linker of rechter kant van meubel
      const muurX = muur.start.x
      const muurMinY = Math.min(muur.start.y, muur.eind.y)
      const muurMaxY = Math.max(muur.start.y, muur.eind.y)

      // Check of meubel verticaal overlapt met muur
      if (meubelOnder > muurMinY && meubelBoven < muurMaxY) {
        // Snap rechterkant meubel naar muur
        const distanceRechts = Math.abs(meubelRechts - muurX)
        if (distanceRechts < minDistance) {
          minDistance = distanceRechts
          resultX = muurX - meubelBreedte
          snapped = true
        }

        // Snap linkerkant meubel naar muur
        const distanceLinks = Math.abs(meubelLinks - muurX)
        if (distanceLinks < minDistance) {
          minDistance = distanceLinks
          resultX = muurX
          snapped = true
        }
      }
    }
  })

  return {
    x: resultX,
    y: resultY,
    snapped,
    snapType: snapped ? 'muur' : undefined
  }
}

// Inschuif-afstand voor stoelen bij tafels (15cm)
const STOEL_INSCHUIF = 0.15
// Detectie afstand voor tafel snap (30cm)
const TAFEL_SNAP_THRESHOLD = 0.3

/**
 * Snap een stoel naar een eettafel als deze dichtbij is.
 * Schuift de stoel gedeeltelijk onder de tafel.
 */
export function snapStoelToTafel(
  stoelX: number,
  stoelY: number,
  stoelBreedte: number,
  stoelHoogte: number,
  geplaatsteItems: GeplaatstMeubel[],
  beschikbareMeubels: { id: string; breedte: number; hoogte: number }[]
): SnapResult {
  let resultX = stoelX
  let resultY = stoelY
  let snapped = false

  // Zoek eettafels in de geplaatste items
  const eettafels = geplaatsteItems.filter(item =>
    item.meubelId === 'eettafel' || item.meubelId === 'eettafel-rond'
  )

  for (const tafel of eettafels) {
    const tafelDef = beschikbareMeubels.find(m => m.id === tafel.meubelId)
    if (!tafelDef) continue

    const tafelBreedte = tafel.customBreedte ?? tafelDef.breedte
    const tafelHoogte = tafel.customHoogte ?? tafelDef.hoogte

    // Tafel bounds
    const tafelLinks = tafel.x
    const tafelRechts = tafel.x + tafelBreedte
    const tafelBoven = tafel.y
    const tafelOnder = tafel.y + tafelHoogte

    // Stoel center
    const stoelCenterX = stoelX + stoelBreedte / 2
    const stoelCenterY = stoelY + stoelHoogte / 2

    // Check elke zijde van de tafel
    // Bovenkant tafel (stoel zit boven de tafel)
    if (
      stoelCenterX > tafelLinks &&
      stoelCenterX < tafelRechts &&
      stoelY + stoelHoogte >= tafelBoven - TAFEL_SNAP_THRESHOLD &&
      stoelY + stoelHoogte <= tafelBoven + TAFEL_SNAP_THRESHOLD
    ) {
      resultY = tafelBoven - stoelHoogte + STOEL_INSCHUIF
      resultX = stoelCenterX - stoelBreedte / 2 // Centreer op huidige positie
      snapped = true
      break
    }

    // Onderkant tafel (stoel zit onder de tafel)
    if (
      stoelCenterX > tafelLinks &&
      stoelCenterX < tafelRechts &&
      stoelY >= tafelOnder - TAFEL_SNAP_THRESHOLD &&
      stoelY <= tafelOnder + TAFEL_SNAP_THRESHOLD
    ) {
      resultY = tafelOnder - STOEL_INSCHUIF
      resultX = stoelCenterX - stoelBreedte / 2
      snapped = true
      break
    }

    // Linkerkant tafel (stoel zit links van de tafel)
    if (
      stoelCenterY > tafelBoven &&
      stoelCenterY < tafelOnder &&
      stoelX + stoelBreedte >= tafelLinks - TAFEL_SNAP_THRESHOLD &&
      stoelX + stoelBreedte <= tafelLinks + TAFEL_SNAP_THRESHOLD
    ) {
      resultX = tafelLinks - stoelBreedte + STOEL_INSCHUIF
      resultY = stoelCenterY - stoelHoogte / 2
      snapped = true
      break
    }

    // Rechterkant tafel (stoel zit rechts van de tafel)
    if (
      stoelCenterY > tafelBoven &&
      stoelCenterY < tafelOnder &&
      stoelX >= tafelRechts - TAFEL_SNAP_THRESHOLD &&
      stoelX <= tafelRechts + TAFEL_SNAP_THRESHOLD
    ) {
      resultX = tafelRechts - STOEL_INSCHUIF
      resultY = stoelCenterY - stoelHoogte / 2
      snapped = true
      break
    }
  }

  return {
    x: resultX,
    y: resultY,
    snapped,
    snapType: snapped ? 'tafel' : undefined
  }
}
