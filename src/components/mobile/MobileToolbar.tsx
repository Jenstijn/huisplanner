import { useState, useEffect } from 'react'
import { GeplaatstMeubel } from '../../types'
import { beschikbareMeubels } from '../../data/appartement'

// Preset kleuren voor kleur picker
const PRESET_KLEUREN = [
  { naam: 'Standaard', kleur: null },
  { naam: 'Rood', kleur: '#ef4444' },
  { naam: 'Oranje', kleur: '#f97316' },
  { naam: 'Geel', kleur: '#eab308' },
  { naam: 'Groen', kleur: '#22c55e' },
  { naam: 'Blauw', kleur: '#3b82f6' },
  { naam: 'Paars', kleur: '#a855f7' },
  { naam: 'Roze', kleur: '#ec4899' },
]

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
  /** Undo/Redo props */
  canUndo?: boolean
  canRedo?: boolean
  onUndo?: () => void
  onRedo?: () => void
  /** Duplicate prop */
  onDuplicate?: () => void
  /** Kleur en notitie callbacks */
  onKleurChange?: (kleur: string | undefined) => void
  onNotitieChange?: (notitie: string | undefined) => void
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
  meetResultaat,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onDuplicate,
  onKleurChange,
  onNotitieChange
}: MobileToolbarProps) {
  // State voor uitklapmenu's
  const [showKleurPicker, setShowKleurPicker] = useState(false)
  const [showNotitieInput, setShowNotitieInput] = useState(false)
  const [notitieInput, setNotitieInput] = useState('')

  // Reset pickers en sync notitie wanneer selectie verandert
  useEffect(() => {
    setShowKleurPicker(false)
    setShowNotitieInput(false)
    setNotitieInput(geselecteerdItem?.notitie ?? '')
  }, [geselecteerdItem?.id, geselecteerdItem?.notitie])
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

      {/* Undo/Redo balk */}
      {(onUndo || onRedo) && (
        <div className="flex justify-center mb-3 animate-float-up">
          <div className="glass-pill px-2 py-1 flex items-center gap-1">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className={`p-2 rounded-full transition-all active:scale-90 ${
                canUndo
                  ? 'text-slate-600 hover:bg-slate-200/50'
                  : 'text-slate-300'
              }`}
              title="Ongedaan maken"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className={`p-2 rounded-full transition-all active:scale-90 ${
                canRedo
                  ? 'text-slate-600 hover:bg-slate-200/50'
                  : 'text-slate-300'
              }`}
              title="Opnieuw doen"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Kleur picker popup - alleen als item geselecteerd en picker actief */}
      {geselecteerdItem && showKleurPicker && onKleurChange && (
        <div className="flex justify-center mb-3 animate-scale-in">
          <div className="glass-pill px-3 py-2 flex items-center gap-2 flex-wrap justify-center max-w-[300px]">
            {PRESET_KLEUREN.map(({ naam, kleur }) => (
              <button
                key={naam}
                onClick={() => {
                  onKleurChange(kleur ?? undefined)
                  setShowKleurPicker(false)
                }}
                className={`w-8 h-8 rounded-lg transition-all active:scale-90 ${
                  (kleur === null && !geselecteerdItem.customKleur) ||
                  kleur === geselecteerdItem.customKleur
                    ? 'ring-2 ring-blue-500 ring-offset-2'
                    : ''
                }`}
                style={{ backgroundColor: kleur ?? geselecteerdMeubel?.kleur }}
                title={naam}
              />
            ))}
          </div>
        </div>
      )}

      {/* Notitie input popup - fixed overlay boven keyboard */}
      {geselecteerdItem && showNotitieInput && onNotitieChange && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/20" onClick={() => {
          setShowNotitieInput(false)
          setNotitieInput(geselecteerdItem?.notitie ?? '')
        }}>
          <div className="glass-pill px-4 py-3 flex flex-col gap-3 w-[300px] mx-4 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="text-sm font-medium text-slate-700">Notitie bewerken</div>
            <input
              type="text"
              value={notitieInput}
              onChange={(e) => setNotitieInput(e.target.value.slice(0, 100))}
              placeholder="Bijv. IKEA KALLAX, van oma..."
              className="w-full px-3 py-2.5 text-base bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={100}
              autoFocus
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">{notitieInput.length}/100</span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowNotitieInput(false)
                    setNotitieInput(geselecteerdItem?.notitie ?? '')
                  }}
                  className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg active:scale-95"
                >
                  Annuleer
                </button>
                <button
                  onClick={() => {
                    const trimmed = notitieInput.trim()
                    onNotitieChange(trimmed || undefined)
                    setShowNotitieInput(false)
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg active:scale-95"
                >
                  Opslaan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status bar als meubel geselecteerd */}
      {(tePlaatsenMeubel || geselecteerdMeubel) && (
        <div className="flex justify-center mb-3 animate-float-up">
          <div className={`glass-pill px-4 py-2 flex items-center gap-2.5 ${
            tePlaatsenMeubel ? 'ring-2 ring-blue-400/50' : ''
          }`}>
            {/* Kleur button - toont huidige kleur, opent picker bij tap */}
            {geselecteerdItem && onKleurChange && (
              <button
                onClick={() => setShowKleurPicker(!showKleurPicker)}
                className={`w-6 h-6 rounded-lg shadow-sm transition-all active:scale-90 ${
                  showKleurPicker ? 'ring-2 ring-blue-400' : ''
                }`}
                style={{ backgroundColor: geselecteerdItem.customKleur ?? geselecteerdMeubel?.kleur }}
                title="Wijzig kleur"
              />
            )}
            {!geselecteerdItem && (
              <div
                className="w-5 h-5 rounded-lg shadow-sm"
                style={{ backgroundColor: (tePlaatsenMeubel || geselecteerdMeubel)?.kleur }}
              />
            )}
            <span className="text-sm font-medium text-slate-700">
              {tePlaatsenMeubel?.naam || geselecteerdMeubel?.naam}
            </span>
            {tePlaatsenMeubel && (
              <span className="text-xs text-blue-600 font-medium">Tap om te plaatsen</span>
            )}
            {/* Notitie indicator/button - tappable om te bewerken */}
            {geselecteerdItem && onNotitieChange && (
              <button
                onClick={() => {
                  setShowNotitieInput(!showNotitieInput)
                  setShowKleurPicker(false)
                }}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all active:scale-95 ${
                  showNotitieInput ? 'bg-blue-100 text-blue-600' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <span>📝</span>
                <span className="truncate max-w-[80px]">
                  {geselecteerdItem.notitie || 'Notitie'}
                </span>
              </button>
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
            <div className={`w-12 h-12 flex items-center justify-center transition-all active:scale-90 ${
              tePlaatsenMeubelId
                ? 'glass-fab-primary'
                : 'glass-fab'
            }`}>
              <svg className={`w-5 h-5 ${tePlaatsenMeubelId ? 'text-white' : 'text-slate-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <div className={`w-12 h-12 flex items-center justify-center transition-all ${
              geselecteerdItemId
                ? 'glass-fab active:scale-90'
                : 'glass-fab opacity-40'
            }`}>
              <svg className={`w-5 h-5 ${geselecteerdItemId ? 'text-slate-600' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <span className={`text-xs font-medium ${geselecteerdItemId ? 'text-slate-500' : 'text-slate-400'}`}>
              Roteer
            </span>
          </button>

          {/* Dupliceren (alleen als item geselecteerd) */}
          <button
            onClick={onDuplicate}
            disabled={!geselecteerdItemId || !onDuplicate}
            className="flex flex-col items-center gap-1.5 p-1"
          >
            <div className={`w-12 h-12 flex items-center justify-center transition-all ${
              geselecteerdItemId && onDuplicate
                ? 'glass-fab active:scale-90'
                : 'glass-fab opacity-40'
            }`}>
              <svg className={`w-5 h-5 ${geselecteerdItemId && onDuplicate ? 'text-blue-500' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <span className={`text-xs font-medium ${geselecteerdItemId && onDuplicate ? 'text-blue-500' : 'text-slate-400'}`}>
              Kopieer
            </span>
          </button>

          {/* Meten */}
          <button
            onClick={onLineaalToggle}
            className="flex flex-col items-center gap-1.5 p-1"
          >
            <div className={`w-12 h-12 flex items-center justify-center transition-all active:scale-90 ${
              lineaalModus
                ? 'glass-fab-primary !bg-gradient-to-br !from-orange-400 !to-amber-500'
                : 'glass-fab'
            }`}>
              <svg className={`w-5 h-5 ${lineaalModus ? 'text-white' : 'text-slate-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <div className={`w-12 h-12 flex items-center justify-center transition-all ${
              geselecteerdItemId
                ? 'glass-fab active:scale-90 hover:bg-red-500/10'
                : 'glass-fab opacity-40'
            }`}>
              <svg className={`w-5 h-5 ${geselecteerdItemId ? 'text-red-500' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
