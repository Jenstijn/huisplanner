import { useState } from 'react'
import { beschikbareMeubels } from '../../data/appartement'
import { Meubel } from '../../types'
import MeubelIcoon from '../MeubelIcoon'

interface MobileMeubelSelectorProps {
  geselecteerdMeubelId: string | null
  onMeubelSelect: (id: string | null, customAfmetingen?: { breedte: number; hoogte: number }) => void
}

const categorieNaam: Record<string, string> = {
  'woonkamer': 'Woonkamer',
  'slaapkamer': 'Slaapkamer',
  'eetkamer': 'Eetkamer',
  'accessoires': 'Accessoires'
}

/**
 * Mobile-optimized meubel selector met grid layout en grote touch targets.
 * Gebruikt tap-to-select in plaats van drag & drop.
 */
export default function MobileMeubelSelector({
  geselecteerdMeubelId,
  onMeubelSelect
}: MobileMeubelSelectorProps) {
  const [activeCategorie, setActiveCategorie] = useState<string>('woonkamer')
  const [geselecteerdeAfmetingIndex, setGeselecteerdeAfmetingIndex] = useState<Record<string, number>>({})

  // Groepeer meubels per categorie
  const getCategorieen = (): Record<string, Meubel[]> => {
    const cats: Record<string, Meubel[]> = {
      'woonkamer': [],
      'slaapkamer': [],
      'eetkamer': [],
      'accessoires': []
    }

    beschikbareMeubels.forEach(meubel => {
      const cat = meubel.categorie || 'accessoires'
      if (cats[cat]) {
        cats[cat].push(meubel)
      }
    })

    return cats
  }

  const categorieen = getCategorieen()
  const meubelsInCategorie = categorieen[activeCategorie] || []

  // Haal huidige afmetingen op
  const getHuidigeAfmetingen = (meubel: Meubel) => {
    const index = geselecteerdeAfmetingIndex[meubel.id] ?? 0
    if (meubel.beschikbareAfmetingen && meubel.beschikbareAfmetingen[index]) {
      return meubel.beschikbareAfmetingen[index]
    }
    return { label: 'Standaard', breedte: meubel.breedte, hoogte: meubel.hoogte }
  }

  // Handler voor meubel tap
  const handleMeubelTap = (meubel: Meubel) => {
    if (geselecteerdMeubelId === meubel.id) {
      // Deselecteer
      onMeubelSelect(null)
    } else {
      // Selecteer met standaard afmetingen
      const afm = getHuidigeAfmetingen(meubel)
      onMeubelSelect(meubel.id, { breedte: afm.breedte, hoogte: afm.hoogte })
    }
  }

  // Handler voor afmeting selectie
  const handleAfmetingSelect = (meubelId: string, index: number) => {
    setGeselecteerdeAfmetingIndex(prev => ({ ...prev, [meubelId]: index }))

    const meubel = beschikbareMeubels.find(m => m.id === meubelId)
    if (meubel?.beschikbareAfmetingen?.[index]) {
      const afm = meubel.beschikbareAfmetingen[index]
      onMeubelSelect(meubelId, { breedte: afm.breedte, hoogte: afm.hoogte })
    }
  }

  const geselecteerdMeubel = geselecteerdMeubelId
    ? beschikbareMeubels.find(m => m.id === geselecteerdMeubelId)
    : null

  return (
    <div className="flex flex-col h-full">
      {/* Categorie tabs */}
      <div className="flex overflow-x-auto gap-2 px-4 py-3 border-b border-slate-100 no-scrollbar">
        {Object.entries(categorieNaam).map(([cat, naam]) => (
          <button
            key={cat}
            onClick={() => setActiveCategorie(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeCategorie === cat
                ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30'
                : 'bg-slate-100 text-slate-600 active:bg-slate-200'
            }`}
          >
            {naam}
            <span className="ml-1 opacity-70">({categorieen[cat]?.length || 0})</span>
          </button>
        ))}
      </div>

      {/* Geselecteerd meubel info */}
      {geselecteerdMeubel && (
        <div className="mx-4 mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg overflow-hidden">
                <MeubelIcoon
                  type={geselecteerdMeubel.icoon || 'default'}
                  size={32}
                  kleur={geselecteerdMeubel.kleur}
                />
              </div>
              <div>
                <span className="text-sm font-semibold text-blue-900">{geselecteerdMeubel.naam}</span>
                <p className="text-xs text-blue-600">Tap op plattegrond om te plaatsen</p>
              </div>
            </div>
            <button
              onClick={() => onMeubelSelect(null)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 active:bg-blue-200"
            >
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Afmetingen selectie */}
          {geselecteerdMeubel.beschikbareAfmetingen && geselecteerdMeubel.beschikbareAfmetingen.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {geselecteerdMeubel.beschikbareAfmetingen.map((afm, i) => (
                <button
                  key={i}
                  onClick={() => handleAfmetingSelect(geselecteerdMeubel.id, i)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    (geselecteerdeAfmetingIndex[geselecteerdMeubel.id] ?? 0) === i
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-blue-700 border border-blue-200'
                  }`}
                >
                  {afm.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Meubel grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-3 gap-3">
          {meubelsInCategorie.map((meubel) => {
            const isGeselecteerd = geselecteerdMeubelId === meubel.id
            const huidigeAfm = getHuidigeAfmetingen(meubel)

            return (
              <button
                key={meubel.id}
                onClick={() => handleMeubelTap(meubel)}
                className={`aspect-square p-2 rounded-xl flex flex-col items-center justify-center transition-all active:scale-95 ${
                  isGeselecteerd
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30 ring-2 ring-blue-300'
                    : 'bg-slate-50 active:bg-slate-100'
                }`}
              >
                <div className={`w-12 h-12 rounded-lg overflow-hidden mb-1 ${isGeselecteerd ? 'ring-2 ring-white/50' : ''}`}>
                  <MeubelIcoon
                    type={meubel.icoon || 'default'}
                    size={48}
                    kleur={meubel.kleur}
                  />
                </div>
                <span className={`text-xs font-medium text-center line-clamp-2 ${
                  isGeselecteerd ? 'text-white' : 'text-slate-700'
                }`}>
                  {meubel.naam}
                </span>
                <span className={`text-[10px] ${isGeselecteerd ? 'text-blue-100' : 'text-slate-400'}`}>
                  {huidigeAfm.breedte}×{huidigeAfm.hoogte}m
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Instructie footer */}
      <div className="px-4 py-3 bg-slate-50 border-t border-slate-100">
        <p className="text-xs text-slate-500 text-center">
          {geselecteerdMeubelId
            ? '👆 Tap op de plattegrond om het meubel te plaatsen'
            : '👆 Tap op een meubel om te selecteren'}
        </p>
      </div>
    </div>
  )
}
