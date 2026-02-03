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

  // State voor geselecteerd item op de plattegrond (om te bewerken)
  const [geselecteerdItemId, setGeselecteerdItemId] = useState<string | null>(null)

  // Nieuw meubel plaatsen op de plattegrond
  const handleStageClick = (x: number, y: number) => {
    if (tePlaatsenMeubelId) {
      const meubel = beschikbareMeubels.find(m => m.id === tePlaatsenMeubelId)
      if (meubel) {
        const nieuwItem: GeplaatstMeubel = {
          id: `${tePlaatsenMeubelId}-${Date.now()}`,
          meubelId: tePlaatsenMeubelId,
          x: x - meubel.breedte / 2,  // Centreer het meubel op de klik positie
          y: y - meubel.hoogte / 2,
          rotatie: 0
        }
        setGeplaatsteItems([...geplaatsteItems, nieuwItem])
        // Reset selectie na plaatsen (optioneel - verwijder deze regel om meerdere te plaatsen)
        // setTePlaatsenMeubelId(null)
      }
    } else {
      // Deselecteer item als we op lege ruimte klikken
      setGeselecteerdItemId(null)
    }
  }

  // Item selecteren op de plattegrond
  const handleItemSelect = (id: string | null) => {
    setGeselecteerdItemId(id)
    // Als we een item selecteren, reset de meubel selectie
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

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Huisplanner</h1>
        <p className="text-gray-600">Plan de inrichting van je nieuwe appartement</p>
      </header>

      <div className="flex gap-4">
        {/* Linker paneel: Meubel selectie */}
        <div className="w-64 flex-shrink-0">
          <MeubelLijst
            geselecteerdMeubelId={tePlaatsenMeubelId}
            onMeubelSelect={(id) => {
              setTePlaatsenMeubelId(id)
              setGeselecteerdItemId(null)  // Reset plattegrond selectie
            }}
          />
        </div>

        {/* Rechter paneel: Plattegrond en toolbar */}
        <div className="flex-1 flex flex-col gap-4">
          <Toolbar
            geselecteerdItemId={geselecteerdItemId}
            onVerwijderen={handleVerwijderen}
            onRoteren={handleRoteren}
            aantalItems={geplaatsteItems.length}
          />

          <div className="bg-white rounded-lg shadow p-4 overflow-auto">
            <Plattegrond
              geplaatsteItems={geplaatsteItems}
              geselecteerdItem={geselecteerdItemId}
              onItemSelect={handleItemSelect}
              onItemMove={handleItemMove}
              onStageClick={handleStageClick}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
