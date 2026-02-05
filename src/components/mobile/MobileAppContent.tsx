import { useState, useRef, useEffect } from 'react'
import { User } from 'firebase/auth'
import Plattegrond from '../Plattegrond'
import MobileHeader from './MobileHeader'
import MobileToolbar from './MobileToolbar'
import MobileMenu from './MobileMenu'
import BottomSheet from './BottomSheet'
import MobileMeubelSelector from './MobileMeubelSelector'
import { GeplaatstMeubel, Layout } from '../../types'
import { beschikbareMeubels, PIXELS_PER_METER } from '../../data/appartement'
import { exportStageToPdf } from '../../utils/exportPdf'

// Canvas dimensies (moet overeenkomen met Plattegrond.tsx)
const CANVAS_BREEDTE_M = 9
const CANVAS_HOOGTE_M = 12.5
const OFFSET = 40
const CANVAS_BREEDTE_PX = CANVAS_BREEDTE_M * PIXELS_PER_METER + OFFSET * 2
const CANVAS_HOOGTE_PX = CANVAS_HOOGTE_M * PIXELS_PER_METER + OFFSET * 2

interface MobileAppContentProps {
  user: User | null
  logout: () => void
  geplaatsteItems: GeplaatstMeubel[]
  saveItems: (items: GeplaatstMeubel[]) => void
  layouts: Layout[]
  activeLayoutId: string
  switchLayout: (layoutId: string) => void
  createLayout: (naam: string) => Promise<string>
  renameLayout: (layoutId: string, naam: string) => Promise<void>
  duplicateLayout: (layoutId: string, naam: string) => Promise<string>
  deleteLayout: (layoutId: string) => Promise<void>
  onShareLayout?: (layout: Layout) => void
  appVersion?: string
  hasNewVersion?: boolean
  onOpenChangelog?: () => void
}

