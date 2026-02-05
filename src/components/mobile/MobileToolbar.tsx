import { GeplaatstMeubel } from '../../types'
import { beschikbareMeubels } from '../../data/appartement'

interface MobileToolbarProps {
  /** Meubel dat geselecteerd is om te plaatsen */
  tePlaatsenMeubelId: string | null
  /** Meubel dat op de plattegrond geselecteerd is */
  geselecteerdItemId: string | null
  /** Het geselecteerde item object */
  geselecteerdItem?: GeplaatstMeubel
  /** Callback om meubel sheet te openen */
  onMeubelSheetOpen: () => void
  /** Callback om item te roteren */
  onRoteren: () => void
  /** Callback om item te verwijderen */
  onVerwijderen: () => void
  /** Callback voor meet modus toggle */
  onLineaalToggle: () => void
  /** Of lineaal/meet modus actief is */
  lineaalModus: boolean
  /** Meetresultaat indien beschikbaar */
  meetResultaat?: { afstand: number } | null
}

/**
 * Mobile toolbar met Floating Action Buttons.
 * Toont context-afhankelijke acties gebaseerd op huidige state.
 */
export default function MobileToolbar({
  tePlaatsenMeubelId,
  geselecteerdItemId,
  geselecteerdItem,
  onMeubelSheetOpen,
  onRoteren,
  onVerwijderen,
  onLineaalToggle,
  lineaalModus,
  meetResultaat
}: MobileToolbarProps) {
  // Info over geselecteerd meubel uit lijst
  const tePlaatsenMeubel = tePlaatsenMeubelId
    ? beschikbareMeubels.find(m => m.id === tePlaatsenMeubelId)
    : null

  // Info over geselecteerd item op plattegrond
  const geselecteerdMeubel = geselecteerdItem
    ? beschikbareMeubels.find(m => m.id === geselecteerdItem.meubelId)
    : null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 safe-area-bottom">
      {/* Meetresultaat display */}
      {meetResultaat && (
        <div className="flex justify-center mb-3">
          <div className="px-4 py-2 bg-orange-500 text-white rounded-full shadow-lg font-semibold">
            {meetResultaat.afstand.toFixed(2)} m ({(meetResultaat.afstand * 100).toFixed(0)} cm)
          </div>
        </div>
      )}

      {/* Status bar als meubel geselecteerd */}
      {(tePlaatsenMeubel || geselecteerdMeubel) && (
        <div className="flex justify-center mb-3">
          <div className={`px-4 py-2 rounded-full shadow-lg flex items-center gap-2 ${
            tePlaatsenMeubel ? 'bg-blue-500 text-white' : 'bg-white border border-slate-200'
          }`}>
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: (tePlaatsenMeubel || geselecteerdMeubel)?.kleur }}
            />
            <span className="text-sm font-medium">
              {tePlaatsenMeubel?.naam || geselecteerdMeubel?.naam}
            </span>
            {tePlaatsenMeubel && (
              <span className="text-xs opacity-80">• Tap om te plaatsen</span>
            )}
          </div>
        </div>
      )}

      {/* Main toolbar */}
      <div className="bg-white border-t border-slate-200 px-4 py-3">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {/* Meubel toevoegen */}
          <button
            onClick={onMeubelSheetOpen}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all active:scale-95 ${
              tePlaatsenMeubelId ? 'bg-blue-100 text-blue-600' : 'text-slate-600'
            }`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              tePlaatsenMeubelId
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                : 'bg-slate-100'
            }`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-xs font-medium">Meubel</span>
          </button>

          {/* Roteren (alleen als item geselecteerd) */}
          <button
            onClick={onRoteren}
            disabled={!geselecteerdItemId}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all active:scale-95 ${
              geselecteerdItemId ? 'text-slate-600' : 'text-slate-300'
            }`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              geselecteerdItemId ? 'bg-slate-100 active:bg-slate-200' : 'bg-slate-50'
            }`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <span className="text-xs font-medium">Roteer</span>
          </button>

          {/* Meten */}
          <button
            onClick={onLineaalToggle}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all active:scale-95 ${
              lineaalModus ? 'text-orange-600' : 'text-slate-600'
            }`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              lineaalModus
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                : 'bg-slate-100 active:bg-slate-200'
            }`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </div>
            <span className="text-xs font-medium">Meten</span>
          </button>

          {/* Verwijderen (alleen als item geselecteerd) */}
          <button
            onClick={onVerwijderen}
            disabled={!geselecteerdItemId}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all active:scale-95 ${
              geselecteerdItemId ? 'text-red-600' : 'text-slate-300'
            }`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              geselecteerdItemId ? 'bg-red-50 active:bg-red-100' : 'bg-slate-50'
            }`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <span className="text-xs font-medium">Verwijder</span>
          </button>
        </div>
      </div>
    </div>
  )
}
