import { useState } from 'react'
import { beschikbareMeubels } from '../data/appartement'
import { Meubel } from '../types'
import MeubelIcoon from './MeubelIcoon'

interface MeubelLijstProps {
  geselecteerdMeubelId: string | null
  onMeubelSelect: (id: string | null, customAfmetingen?: { breedte: number; hoogte: number }) => void
}

// Categorie iconen (als SVG paths)
const categorieIcoon: Record<string, JSX.Element> = {
  'woonkamer': (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  'slaapkamer': (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12h18M3 6h18M3 18h18" />
    </svg>
  ),
  'eetkamer': (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  'accessoires': (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  'badkamer': (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
  ),
  'kantoor': (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  'tuin': (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

const categorieNaam: Record<string, string> = {
  'woonkamer': 'Woonkamer',
  'slaapkamer': 'Slaapkamer',
  'eetkamer': 'Eetkamer',
  'accessoires': 'Accessoires',
  'badkamer': 'Badkamer',
  'kantoor': 'Kantoor',
  'tuin': 'Tuin / Balkon'
}

export default function MeubelLijst({ geselecteerdMeubelId, onMeubelSelect }: MeubelLijstProps) {
  const [zoekterm, setZoekterm] = useState('')
  const [openCategorien, setOpenCategorien] = useState<string[]>(['woonkamer', 'slaapkamer', 'eetkamer', 'accessoires', 'badkamer', 'kantoor', 'tuin'])
  const [geselecteerdeAfmetingIndex, setGeselecteerdeAfmetingIndex] = useState<Record<string, number>>({})
  const [handmatigeBreedte, setHandmatigeBreedte] = useState('')
  const [handmatigeHoogte, setHandmatigeHoogte] = useState('')
  const [toonHandmatig, setToonHandmatig] = useState(false)

  // Groepeer meubels per categorie (dynamisch uit meubel.categorie)
  const getCategorieen = (): Record<string, Meubel[]> => {
    const cats: Record<string, Meubel[]> = {
      'woonkamer': [],
      'slaapkamer': [],
      'eetkamer': [],
      'accessoires': [],
      'badkamer': [],
      'kantoor': [],
      'tuin': []
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

  const toggleCategorie = (cat: string) => {
    setOpenCategorien(prev =>
      prev.includes(cat)
        ? prev.filter(c => c !== cat)
        : [...prev, cat]
    )
  }

  // Filter meubels op zoekterm
  const gefilterdeCategorieen = Object.entries(categorieen)
    .map(([cat, meubels]) => {
      const gefilterd = meubels.filter(m =>
        m.naam.toLowerCase().includes(zoekterm.toLowerCase())
      )
      return [cat, gefilterd] as [string, Meubel[]]
    })
    .filter(([, meubels]) => meubels.length > 0)

  // Haal geselecteerde meubel info op
  const geselecteerdMeubel = geselecteerdMeubelId
    ? beschikbareMeubels.find(m => m.id === geselecteerdMeubelId)
    : null

  // Haal huidige afmetingen op
  const getHuidigeAfmetingen = (meubel: Meubel) => {
    const index = geselecteerdeAfmetingIndex[meubel.id] ?? 0
    if (meubel.beschikbareAfmetingen && meubel.beschikbareAfmetingen[index]) {
      return meubel.beschikbareAfmetingen[index]
    }
    return { label: 'Standaard', breedte: meubel.breedte, hoogte: meubel.hoogte }
  }

  // Handler voor afmeting selectie
  const handleAfmetingSelect = (meubelId: string, index: number) => {
    setGeselecteerdeAfmetingIndex(prev => ({ ...prev, [meubelId]: index }))
    setToonHandmatig(false)

    const meubel = beschikbareMeubels.find(m => m.id === meubelId)
    if (meubel?.beschikbareAfmetingen?.[index]) {
      const afm = meubel.beschikbareAfmetingen[index]
      onMeubelSelect(meubelId, { breedte: afm.breedte, hoogte: afm.hoogte })
    }
  }

  // Handler voor handmatige afmetingen
  const handleHandmatigeAfmetingen = () => {
    if (!geselecteerdMeubelId) return

    const breedte = parseFloat(handmatigeBreedte)
    const hoogte = parseFloat(handmatigeHoogte)

    if (!isNaN(breedte) && !isNaN(hoogte) && breedte > 0 && hoogte > 0) {
      onMeubelSelect(geselecteerdMeubelId, { breedte, hoogte })
      setToonHandmatig(false)
    }
  }

  // Handler voor meubel klik
  const handleMeubelClick = (meubel: Meubel) => {
    if (geselecteerdMeubelId === meubel.id) {
      // Deselecteer
      onMeubelSelect(null)
      setToonHandmatig(false)
    } else {
      // Selecteer met standaard of eerder gekozen afmetingen
      const afm = getHuidigeAfmetingen(meubel)
      onMeubelSelect(meubel.id, { breedte: afm.breedte, hoogte: afm.hoogte })
    }
  }

  // Handler voor drag start
  const handleDragStart = (e: React.DragEvent, meubel: Meubel) => {
    const afm = getHuidigeAfmetingen(meubel)
    const dragData = {
      meubelId: meubel.id,
      breedte: afm.breedte,
      hoogte: afm.hoogte
    }
    e.dataTransfer.setData('application/json', JSON.stringify(dragData))
    e.dataTransfer.effectAllowed = 'copy'

    // Maak een ghost image
    const ghost = document.createElement('div')
    ghost.style.width = '80px'
    ghost.style.height = '80px'
    ghost.style.backgroundColor = meubel.kleur
    ghost.style.borderRadius = '8px'
    ghost.style.opacity = '0.8'
    ghost.style.display = 'flex'
    ghost.style.alignItems = 'center'
    ghost.style.justifyContent = 'center'
    ghost.style.color = 'white'
    ghost.style.fontSize = '10px'
    ghost.style.fontWeight = 'bold'
    ghost.style.textAlign = 'center'
    ghost.style.padding = '4px'
    ghost.textContent = meubel.naam
    document.body.appendChild(ghost)
    e.dataTransfer.setDragImage(ghost, 40, 40)

    // Verwijder ghost element na een korte delay
    setTimeout(() => {
      document.body.removeChild(ghost)
    }, 0)
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/50 overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-100">
        <h2 className="text-base font-semibold text-slate-800 mb-3">Meubels</h2>

        {/* Zoekbalk */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Zoek meubel..."
            value={zoekterm}
            onChange={(e) => setZoekterm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Geselecteerd meubel met afmetingen */}
      {geselecteerdMeubel && (
        <div className="mx-4 mt-4 p-3 bg-blue-50 border border-blue-100 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div
                className="w-5 h-5 rounded-md shadow-sm"
                style={{ backgroundColor: geselecteerdMeubel.kleur }}
              />
              <span className="text-sm font-medium text-blue-900">
                {geselecteerdMeubel.naam}
              </span>
            </div>
            <button
              onClick={() => {
                onMeubelSelect(null)
                setToonHandmatig(false)
              }}
              className="p-1 hover:bg-blue-100 rounded-md transition-colors"
            >
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <p className="text-xs text-blue-600 mb-2">Klik op de plattegrond om te plaatsen</p>

          {/* Afmetingen dropdown */}
          {geselecteerdMeubel.beschikbareAfmetingen && geselecteerdMeubel.beschikbareAfmetingen.length > 0 && (
            <div className="mt-3 pt-3 border-t border-blue-200">
              <label className="text-xs font-medium text-blue-800 block mb-1">Afmeting:</label>
              <select
                value={geselecteerdeAfmetingIndex[geselecteerdMeubel.id] ?? 0}
                onChange={(e) => handleAfmetingSelect(geselecteerdMeubel.id, parseInt(e.target.value))}
                className="w-full px-2 py-1.5 text-sm bg-white border border-blue-200 rounded-lg text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {geselecteerdMeubel.beschikbareAfmetingen.map((afm, i) => (
                  <option key={i} value={i}>{afm.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* Handmatige invoer optie */}
          {geselecteerdMeubel.handmatigeAfmetingen && (
            <div className="mt-3 pt-3 border-t border-blue-200">
              {!toonHandmatig ? (
                <button
                  onClick={() => setToonHandmatig(true)}
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  Aangepaste afmetingen invoeren
                </button>
              ) : (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-blue-800 block">Aangepaste afmetingen:</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      placeholder="Breedte"
                      value={handmatigeBreedte}
                      onChange={(e) => setHandmatigeBreedte(e.target.value)}
                      className="w-20 px-2 py-1 text-sm bg-white border border-blue-200 rounded text-blue-900"
                      step="0.1"
                      min={geselecteerdMeubel.minBreedte}
                      max={geselecteerdMeubel.maxBreedte}
                    />
                    <span className="text-blue-600 text-sm">×</span>
                    <input
                      type="number"
                      placeholder="Hoogte"
                      value={handmatigeHoogte}
                      onChange={(e) => setHandmatigeHoogte(e.target.value)}
                      className="w-20 px-2 py-1 text-sm bg-white border border-blue-200 rounded text-blue-900"
                      step="0.1"
                      min={geselecteerdMeubel.minHoogte}
                      max={geselecteerdMeubel.maxHoogte}
                    />
                    <span className="text-blue-500 text-xs">m</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleHandmatigeAfmetingen}
                      className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Toepassen
                    </button>
                    <button
                      onClick={() => setToonHandmatig(false)}
                      className="px-3 py-1 text-xs text-blue-600 hover:bg-blue-100 rounded"
                    >
                      Annuleren
                    </button>
                  </div>
                  {geselecteerdMeubel.minBreedte && geselecteerdMeubel.maxBreedte && (
                    <p className="text-xs text-blue-500">
                      Breedte: {geselecteerdMeubel.minBreedte}m - {geselecteerdMeubel.maxBreedte}m
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Meubel lijst */}
      <div className="flex-1 overflow-y-auto p-4 pt-2">
        {gefilterdeCategorieen.map(([categorie, meubels]) => (
          <div key={categorie} className="mb-3">
            {/* Categorie header */}
            <button
              onClick={() => toggleCategorie(categorie)}
              className="w-full flex items-center justify-between py-2 px-1 text-left group"
            >
              <div className="flex items-center gap-2">
                <span className="text-slate-400 group-hover:text-slate-600 transition-colors">
                  {categorieIcoon[categorie]}
                </span>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {categorieNaam[categorie] || categorie}
                </span>
                <span className="text-xs text-slate-400">({meubels.length})</span>
              </div>
              <svg
                className={`w-4 h-4 text-slate-400 transition-transform ${openCategorien.includes(categorie) ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Meubels in categorie */}
            {openCategorien.includes(categorie) && (
              <div className="grid grid-cols-1 gap-1.5 mt-1">
                {meubels.map((meubel) => {
                  const isGeselecteerd = geselecteerdMeubelId === meubel.id
                  const huidigeAfm = getHuidigeAfmetingen(meubel)

                  return (
                    <button
                      key={meubel.id}
                      onClick={() => handleMeubelClick(meubel)}
                      draggable
                      onDragStart={(e) => handleDragStart(e, meubel)}
                      className={`
                        p-3 rounded-xl text-left transition-all duration-150 cursor-grab active:cursor-grabbing
                        ${isGeselecteerd
                          ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25 scale-[1.02]'
                          : 'bg-slate-50 hover:bg-slate-100 hover:shadow-sm'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg shadow-sm flex-shrink-0 overflow-hidden ${isGeselecteerd ? 'ring-2 ring-white/50' : ''}`}
                        >
                          <MeubelIcoon
                            type={meubel.icoon || 'default'}
                            size={32}
                            kleur={meubel.kleur}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-medium truncate ${isGeselecteerd ? 'text-white' : 'text-slate-700'}`}>
                            {meubel.naam}
                          </div>
                          <div className={`text-xs ${isGeselecteerd ? 'text-blue-100' : 'text-slate-400'}`}>
                            {isGeselecteerd ? `${huidigeAfm.breedte}m × ${huidigeAfm.hoogte}m` : `${meubel.breedte}m × ${meubel.hoogte}m`}
                            {meubel.beschikbareAfmetingen && !isGeselecteerd && (
                              <span className="ml-1 text-slate-300">• {meubel.beschikbareAfmetingen.length} maten</span>
                            )}
                          </div>
                        </div>
                        {isGeselecteerd && (
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        ))}

        {gefilterdeCategorieen.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-slate-400">Geen meubels gevonden</p>
          </div>
        )}
      </div>

      {/* Footer tips */}
      <div className="p-4 border-t border-slate-100 bg-slate-50">
        <p className="text-xs text-slate-500 leading-relaxed">
          <span className="font-medium">Tip:</span> Selecteer een meubel en klik op de plattegrond. Sleep geplaatste meubels om te verplaatsen.
        </p>
      </div>
    </div>
  )
}
