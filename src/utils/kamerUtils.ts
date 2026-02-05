// Utility functies voor kamer berekeningen

import { Kamer, Punt } from '../types'

/**
 * Bereken de oppervlakte van een kamer in vierkante meters
 * Gebruikt de Shoelace formula voor polygonen
 */
export function getKamerOppervlakte(kamer: Kamer): number {
  // Voor polygoon kamers (met punten array)
  if (kamer.punten && kamer.punten.length >= 3) {
    return getPolygonOppervlakte(kamer.punten)
  }

  // Voor rechthoekige kamers
  if (kamer.breedte !== undefined && kamer.hoogte !== undefined) {
    return kamer.breedte * kamer.hoogte
  }

  return 0
}

/**
 * Bereken oppervlakte van een polygoon met de Shoelace formula
 */
function getPolygonOppervlakte(punten: Punt[]): number {
  if (punten.length < 3) return 0

  let area = 0
  for (let i = 0; i < punten.length; i++) {
    const j = (i + 1) % punten.length
    area += punten[i].x * punten[j].y
    area -= punten[j].x * punten[i].y
  }

  return Math.abs(area / 2)
}

/**
 * Bereken het centroid (middelpunt) van een kamer voor label positionering
 */
export function getKamerCentroid(kamer: Kamer): Punt {
  // Voor polygoon kamers
  if (kamer.punten && kamer.punten.length >= 3) {
    return getPolygonCentroid(kamer.punten)
  }

  // Voor rechthoekige kamers
  if (kamer.x !== undefined && kamer.y !== undefined &&
      kamer.breedte !== undefined && kamer.hoogte !== undefined) {
    return {
      x: kamer.x + kamer.breedte / 2,
      y: kamer.y + kamer.hoogte / 2
    }
  }

  return { x: 0, y: 0 }
}

/**
 * Bereken het centroid van een polygoon
 */
function getPolygonCentroid(punten: Punt[]): Punt {
  if (punten.length < 3) return { x: 0, y: 0 }

  let cx = 0
  let cy = 0
  let area = 0

  for (let i = 0; i < punten.length; i++) {
    const j = (i + 1) % punten.length
    const cross = punten[i].x * punten[j].y - punten[j].x * punten[i].y
    area += cross
    cx += (punten[i].x + punten[j].x) * cross
    cy += (punten[i].y + punten[j].y) * cross
  }

  area = area / 2
  if (area === 0) return { x: 0, y: 0 }

  cx = cx / (6 * area)
  cy = cy / (6 * area)

  return { x: cx, y: cy }
}

/**
 * Formatteer oppervlakte voor display
 */
export function formatOppervlakte(oppervlakte: number): string {
  if (oppervlakte < 1) {
    return `${Math.round(oppervlakte * 100) / 100} m²`
  }
  return `${Math.round(oppervlakte * 10) / 10} m²`
}
