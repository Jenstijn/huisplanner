import { Muur, GeplaatstMeubel } from '../types'

// Snap threshold in meters (20cm)
const SNAP_THRESHOLD = 0.2

// Result type voor snap functies
export interface SnapResult {
  x: number
  y: number
  snapped: boolean
  snapType?: 'muur' | 'tafel'
}

/**
 * Snap een meubel naar de dichtstbijzijnde muur als het binnen de threshold is.
 * Werkt met zowel horizontale als verticale muren.
 */
export function snapToWalls(
  meubelX: number,
  meubelY: number,
  meubelBreedte: number,
  meubelHoogte: number,
  muren: Muur[]
): SnapResult {
  let resultX = meubelX
  let resultY = meubelY
  let snapped = false
  let minDistance = SNAP_THRESHOLD

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
