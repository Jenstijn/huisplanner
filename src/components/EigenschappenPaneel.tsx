import { useState, useEffect } from 'react'
import { GeplaatstMeubel, Meubel, Kamer } from '../types'
import { getKamerOppervlakte, formatOppervlakte } from '../utils/kamerUtils'

// Preset kleuren voor de kleur picker
const PRESET_KLEUREN = [
  { naam: 'Standaard', kleur: null },
  { naam: 'Rood', kleur: '#ef4444' },
  { naam: 'Oranje', kleur: '#f97316' },
  { naam: 'Geel', kleur: '#eab308' },
  { naam: 'Groen', kleur: '#22c55e' },
  { naam: 'Blauw', kleur: '#3b82f6' },
  { naam: 'Paars', kleur: '#a855f7' },
  { naam: 'Roze', kleur: '#ec4899' },
  { naam: 'Grijs', kleur: '#6b7280' },
]

interface EigenschappenPaneelProps {
  geselecteerdItem?: GeplaatstMeubel
  meubel?: Meubel
  geplaatsteItems: GeplaatstMeubel[]
  beschikbareMeubels: Meubel[]
  kamers?: Kamer[]
  zoom: number
  onRotatieChange?: (graden: number) => void
  onResize?: (breedte: number, hoogte: number) => void
  onKleurChange?: (kleur: string | undefined) => void
  onNotitieChange?: (notitie: string | undefined) => void
}

