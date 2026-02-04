import { beschikbareMeubels } from '../data/appartement'

interface ToolbarProps {
  geselecteerdItemId: string | null
  onVerwijderen: () => void
  onRoteren: () => void
  aantalItems: number
  tePlaatsenMeubelId?: string | null
}

export default function Toolbar({
  geselecteerdItemId,
  onVerwijderen,
  onRoteren,
  tePlaatsenMeubelId
}: ToolbarProps) {
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
    <div className="flex justify-center">
      <div className="inline-flex items-center gap-1 p-1.5 bg-white rounded-full shadow-lg border border-slate-200">
        {/* Roteer knop */}
        <button
          onClick={onRoteren}
          className="group flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-all"
          title="Roteer 90°"
        >
          <svg className="w-4 h-4 text-slate-600 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span className="text-sm font-medium text-slate-700">Roteer</span>
        </button>

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
