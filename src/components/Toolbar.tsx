import { beschikbareMeubels } from '../data/appartement'
import { GeplaatstMeubel } from '../types'

interface ToolbarProps {
  geselecteerdItemId: string | null
  onVerwijderen: () => void
  onRoteren: () => void
  onSetRotatie?: (graden: number) => void
  huidigeRotatie?: number
  aantalItems: number
  tePlaatsenMeubelId?: string | null
  geselecteerdItem?: GeplaatstMeubel
  onResize?: (id: string, breedte: number, hoogte: number) => void
}

export default function Toolbar({
  geselecteerdItemId,
  onVerwijderen,
  onRoteren,
  onSetRotatie,
  huidigeRotatie,
  tePlaatsenMeubelId,
  geselecteerdItem,
  onResize
}: ToolbarProps) {
  // Zoek meubel info voor geselecteerd item
  const geselecteerdMeubel = geselecteerdItem
    ? beschikbareMeubels.find(m => m.id === geselecteerdItem.meubelId)
    : null

  // Huidige afmetingen (custom of standaard)
  const huidigeBreedte = geselecteerdItem?.customBreedte ?? geselecteerdMeubel?.breedte ?? 1
  const huidigeHoogte = geselecteerdItem?.customHoogte ?? geselecteerdMeubel?.hoogte ?? 1
  // Toon toolbar alleen als er een item geselecteerd is
  if (!geselecteerdItemId && !tePlaatsenMeubelId) {
    return null
  }

  // Als er een meubel klaar staat om te plaatsen
  if (tePlaatsenMeubelId) {
    const meubel = beschikbareMeubels.find(m => m.id === tePlaatsenMeubelId)
    return (
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-3 px-5 py-3 bg-blue-500 text-white rounded-full shadow-lg shadow-blue-500/30">
          <div
            className="w-5 h-5 rounded-md ring-2 ring-white/30"
            style={{ backgroundColor: meubel?.kleur }}
          />
          <span className="text-sm font-medium">{meubel?.naam}</span>
          <span className="w-px h-4 bg-white/30"></span>
          <span className="text-sm text-blue-100">Klik om te plaatsen</span>
        </div>
      </div>
    )
  }

  // Toolbar voor geselecteerd item
  return (
    <div className="flex justify-center px-2">
      <div className="inline-flex flex-wrap items-center justify-center gap-1 p-1.5 bg-white rounded-2xl shadow-lg border border-slate-200 max-w-full">
        {/* Roteer linksom knop */}
        <button
          onClick={() => onSetRotatie?.(((huidigeRotatie ?? 0) - 90 + 360) % 360)}
          className="group flex items-center gap-1 px-2 py-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-all"
          title="Roteer 90° linksom"
        >
          <svg className="w-4 h-4 text-slate-600 group-hover:-rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        </button>

        {/* Roteer rechtsom knop */}
        <button
          onClick={onRoteren}
          className="group flex items-center gap-1 px-2 py-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-all"
          title="Roteer 90° rechtsom"
        >
          <svg className="w-4 h-4 text-slate-600 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
          </svg>
        </button>

        {/* Preset rotatie knoppen */}
        <div className="flex items-center gap-0.5 px-1 py-1 bg-slate-50 rounded-full">
          {[0, 90, 180, 270].map(graden => (
            <button
              key={graden}
              onClick={() => onSetRotatie?.(graden)}
              className={`px-2 py-1 text-xs rounded-full transition-all ${
                (huidigeRotatie ?? 0) === graden
                  ? 'bg-blue-500 text-white'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
              title={`Zet rotatie naar ${graden}°`}
            >
              {graden}°
            </button>
          ))}
        </div>

        {/* Vrije rotatie invoer */}
        <div className="flex items-center gap-1 px-2 py-1 bg-slate-50 rounded-full">
          <input
            type="number"
            min="0"
            max="359"
            value={huidigeRotatie ?? 0}
            onChange={(e) => {
              const value = parseInt(e.target.value) || 0
              const normalizedValue = ((value % 360) + 360) % 360
              onSetRotatie?.(normalizedValue)
            }}
            className="w-12 px-1.5 py-1 text-sm text-center border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            title="Voer exacte rotatie in graden in"
          />
          <span className="text-xs text-slate-500 pr-1">°</span>
        </div>

        {/* Divider */}
        <span className="w-px h-6 bg-slate-200 mx-1"></span>

        {/* Dimensie inputs voor resize */}
        {geselecteerdItem && geselecteerdMeubel && (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-full">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            <input
              type="number"
              min={geselecteerdMeubel.minBreedte ?? 0.3}
              max={geselecteerdMeubel.maxBreedte ?? 10}
              step="0.05"
              value={huidigeBreedte.toFixed(2)}
              onChange={(e) => {
                const value = parseFloat(e.target.value) || huidigeBreedte
                if (geselecteerdItem && onResize) {
                  onResize(geselecteerdItem.id, value, huidigeHoogte)
                }
              }}
              className="w-16 px-1 py-1 text-xs text-center border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              title={`Breedte (${geselecteerdMeubel.minBreedte ?? 0.3}m - ${geselecteerdMeubel.maxBreedte ?? 10}m)`}
            />
            <span className="text-xs text-slate-400">×</span>
            <input
              type="number"
              min={geselecteerdMeubel.minHoogte ?? 0.3}
              max={geselecteerdMeubel.maxHoogte ?? 10}
              step="0.05"
              value={huidigeHoogte.toFixed(2)}
              onChange={(e) => {
                const value = parseFloat(e.target.value) || huidigeHoogte
                if (geselecteerdItem && onResize) {
                  onResize(geselecteerdItem.id, huidigeBreedte, value)
                }
              }}
              className="w-16 px-1 py-1 text-xs text-center border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              title={`Diepte (${geselecteerdMeubel.minHoogte ?? 0.3}m - ${geselecteerdMeubel.maxHoogte ?? 10}m)`}
            />
            <span className="text-xs text-slate-500 pr-1">m</span>
          </div>
        )}

        {/* Standaard maten dropdown - alleen als meubel beschikbareAfmetingen heeft */}
        {geselecteerdItem && geselecteerdMeubel?.beschikbareAfmetingen && geselecteerdMeubel.beschikbareAfmetingen.length > 0 && (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-50 rounded-full border border-amber-200">
            <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
            <select
              value={(() => {
                const idx = geselecteerdMeubel.beschikbareAfmetingen!.findIndex(
                  afm => Math.abs(afm.breedte - huidigeBreedte) < 0.01 &&
                         Math.abs(afm.hoogte - huidigeHoogte) < 0.01
                )
                return idx >= 0 ? idx.toString() : '-1'
              })()}
              onChange={(e) => {
                const idx = parseInt(e.target.value)
                if (idx >= 0 && geselecteerdMeubel.beschikbareAfmetingen) {
                  const afm = geselecteerdMeubel.beschikbareAfmetingen[idx]
                  if (afm && onResize) {
                    onResize(geselecteerdItem.id, afm.breedte, afm.hoogte)
                  }
                }
              }}
              className="px-2 py-1 text-xs bg-white border border-amber-200 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {geselecteerdMeubel.beschikbareAfmetingen.map((afm, i) => (
                <option key={i} value={i}>{afm.label}</option>
              ))}
              {geselecteerdMeubel.beschikbareAfmetingen.findIndex(
                afm => Math.abs(afm.breedte - huidigeBreedte) < 0.01 &&
                       Math.abs(afm.hoogte - huidigeHoogte) < 0.01
              ) === -1 && (
                <option value="-1">Aangepast ({huidigeBreedte.toFixed(2)}×{huidigeHoogte.toFixed(2)}m)</option>
              )}
            </select>
          </div>
        )}

        {/* Verwijder knop */}
        <button
          onClick={onVerwijderen}
          className="group flex items-center gap-2 px-4 py-2 hover:bg-red-50 rounded-full transition-all"
          title="Verwijderen"
        >
          <svg className="w-4 h-4 text-slate-500 group-hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span className="text-sm font-medium text-slate-600 group-hover:text-red-600 transition-colors">Verwijder</span>
        </button>

        {/* Divider */}
        <span className="w-px h-6 bg-slate-200 mx-1"></span>

        {/* Status indicator */}
        <div className="flex items-center gap-2 px-3 py-2">
          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
          <span className="text-xs text-slate-500">Geselecteerd</span>
        </div>
      </div>
    </div>
  )
}
