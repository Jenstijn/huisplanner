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
 * Mobile-optimized meubel selector met Liquid Glass design.
 * iOS 26 style met glass cards en smooth animations.
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
      {/* Categorie tabs - glass pills */}
      <div className="flex overflow-x-auto gap-2 px-4 py-3 no-scrollbar">
        {Object.entries(categorieNaam).map(([cat, naam]) => (
          <button
            key={cat}
            onClick={() => setActiveCategorie(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all active:scale-95 ${
              activeCategorie === cat
                ? 'glass-fab-primary !rounded-full'
                : 'glass-pill text-slate-600'
            }`}
          >
            {naam}
            <span className="ml-1 opacity-70">({categorieen[cat]?.length || 0})</span>
          </button>
        ))}
      </div>

      {/* Geselecteerd meubel info - glass card */}
      {geselecteerdMeubel && (
        <div className="mx-4 mt-1 mb-3 animate-scale-in">
          <div className="glass-active p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-white/30">
                  <MeubelIcoon
                    type={geselecteerdMeubel.icoon || 'default'}
                    size={40}
                    kleur={geselecteerdMeubel.kleur}
                  />
                </div>
                <div>
                  <span className="text-sm font-semibold text-slate-800">{geselecteerdMeubel.naam}</span>
                  <p className="text-xs text-blue-600 font-medium">Tap op plattegrond om te plaatsen</p>
                </div>
              </div>
              <button
                onClick={() => onMeubelSelect(null)}
                className="w-8 h-8 glass-fab flex items-center justify-center transition-all active:scale-90"
              >
                <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Afmetingen selectie - glass buttons */}
            {geselecteerdMeubel.beschikbareAfmetingen && geselecteerdMeubel.beschikbareAfmetingen.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {geselecteerdMeubel.beschikbareAfmetingen.map((afm, i) => (
                  <button
                    key={i}
                    onClick={() => handleAfmetingSelect(geselecteerdMeubel.id, i)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 ${
                      (geselecteerdeAfmetingIndex[geselecteerdMeubel.id] ?? 0) === i
                        ? 'glass-fab-primary !rounded-full text-white'
                        : 'glass-pill text-slate-700'
                    }`}
                  >
                    {afm.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Meubel grid - glass cards */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="grid grid-cols-3 gap-2.5">
          {meubelsInCategorie.map((meubel) => {
            const isGeselecteerd = geselecteerdMeubelId === meubel.id
            const huidigeAfm = getHuidigeAfmetingen(meubel)

            return (
              <button
                key={meubel.id}
                onClick={() => handleMeubelTap(meubel)}
                className={`aspect-square p-2 flex flex-col items-center justify-center transition-all active:scale-95 ${
                  isGeselecteerd
                    ? 'glass-active'
                    : 'glass-subtle'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl overflow-hidden mb-1.5 ${
                  isGeselecteerd ? 'ring-2 ring-blue-400/50' : ''
                }`}>
                  <MeubelIcoon
                    type={meubel.icoon || 'default'}
                    size={48}
                    kleur={meubel.kleur}
                  />
                </div>
                <span className={`text-xs font-medium text-center line-clamp-2 ${
                  isGeselecteerd ? 'text-blue-700' : 'text-slate-700'
                }`}>
                  {meubel.naam}
                </span>
                <span className={`text-[10px] ${isGeselecteerd ? 'text-blue-500' : 'text-slate-400'}`}>
                  {huidigeAfm.breedte}×{huidigeAfm.hoogte}m
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Instructie footer - glass bar */}
      <div className="mx-4 mb-4">
        <div className="glass-pill py-2.5 px-4 text-center">
          <p className="text-xs text-slate-600">
            {geselecteerdMeubelId
              ? '👆 Tap op de plattegrond om te plaatsen'
              : '👆 Selecteer een meubel'}
          </p>
        </div>
      </div>
    </div>
  )
}