export default function MobileAppContent({
  user,
  logout,
  geplaatsteItems,
  saveItems,
  layouts,
  activeLayoutId,
  switchLayout,
  createLayout,
  duplicateLayout,
  deleteLayout,
  onShareLayout,
  appVersion,
  hasNewVersion,
  onOpenChangelog
}: MobileAppContentProps) {
  // Refs
  const canvasContainerRef = useRef<HTMLDivElement>(null)

  // UI State
  const [menuOpen, setMenuOpen] = useState(false)
  const [meubelSheetOpen, setMeubelSheetOpen] = useState(false)

  // Selectie state
  const [tePlaatsenMeubelId, setTePlaatsenMeubelId] = useState<string | null>(null)
  const [customAfmetingen, setCustomAfmetingen] = useState<{ breedte: number; hoogte: number } | null>(null)
  const [geselecteerdItemId, setGeselecteerdItemId] = useState<string | null>(null)

  // Zoom en pan state
  const [zoom, setZoom] = useState<number>(0.5) // Iets lager voor mobile
  const [zoomInitialized, setZoomInitialized] = useState(false)
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 })

  // Lineaal state
  const [lineaalModus, setLineaalModus] = useState(false)
  const [meetResultaat, setMeetResultaat] = useState<{ afstand: number; van: {x: number, y: number}; naar: {x: number, y: number} } | null>(null)

  // PDF export state
  const [plattegrondStageRef, setPlattegrondStageRef] = useState<React.RefObject<any> | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  // Bereken initiële zoom voor mobile (fit to screen)
  useEffect(() => {
    if (zoomInitialized) return

    const calculateInitialZoom = () => {
      if (!canvasContainerRef.current) return false

      const container = canvasContainerRef.current
      const availableWidth = container.clientWidth - 16
      const availableHeight = container.clientHeight - 16

      if (availableWidth <= 0 || availableHeight <= 0) return false

      const zoomX = availableWidth / CANVAS_BREEDTE_PX
      const zoomY = availableHeight / CANVAS_HOOGTE_PX
      const fitZoom = Math.min(zoomX, zoomY) * 0.95
      const initialZoom = Math.max(0.25, Math.min(1, fitZoom))

      setZoom(initialZoom)
      setZoomInitialized(true)
      return true
    }

    if (calculateInitialZoom()) return

    const frame = requestAnimationFrame(() => {
      if (calculateInitialZoom()) return
      setTimeout(calculateInitialZoom, 100)
    })

    return () => cancelAnimationFrame(frame)
  }, [zoomInitialized])

  // Handlers
  const handleStageClick = (x: number, y: number) => {
    if (lineaalModus) return

    if (tePlaatsenMeubelId) {
      const meubel = beschikbareMeubels.find(m => m.id === tePlaatsenMeubelId)
      if (meubel) {
        const breedte = customAfmetingen?.breedte ?? meubel.breedte
        const hoogte = customAfmetingen?.hoogte ?? meubel.hoogte

        const nieuwItem: GeplaatstMeubel = {
          id: `${tePlaatsenMeubelId}-${Date.now()}`,
          meubelId: tePlaatsenMeubelId,
          x: x - breedte / 2,
          y: y - hoogte / 2,
          rotatie: 0,
          ...(customAfmetingen && {
            customBreedte: customAfmetingen.breedte,
            customHoogte: customAfmetingen.hoogte
          })
        }

        saveItems([...geplaatsteItems, nieuwItem])
        // Op mobile: deselecteer na plaatsen (gebruiker kan nieuw meubel kiezen)
        setTePlaatsenMeubelId(null)
        setCustomAfmetingen(null)
        // Sluit sheet na plaatsen
        setMeubelSheetOpen(false)
      }
    } else {
      setGeselecteerdItemId(null)
    }
  }

  const handleItemSelect = (id: string | null) => {
    setGeselecteerdItemId(id)
    if (id) {
      setTePlaatsenMeubelId(null)
    }
  }

  const handleItemMove = (id: string, x: number, y: number) => {
    const updatedItems = geplaatsteItems.map(item =>
      item.id === id ? { ...item, x, y } : item
    )
    saveItems(updatedItems)
  }

  const handleRoteren = () => {
    if (geselecteerdItemId) {
      const updatedItems = geplaatsteItems.map(item =>
        item.id === geselecteerdItemId
          ? { ...item, rotatie: (item.rotatie + 90) % 360 }
          : item
      )
      saveItems(updatedItems)
    }
  }

  const handleVerwijderen = () => {
    if (geselecteerdItemId) {
      const updatedItems = geplaatsteItems.filter(item => item.id !== geselecteerdItemId)
      saveItems(updatedItems)
      setGeselecteerdItemId(null)
    }
  }

  const handleAllesWissen = () => {
    saveItems([])
    setGeselecteerdItemId(null)
    setTePlaatsenMeubelId(null)
  }

  const handleLineaalToggle = () => {
    setLineaalModus(!lineaalModus)
    if (lineaalModus) {
      setMeetResultaat(null)
    } else {
      setGeselecteerdItemId(null)
      setTePlaatsenMeubelId(null)
    }
  }

  const handleMeubelSelect = (id: string | null, afmetingen?: { breedte: number; hoogte: number }) => {
    setTePlaatsenMeubelId(id)
    setCustomAfmetingen(afmetingen ?? null)
    setGeselecteerdItemId(null)
    // Sluit sheet niet direct - gebruiker kan nog afmeting kiezen
  }

  const handleResize = (id: string, nieuweBreedte: number, nieuweHoogte: number) => {
    const item = geplaatsteItems.find(i => i.id === id)
    if (!item) return

    const meubel = beschikbareMeubels.find(m => m.id === item.meubelId)
    if (!meubel) return

    const minBreedte = meubel.minBreedte ?? 0.3
    const maxBreedte = meubel.maxBreedte ?? 10
    const minHoogte = meubel.minHoogte ?? 0.3
    const maxHoogte = meubel.maxHoogte ?? 10

    const clampedBreedte = Math.max(minBreedte, Math.min(maxBreedte, nieuweBreedte))
    const clampedHoogte = Math.max(minHoogte, Math.min(maxHoogte, nieuweHoogte))

    const updatedItems = geplaatsteItems.map(item =>
      item.id === id
        ? { ...item, customBreedte: clampedBreedte, customHoogte: clampedHoogte }
        : item
    )
    saveItems(updatedItems)
  }

  // PDF Export handler
  const handleExportPdf = async () => {
    if (!plattegrondStageRef) return

    setIsExporting(true)
    try {
      const activeLayout = layouts.find(l => l.id === activeLayoutId)
      const layoutNaam = activeLayout?.naam ?? 'Plattegrond'
      await exportStageToPdf(plattegrondStageRef, layoutNaam)
    } catch (error) {
      console.error('PDF export fout:', error)
      alert('Er ging iets mis bij het exporteren. Probeer het opnieuw.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden relative">
      {/* Liquid Glass Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100">
        {/* Animated gradient orbs for depth */}
        <div className="absolute top-0 -left-1/4 w-96 h-96 bg-blue-300/40 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-1/4 w-80 h-80 bg-purple-300/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 left-1/4 w-72 h-72 bg-indigo-300/35 rounded-full blur-3xl" />
      </div>

      {/* Content Layer */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Mobile Header */}
        <MobileHeader
          user={user}
          layouts={layouts}
          activeLayoutId={activeLayoutId}
          onLayoutSwitch={switchLayout}
          onMenuOpen={() => setMenuOpen(true)}
        />

        {/* Plattegrond Canvas */}
        <div
          ref={canvasContainerRef}
          className="flex-1 overflow-hidden p-3"
          style={{ touchAction: 'none' }}
        >
          <div className="h-full glass overflow-hidden">
            <Plattegrond
            geplaatsteItems={geplaatsteItems}
            geselecteerdItem={geselecteerdItemId}
            onItemSelect={handleItemSelect}
            onItemMove={handleItemMove}
            onStageClick={handleStageClick}
            onItemResize={handleResize}
            zoom={zoom}
            stagePosition={stagePosition}
            onZoomChange={setZoom}
            onStageMove={setStagePosition}
            lineaalModus={lineaalModus}
            onMeetResultaat={setMeetResultaat}
            onStageRef={setPlattegrondStageRef}
          />
          </div>
        </div>

        {/* Mobile Toolbar */}
        <MobileToolbar
        tePlaatsenMeubelId={tePlaatsenMeubelId}
        geselecteerdItemId={geselecteerdItemId}
        geselecteerdItem={geplaatsteItems.find(i => i.id === geselecteerdItemId)}
        onMeubelSheetOpen={() => setMeubelSheetOpen(true)}
        onRoteren={handleRoteren}
        onVerwijderen={handleVerwijderen}
        onLineaalToggle={handleLineaalToggle}
        lineaalModus={lineaalModus}
        meetResultaat={meetResultaat}
      />

      {/* Meubel Selection Bottom Sheet */}
      <BottomSheet
        isOpen={meubelSheetOpen}
        onClose={() => setMeubelSheetOpen(false)}
        title="Kies een meubel"
        height={0.7}
      >
        <MobileMeubelSelector
          geselecteerdMeubelId={tePlaatsenMeubelId}
          onMeubelSelect={handleMeubelSelect}
        />
      </BottomSheet>

      {/* Menu Drawer */}
      <MobileMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        user={user}
        onLogout={logout}
        layouts={layouts}
        activeLayoutId={activeLayoutId}
        onCreateLayout={createLayout}
        onDeleteLayout={deleteLayout}
        onDuplicateLayout={duplicateLayout}
        aantalItems={geplaatsteItems.length}
        onAllesWissen={handleAllesWissen}
        onShareLayout={onShareLayout}
        activeLayout={layouts.find(l => l.id === activeLayoutId)}
        appVersion={appVersion}
        hasNewVersion={hasNewVersion}
        onOpenChangelog={onOpenChangelog}
        onExportPdf={handleExportPdf}
        isExporting={isExporting}
      />
      </div>
    </div>
  )
}
