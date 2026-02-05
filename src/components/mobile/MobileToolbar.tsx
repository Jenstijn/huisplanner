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
 * Mobile toolbar met Liquid Glass Floating Action Buttons.
 * iOS 26 style met glassmorphism effect.
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
    <div className="fixed bottom-0 left-0 right-0 z-40 px-3 pb-3 safe-area-bottom">
      {/* Meetresultaat display */}
      {meetResultaat && (
        <div className="flex justify-center mb-3 animate-scale-in">
          <div className="glass-pill px-5 py-2.5 flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
            <span className="font-semibold text-slate-700">
              {meetResultaat.afstand.toFixed(2)} m
            </span>
            <span className="text-slate-500 text-sm">
              ({(meetResultaat.afstand * 100).toFixed(0)} cm)
            </span>
          </div>
        </div>
      )}

      {/* Status bar als meubel geselecteerd */}
      {(tePlaatsenMeubel || geselecteerdMeubel) && (
        <div className="flex justify-center mb-3 animate-float-up">
          <div className={`glass-pill px-4 py-2 flex items-center gap-2.5 ${
            tePlaatsenMeubel ? 'ring-2 ring-blue-400/50' : ''
          }`}>
            <div
              className="w-5 h-5 rounded-lg shadow-sm"
              style={{ backgroundColor: (tePlaatsenMeubel || geselecteerdMeubel)?.kleur }}
            />
            <span className="text-sm font-medium text-slate-700">
              {tePlaatsenMeubel?.naam || geselecteerdMeubel?.naam}
            </span>
            {tePlaatsenMeubel && (
              <span className="text-xs text-blue-600 font-medium">Tap om te plaatsen</span>
            )}
          </div>
        </div>
      )}

      {/* Main toolbar - glass container */}
      <div className="glass px-4 py-3">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {/* Meubel toevoegen */}
          <button
            onClick={onMeubelSheetOpen}
            className="flex flex-col items-center gap-1.5 p-1"
          >
            <div className={`w-14 h-14 flex items-center justify-center transition-all active:scale-90 ${
              tePlaatsenMeubelId
                ? 'glass-fab-primary'
                : 'glass-fab'
            }`}>
              <svg className={`w-6 h-6 ${tePlaatsenMeubelId ? 'text-white' : 'text-slate-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className={`text-xs font-medium ${tePlaatsenMeubelId ? 'text-blue-600' : 'text-slate-500'}`}>
              Meubel
            </span>
          </button>

          {/* Roteren (alleen als item geselecteerd) */}
          <button
            onClick={onRoteren}
            disabled={!geselecteerdItemId}
            className="flex flex-col items-center gap-1.5 p-1"
          >
            <div className={`w-14 h-14 flex items-center justify-center transition-all ${
              geselecteerdItemId
                ? 'glass-fab active:scale-90'
                : 'glass-fab opacity-40'
            }`}>
              <svg className={`w-6 h-6 ${geselecteerdItemId ? 'text-slate-600' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <span className={`text-xs font-medium ${geselecteerdItemId ? 'text-slate-500' : 'text-slate-400'}`}>
              Roteer
            </span>
          </button>

          {/* Meten */}
          <button
            onClick={onLineaalToggle}
            className="flex flex-col items-center gap-1.5 p-1"
          >
            <div className={`w-14 h-14 flex items-center justify-center transition-all active:scale-90 ${
              lineaalModus
                ? 'glass-fab-primary !bg-gradient-to-br !from-orange-400 !to-amber-500'
                : 'glass-fab'
            }`}>
              <svg className={`w-6 h-6 ${lineaalModus ? 'text-white' : 'text-slate-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </div>
            <span className={`text-xs font-medium ${lineaalModus ? 'text-orange-600' : 'text-slate-500'}`}>
              Meten
            </span>
          </button>

          {/* Verwijderen (alleen als item geselecteerd) */}
          <button
            onClick={onVerwijderen}
            disabled={!geselecteerdItemId}
            className="flex flex-col items-center gap-1.5 p-1"
          >
            <div className={`w-14 h-14 flex items-center justify-center transition-all ${
              geselecteerdItemId
                ? 'glass-fab active:scale-90 hover:bg-red-500/10'
                : 'glass-fab opacity-40'
            }`}>
              <svg className={`w-6 h-6 ${geselecteerdItemId ? 'text-red-500' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <span className={`text-xs font-medium ${geselecteerdItemId ? 'text-red-500' : 'text-slate-400'}`}>
              Verwijder
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
