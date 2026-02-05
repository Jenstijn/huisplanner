import { useState, useEffect, useRef } from 'react'
import Plattegrond from './components/Plattegrond'
import MeubelLijst from './components/MeubelLijst'
import Toolbar from './components/Toolbar'
import ZoomControls from './components/ZoomControls'
import EigenschappenPaneel from './components/EigenschappenPaneel'
import { GeplaatstMeubel } from './types'
import { beschikbareMeubels, PIXELS_PER_METER } from './data/appartement'

// Canvas dimensies (moet overeenkomen met Plattegrond.tsx)
const CANVAS_BREEDTE_M = 9
const CANVAS_HOOGTE_M = 12.5
const OFFSET = 40
const CANVAS_BREEDTE_PX = CANVAS_BREEDTE_M * PIXELS_PER_METER + OFFSET * 2
const CANVAS_HOOGTE_PX = CANVAS_HOOGTE_M * PIXELS_PER_METER + OFFSET * 2

function App() {
  // Ref voor de canvas container om beschikbare ruimte te meten
  const canvasContainerRef = useRef<HTMLDivElement>(null)

  // State voor geplaatste meubels
  const [geplaatsteItems, setGeplaatsteItems] = useState<GeplaatstMeubel[]>([])

  // State voor geselecteerd meubel uit de lijst (om te plaatsen)
  const [tePlaatsenMeubelId, setTePlaatsenMeubelId] = useState<string | null>(null)

  // State voor custom afmetingen van het te plaatsen meubel
  const [customAfmetingen, setCustomAfmetingen] = useState<{ breedte: number; hoogte: number } | null>(null)

  // State voor geselecteerd item op de plattegrond (om te bewerken)
  const [geselecteerdItemId, setGeselecteerdItemId] = useState<string | null>(null)

  // State voor zoom en pan - start met null zodat we weten dat initiële zoom nog berekend moet worden
  const [zoom, setZoom] = useState<number | null>(null)
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 })

  // State voor lineaal/meet modus
  const [lineaalModus, setLineaalModus] = useState(false)
  const [meetResultaat, setMeetResultaat] = useState<{ afstand: number; van: {x: number, y: number}; naar: {x: number, y: number} } | null>(null)

  // Bereken initiële zoom zodat hele plattegrond past
  useEffect(() => {
    if (zoom !== null) return // Al geïnitialiseerd

    const calculateInitialZoom = () => {
      if (!canvasContainerRef.current) return

      const container = canvasContainerRef.current
      const availableWidth = container.clientWidth - 32 // padding
      const availableHeight = container.clientHeight - 32

      // Bereken zoom zodat canvas past in beschikbare ruimte
      const zoomX = availableWidth / CANVAS_BREEDTE_PX
      const zoomY = availableHeight / CANVAS_HOOGTE_PX

      // Gebruik kleinste zoom zodat beide dimensies passen, met een kleine marge
      const fitZoom = Math.min(zoomX, zoomY) * 0.95

      // Clamp tussen 0.3 en 1 (nooit groter dan 100% bij start)
      const initialZoom = Math.max(0.3, Math.min(1, fitZoom))

      setZoom(initialZoom)
    }

    // Wacht even tot layout is gerenderd
    requestAnimationFrame(calculateInitialZoom)
  }, [zoom])

  // Lineaal toggle handler
  const handleLineaalToggle = () => {
    setLineaalModus(!lineaalModus)
    if (lineaalModus) {
      // Bij uitschakelen, wis meetresultaat
      setMeetResultaat(null)
    } else {
      // Bij inschakelen, deselect meubels en reset plaatsingsmodus
      setGeselecteerdItemId(null)
      setTePlaatsenMeubelId(null)
    }
  }

  // Zoom handlers
  const handleZoomIn = () => setZoom(z => Math.min((z ?? 1) * 1.2, 3))
  const handleZoomOut = () => setZoom(z => Math.max((z ?? 1) / 1.2, 0.3))
  const handleZoomReset = () => {
    // Reset naar fit-to-view zoom
    if (canvasContainerRef.current) {
      const container = canvasContainerRef.current
      const availableWidth = container.clientWidth - 32
      const availableHeight = container.clientHeight - 32
      const zoomX = availableWidth / CANVAS_BREEDTE_PX
      const zoomY = availableHeight / CANVAS_HOOGTE_PX
      const fitZoom = Math.min(zoomX, zoomY) * 0.95
      setZoom(Math.max(0.3, Math.min(1, fitZoom)))
    } else {
      setZoom(0.75)
    }
    setStagePosition({ x: 0, y: 0 })
  }

  // Nieuw meubel plaatsen op de plattegrond
  const handleStageClick = (x: number, y: number) => {
    // In lineaal modus, geen meubel plaatsen
    if (lineaalModus) return

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

  // Item roteren (90 graden)
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

  // Item roteren naar specifieke hoek (360 graden)
  const handleSetRotatie = (graden: number) => {
    if (geselecteerdItemId) {
      setGeplaatsteItems(items =>
        items.map(item =>
          item.id === geselecteerdItemId
            ? { ...item, rotatie: graden % 360 }
            : item
        )
      )
    }
  }

  // Item resizen (nieuwe afmetingen)
  const handleResize = (id: string, nieuweBreedte: number, nieuweHoogte: number) => {
    // Zoek het meubel voor min/max grenzen
    const item = geplaatsteItems.find(i => i.id === id)
    if (!item) return

    const meubel = beschikbareMeubels.find(m => m.id === item.meubelId)
    if (!meubel) return

    // Clamp naar min/max indien gedefinieerd
    const minBreedte = meubel.minBreedte ?? 0.3
    const maxBreedte = meubel.maxBreedte ?? 10
    const minHoogte = meubel.minHoogte ?? 0.3
    const maxHoogte = meubel.maxHoogte ?? 10

    const clampedBreedte = Math.max(minBreedte, Math.min(maxBreedte, nieuweBreedte))
    const clampedHoogte = Math.max(minHoogte, Math.min(maxHoogte, nieuweHoogte))

    setGeplaatsteItems(items =>
      items.map(item =>
        item.id === id
          ? { ...item, customBreedte: clampedBreedte, customHoogte: clampedHoogte }
          : item
      )
    )
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
    <div className="h-screen overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header - vaste hoogte */}
      <header className="h-16 bg-white border-b border-slate-200 z-50 shadow-sm flex items-center">
        <div className="w-full max-w-[1800px] mx-auto px-6 flex items-center justify-between">
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

      {/* Main Content - vulling van resterende hoogte */}
      <main className="h-[calc(100vh-64px)] overflow-hidden">
        <div className="h-full max-w-[1800px] mx-auto p-4">
          <div className="flex gap-4 h-full">
            {/* Linker sidebar: Meubel selectie */}
            <aside className="w-72 h-full flex-shrink-0">
            <MeubelLijst
              geselecteerdMeubelId={tePlaatsenMeubelId}
              onMeubelSelect={(id, afmetingen) => {
                setTePlaatsenMeubelId(id)
                setCustomAfmetingen(afmetingen ?? null)
                setGeselecteerdItemId(null)
              }}
            />
            </aside>

            {/* Midden: Plattegrond */}
            <div className="flex-1 flex flex-col gap-3 h-full overflow-hidden">
              {/* Floating Toolbar */}
            <Toolbar
              geselecteerdItemId={geselecteerdItemId}
              onVerwijderen={handleVerwijderen}
              onRoteren={handleRoteren}
              onSetRotatie={handleSetRotatie}
              huidigeRotatie={geplaatsteItems.find(i => i.id === geselecteerdItemId)?.rotatie}
              aantalItems={geplaatsteItems.length}
              tePlaatsenMeubelId={tePlaatsenMeubelId}
              geselecteerdItem={geplaatsteItems.find(i => i.id === geselecteerdItemId)}
              onResize={handleResize}
            />

              {/* Plattegrond Canvas */}
              <div
                ref={canvasContainerRef}
                className="flex-1 overflow-auto bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/50 p-4"
              >
              {zoom !== null && (
              <Plattegrond
                geplaatsteItems={geplaatsteItems}
                geselecteerdItem={geselecteerdItemId}
                onItemSelect={handleItemSelect}
                onItemMove={handleItemMove}
                onStageClick={handleStageClick}
                onDrop={handleDrop}
                onItemResize={handleResize}
                zoom={zoom}
                stagePosition={stagePosition}
                onZoomChange={setZoom}
                onStageMove={setStagePosition}
                lineaalModus={lineaalModus}
                onMeetResultaat={setMeetResultaat}
              />
              )}
              </div>

              {/* Instructie hint */}
              <div className="text-center text-sm text-slate-500 py-2 flex-shrink-0">
                {lineaalModus ? (
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-50 text-orange-700 rounded-full text-xs">
                    <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                    Klik en sleep om af te meten
                  </span>
                ) : tePlaatsenMeubelId ? (
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                    Klik op de plattegrond om het meubel te plaatsen
                  </span>
                ) : geselecteerdItemId ? (
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-100 text-slate-600 rounded-full text-xs">
                    Sleep om te verplaatsen, of gebruik de toolbar
                  </span>
                ) : (
                  <span className="text-slate-400 text-xs">Sleep een meubel naar de plattegrond</span>
                )}
              </div>
            </div>

            {/* Rechter sidebar: Eigenschappen paneel */}
            <aside className="w-64 h-full flex-shrink-0 overflow-auto">
            <EigenschappenPaneel
              geselecteerdItem={geplaatsteItems.find(i => i.id === geselecteerdItemId)}
              meubel={geselecteerdItemId
                ? beschikbareMeubels.find(m => m.id === geplaatsteItems.find(i => i.id === geselecteerdItemId)?.meubelId)
                : undefined
              }
              geplaatsteItems={geplaatsteItems}
              beschikbareMeubels={beschikbareMeubels}
              zoom={zoom ?? 1}
            />
            </aside>
          </div>
        </div>
      </main>

      {/* Zoom Controls */}
      <ZoomControls
        zoom={zoom ?? 1}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
      />

      {/* Lineaal Tool Button */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3">
        <button
          onClick={handleLineaalToggle}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg transition-all ${
            lineaalModus
              ? 'bg-orange-500 text-white shadow-orange-500/30'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
          }`}
          title={lineaalModus ? 'Lineaal uitschakelen (Escape)' : 'Afstand meten'}
        >
          {/* Lineaal icoon */}
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
          <span className="text-sm font-medium">
            {lineaalModus ? 'Meten actief' : 'Meten'}
          </span>
        </button>

        {/* Meetresultaat display */}
        {meetResultaat && (
          <div className="flex items-center gap-2 px-4 py-2.5 bg-orange-50 border border-orange-200 rounded-full shadow-lg">
            <span className="text-orange-600 font-semibold text-lg">
              {meetResultaat.afstand.toFixed(2)} m
            </span>
            <span className="text-orange-500 text-sm">
              ({(meetResultaat.afstand * 100).toFixed(0)} cm)
            </span>
            <button
              onClick={() => setMeetResultaat(null)}
              className="ml-1 text-orange-400 hover:text-orange-600 transition-colors"
              title="Wis meting"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
