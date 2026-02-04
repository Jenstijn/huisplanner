import { useState } from 'react'
import Plattegrond from './components/Plattegrond'
import MeubelLijst from './components/MeubelLijst'
import Toolbar from './components/Toolbar'
import { GeplaatstMeubel } from './types'
import { beschikbareMeubels } from './data/appartement'

function App() {
  // State voor geplaatste meubels
  const [geplaatsteItems, setGeplaatsteItems] = useState<GeplaatstMeubel[]>([])

  // State voor geselecteerd meubel uit de lijst (om te plaatsen)
  const [tePlaatsenMeubelId, setTePlaatsenMeubelId] = useState<string | null>(null)

  // State voor custom afmetingen van het te plaatsen meubel
  const [customAfmetingen, setCustomAfmetingen] = useState<{ breedte: number; hoogte: number } | null>(null)

  // State voor geselecteerd item op de plattegrond (om te bewerken)
  const [geselecteerdItemId, setGeselecteerdItemId] = useState<string | null>(null)

  // Nieuw meubel plaatsen op de plattegrond
  const handleStageClick = (x: number, y: number) => {
    if (tePlaatsenMeubelId) {
      const meubel = beschikbareMeubels.find(m => m.id === tePlaatsenMeubelId)
      if (meubel) {
        // Gebruik custom afmetingen indien beschikbaar, anders standaard
        const breedte = customAfmetingen?.breedte ?? meubel.breedte
        const hoogte = customAfmetingen?.hoogte ?? meubel.hoogte

        const nieuwItem: GeplaatstMeubel = {
          id: `${tePlaatsenMeubelId}-${Date.now()}`,
          meubelId: tePlaatsenMeubelId,
          x: x - breedte / 2,
          y: y - hoogte / 2,
          rotatie: 0,
          // Sla custom afmetingen op indien anders dan standaard
          ...(customAfmetingen && {
            customBreedte: customAfmetingen.breedte,
            customHoogte: customAfmetingen.hoogte
          })
        }
        setGeplaatsteItems([...geplaatsteItems, nieuwItem])
        // Reset plaatsingsmodus na plaatsing
        setTePlaatsenMeubelId(null)
        setCustomAfmetingen(null)
      }
    } else {
      setGeselecteerdItemId(null)
    }
  }

  // Item selecteren op de plattegrond
  const handleItemSelect = (id: string | null) => {
    setGeselecteerdItemId(id)
    if (id) {
      setTePlaatsenMeubelId(null)
    }
  }

  // Item verplaatsen
  const handleItemMove = (id: string, x: number, y: number) => {
    setGeplaatsteItems(items =>
      items.map(item =>
        item.id === id ? { ...item, x, y } : item
      )
    )
  }

  // Item verwijderen
  const handleVerwijderen = () => {
    if (geselecteerdItemId) {
      setGeplaatsteItems(items => items.filter(item => item.id !== geselecteerdItemId))
      setGeselecteerdItemId(null)
    }
  }

  // Item roteren
  const handleRoteren = () => {
    if (geselecteerdItemId) {
      setGeplaatsteItems(items =>
        items.map(item =>
          item.id === geselecteerdItemId
            ? { ...item, rotatie: (item.rotatie + 90) % 360 }
            : item
        )
      )
    }
  }

  // Alles wissen
  const handleAllesWissen = () => {
    setGeplaatsteItems([])
    setGeselecteerdItemId(null)
    setTePlaatsenMeubelId(null)
    setCustomAfmetingen(null)
  }

  // Meubel plaatsen via drag-and-drop
  const handleDrop = (meubelId: string, x: number, y: number, customBreedte?: number, customHoogte?: number) => {
    const meubel = beschikbareMeubels.find(m => m.id === meubelId)
    if (meubel) {
      const breedte = customBreedte ?? meubel.breedte
      const hoogte = customHoogte ?? meubel.hoogte

      const nieuwItem: GeplaatstMeubel = {
        id: `${meubelId}-${Date.now()}`,
        meubelId: meubelId,
        x: x - breedte / 2,
        y: y - hoogte / 2,
        rotatie: 0,
        ...(customBreedte && customHoogte && {
          customBreedte,
          customHoogte
        })
      }
      setGeplaatsteItems([...geplaatsteItems, nieuwItem])
      // Reset selectie na drop
      setTePlaatsenMeubelId(null)
      setCustomAfmetingen(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1800px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-800 tracking-tight">Huisplanner</h1>
              <p className="text-xs text-slate-500">Plan je nieuwe appartement</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-500">
              <span className="font-medium text-slate-700">{geplaatsteItems.length}</span> meubels geplaatst
            </div>
            {geplaatsteItems.length > 0 && (
              <button
                onClick={handleAllesWissen}
                className="px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                Wis alles
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1800px] mx-auto p-6">
        <div className="flex gap-6">
          {/* Linker sidebar: Meubel selectie */}
          <aside className="w-72 flex-shrink-0">
            <MeubelLijst
              geselecteerdMeubelId={tePlaatsenMeubelId}
              onMeubelSelect={(id, afmetingen) => {
                setTePlaatsenMeubelId(id)
                setCustomAfmetingen(afmetingen ?? null)
                setGeselecteerdItemId(null)
              }}
            />
          </aside>

          {/* Rechter paneel: Plattegrond */}
          <div className="flex-1 flex flex-col gap-4">
            {/* Floating Toolbar */}
            <Toolbar
              geselecteerdItemId={geselecteerdItemId}
              onVerwijderen={handleVerwijderen}
              onRoteren={handleRoteren}
              aantalItems={geplaatsteItems.length}
              tePlaatsenMeubelId={tePlaatsenMeubelId}
            />

            {/* Plattegrond Canvas */}
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/50 p-6 overflow-auto">
              <Plattegrond
                geplaatsteItems={geplaatsteItems}
                geselecteerdItem={geselecteerdItemId}
                onItemSelect={handleItemSelect}
                onItemMove={handleItemMove}
                onStageClick={handleStageClick}
                onDrop={handleDrop}
              />
            </div>

            {/* Instructie hint */}
            <div className="text-center text-sm text-slate-500">
              {tePlaatsenMeubelId ? (
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                  Klik op de plattegrond om het meubel te plaatsen
                </span>
              ) : geselecteerdItemId ? (
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-full">
                  Sleep om te verplaatsen, of gebruik de toolbar om te roteren/verwijderen
                </span>
              ) : (
                <span className="text-slate-400">Sleep een meubel naar de plattegrond, of klik om te selecteren</span>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