export default function EigenschappenPaneel({
  geselecteerdItem,
  meubel,
  geplaatsteItems,
  beschikbareMeubels,
  kamers,
  zoom,
  onKleurChange,
  onNotitieChange
}: EigenschappenPaneelProps) {
  // Lokale state voor notitie input (voorkomt re-render bij elke toets)
  const [notitieInput, setNotitieInput] = useState(geselecteerdItem?.notitie ?? '')

  // Sync lokale notitie met geselecteerd item
  useEffect(() => {
    setNotitieInput(geselecteerdItem?.notitie ?? '')
  }, [geselecteerdItem?.id, geselecteerdItem?.notitie])

  // Save notitie bij blur
  const handleNotitieSave = () => {
    if (onNotitieChange) {
      const trimmed = notitieInput.trim()
      onNotitieChange(trimmed || undefined)
    }
  }

  // Als een meubel geselecteerd is, toon eigenschappen
  if (geselecteerdItem && meubel) {
    const breedte = geselecteerdItem.customBreedte ?? meubel.breedte
    const hoogte = geselecteerdItem.customHoogte ?? meubel.hoogte
    const displayKleur = geselecteerdItem.customKleur ?? meubel.kleur

    return (
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50 p-5 h-fit">
        <h2 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Eigenschappen
        </h2>

        {/* Meubel naam en kleur */}
        <div className="mb-4 p-3 bg-slate-50 rounded-xl">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg shadow-sm"
              style={{ backgroundColor: displayKleur }}
            />
            <div>
              <div className="font-medium text-slate-800">{meubel.naam}</div>
              <div className="text-xs text-slate-500">{meubel.categorie}</div>
            </div>
          </div>
        </div>

        {/* Kleur customization */}
        {onKleurChange && (
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Kleur</h3>
            <div className="flex flex-wrap gap-2">
              {PRESET_KLEUREN.map(({ naam, kleur }) => (
                <button
                  key={naam}
                  onClick={() => onKleurChange(kleur ?? undefined)}
                  className={`w-7 h-7 rounded-lg transition-all ${
                    (kleur === null && !geselecteerdItem.customKleur) ||
                    kleur === geselecteerdItem.customKleur
                      ? 'ring-2 ring-blue-500 ring-offset-2'
                      : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: kleur ?? meubel.kleur }}
                  title={naam}
                />
              ))}
            </div>
          </div>
        )}

        {/* Notitie */}
        {onNotitieChange && (
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Notitie</h3>
            <textarea
              value={notitieInput}
              onChange={(e) => setNotitieInput(e.target.value.slice(0, 100))}
              onBlur={handleNotitieSave}
              placeholder="Bijv. IKEA KALLAX, van oma..."
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={2}
              maxLength={100}
            />
            <div className="text-xs text-slate-400 text-right mt-1">
              {notitieInput.length}/100
            </div>
          </div>
        )}

        {/* Afmetingen */}
        <div className="space-y-3 mb-4">
          <div className="flex justify-between items-center py-2 border-b border-slate-100">
            <span className="text-sm text-slate-600">Breedte</span>
            <span className="text-sm font-medium text-slate-800">{breedte.toFixed(2)} m</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-100">
            <span className="text-sm text-slate-600">Diepte</span>
            <span className="text-sm font-medium text-slate-800">{hoogte.toFixed(2)} m</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-100">
            <span className="text-sm text-slate-600">Oppervlakte</span>
            <span className="text-sm font-medium text-slate-800">{(breedte * hoogte).toFixed(2)} m²</span>
          </div>
        </div>

        {/* Positie */}
        <div className="space-y-3 mb-4">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Positie</h3>
          <div className="flex justify-between items-center py-2 border-b border-slate-100">
            <span className="text-sm text-slate-600">X</span>
            <span className="text-sm font-medium text-slate-800">{geselecteerdItem.x.toFixed(2)} m</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-100">
            <span className="text-sm text-slate-600">Y</span>
            <span className="text-sm font-medium text-slate-800">{geselecteerdItem.y.toFixed(2)} m</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-100">
            <span className="text-sm text-slate-600">Rotatie</span>
            <span className="text-sm font-medium text-slate-800">{geselecteerdItem.rotatie}°</span>
          </div>
        </div>

        {/* Tips */}
        <div className="p-3 bg-blue-50 rounded-xl">
          <p className="text-xs text-blue-700">
            <span className="font-medium">Tip:</span> Gebruik de toolbar boven de plattegrond om dit meubel te roteren of de afmetingen aan te passen.
          </p>
        </div>
      </div>
    )
  }

  // Als niets geselecteerd, toon statistieken
  const aantalMeubels = geplaatsteItems.length

  // Bereken totale oppervlakte van meubels
  const totaleOppervlakte = geplaatsteItems.reduce((total, item) => {
    const meubelDef = beschikbareMeubels.find(m => m.id === item.meubelId)
    if (!meubelDef) return total
    const breedte = item.customBreedte ?? meubelDef.breedte
    const hoogte = item.customHoogte ?? meubelDef.hoogte
    return total + (breedte * hoogte)
  }, 0)

  // Tel meubels per categorie
  const perCategorie = geplaatsteItems.reduce((acc, item) => {
    const meubelDef = beschikbareMeubels.find(m => m.id === item.meubelId)
    if (meubelDef?.categorie) {
      acc[meubelDef.categorie] = (acc[meubelDef.categorie] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50 p-5 h-fit">
      <h2 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Overzicht
      </h2>

      {/* Statistieken */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 bg-blue-50 rounded-xl text-center">
          <div className="text-2xl font-bold text-blue-600">{aantalMeubels}</div>
          <div className="text-xs text-blue-600/70">Meubels</div>
        </div>
        <div className="p-3 bg-green-50 rounded-xl text-center">
          <div className="text-2xl font-bold text-green-600">{totaleOppervlakte.toFixed(1)}</div>
          <div className="text-xs text-green-600/70">m² gebruikt</div>
        </div>
      </div>

      {/* Per categorie */}
      {Object.keys(perCategorie).length > 0 && (
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Per categorie</h3>
          <div className="space-y-2">
            {Object.entries(perCategorie).map(([categorie, aantal]) => (
              <div key={categorie} className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-sm text-slate-600 capitalize">{categorie}</span>
                <span className="text-sm font-medium text-slate-800">{aantal}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Kamer oppervlaktes */}
      {kamers && kamers.length > 0 && (
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Kamers</h3>
          <div className="space-y-2">
            {kamers
              .filter(k => !k.isGemeenschappelijk) // Filter trappenhuis etc.
              .map(kamer => {
                const oppervlakte = getKamerOppervlakte(kamer)
                return (
                  <div key={kamer.id} className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-sm text-slate-600">{kamer.naam}</span>
                    <span className="text-sm font-medium text-slate-800">{formatOppervlakte(oppervlakte)}</span>
                  </div>
                )
              })}
            {/* Totaal */}
            <div className="flex justify-between items-center py-2 pt-3">
              <span className="text-sm font-semibold text-slate-700">Totaal</span>
              <span className="text-sm font-bold text-slate-800">
                {formatOppervlakte(
                  kamers
                    .filter(k => !k.isGemeenschappelijk)
                    .reduce((sum, k) => sum + getKamerOppervlakte(k), 0)
                )}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Zoom niveau */}
      <div className="p-3 bg-slate-50 rounded-xl">
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-600">Zoom</span>
          <span className="text-sm font-medium text-slate-800">{Math.round(zoom * 100)}%</span>
        </div>
      </div>

      {/* Instructies */}
      {aantalMeubels === 0 && (
        <div className="mt-4 p-3 bg-amber-50 rounded-xl">
          <p className="text-xs text-amber-700">
            <span className="font-medium">Start:</span> Selecteer een meubel uit de lijst links en klik op de plattegrond om het te plaatsen.
          </p>
        </div>
      )}
    </div>
  )
}
