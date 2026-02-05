// Utility functies voor collision detection

import { GeplaatstMeubel, Meubel } from '../types'

interface BoundingBox {
  minX: number
  maxX: number
  minY: number
  maxY: number
}

/**
 * Bereken de axis-aligned bounding box (AABB) van een geplaatst meubel
 * Houdt rekening met rotatie
 */
function getBoundingBox(
  item: GeplaatstMeubel,
  meubel: Meubel
): BoundingBox {
  const breedte = item.customBreedte ?? meubel.breedte
  const hoogte = item.customHoogte ?? meubel.hoogte

  // Bij 90 of 270 graden rotatie zijn breedte en hoogte verwisseld
  const isRotated90or270 = item.rotatie === 90 || item.rotatie === 270
  const effectieveBreedte = isRotated90or270 ? hoogte : breedte
  const effectieveHoogte = isRotated90or270 ? breedte : hoogte

  return {
    minX: item.x,
    maxX: item.x + effectieveBreedte,
    minY: item.y,
    maxY: item.y + effectieveHoogte
  }
}

/**
 * Check of twee bounding boxes overlappen
 * Met kleine marge (1cm) om floating point errors te voorkomen
 */
function boxesOverlap(a: BoundingBox, b: BoundingBox): boolean {
  const margin = 0.01 // 1cm marge

  // Geen overlap als boxes niet overlappen op een van de assen
  if (a.maxX <= b.minX + margin || b.maxX <= a.minX + margin) return false
  if (a.maxY <= b.minY + margin || b.maxY <= a.minY + margin) return false

  return true
}

/**
 * Detecteer welke meubels met elkaar overlappen
 * Returns een Set van item IDs die overlappen
 */
export function detectCollisions(
  items: GeplaatstMeubel[],
  meubels: Meubel[]
): Set<string> {
  const collidingIds = new Set<string>()

  // Maak lookup map voor meubel definities
  const meubelMap = new Map<string, Meubel>()
  meubels.forEach(m => meubelMap.set(m.id, m))

  // Check elk paar meubels
  for (let i = 0; i < items.length; i++) {
    const itemA = items[i]
    const meubelA = meubelMap.get(itemA.meubelId)
    if (!meubelA) continue

    const boxA = getBoundingBox(itemA, meubelA)

    for (let j = i + 1; j < items.length; j++) {
      const itemB = items[j]
      const meubelB = meubelMap.get(itemB.meubelId)
      if (!meubelB) continue

      const boxB = getBoundingBox(itemB, meubelB)

      if (boxesOverlap(boxA, boxB)) {
        collidingIds.add(itemA.id)
        collidingIds.add(itemB.id)
      }
    }
  }

  return collidingIds
}

/**
 * Check of een specifiek meubel overlapt met anderen
 * Handig voor real-time feedback tijdens slepen
 */
export function checkItemCollision(
  targetItem: GeplaatstMeubel,
  allItems: GeplaatstMeubel[],
  meubels: Meubel[]
): boolean {
  const meubelMap = new Map<string, Meubel>()
  meubels.forEach(m => meubelMap.set(m.id, m))

  const targetMeubel = meubelMap.get(targetItem.meubelId)
  if (!targetMeubel) return false

  const targetBox = getBoundingBox(targetItem, targetMeubel)

  for (const item of allItems) {
    // Skip zichzelf
    if (item.id === targetItem.id) continue

    const meubel = meubelMap.get(item.meubelId)
    if (!meubel) continue

    const box = getBoundingBox(item, meubel)

    if (boxesOverlap(targetBox, box)) {
      return true
    }
  }

  return false
}
