import { useState, useEffect, useRef } from 'react'
import Plattegrond from './components/Plattegrond'
import MeubelLijst from './components/MeubelLijst'
import Toolbar from './components/Toolbar'
import ZoomControls from './components/ZoomControls'
import EigenschappenPaneel from './components/EigenschappenPaneel'
import LoginScherm from './components/LoginScherm'
import LayoutSelector from './components/LayoutSelector'
import ShareDialog from './components/ShareDialog'
import MobileAppContent from './components/mobile/MobileAppContent'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { usePlattegrond } from './hooks/usePlattegrond'
import { useSharing } from './hooks/useSharing'
import { useIsMobile } from './hooks/useIsMobile'
import { GeplaatstMeubel, Layout } from './types'
import { beschikbareMeubels, PIXELS_PER_METER } from './data/appartement'

// App versie - update bij elke release
const APP_VERSION = '1.4.0'

// Canvas dimensies (moet overeenkomen met Plattegrond.tsx)
const CANVAS_BREEDTE_M = 9
const CANVAS_HOOGTE_M = 12.5
const OFFSET = 40
const CANVAS_BREEDTE_PX = CANVAS_BREEDTE_M * PIXELS_PER_METER + OFFSET * 2
const CANVAS_HOOGTE_PX = CANVAS_HOOGTE_M * PIXELS_PER_METER + OFFSET * 2

// Hoofd app content (na login) - kiest tussen desktop en mobile
function AppContent() {
  const { user, logout } = useAuth()
  const { isMobile } = useIsMobile()

  // Plattegrond hook met user-specifieke data
  const {
    items: geplaatsteItems,
    loading: dataLoading,
    error: dataError,
    saveItems,
    layouts,
    activeLayoutId,
    switchLayout,
    createLayout,
    renameLayout,
    duplicateLayout,
    deleteLayout,
    sharedWithMe: _sharedWithMe,          // TODO: Gebruiken in LayoutSelector
    viewingShareId: _viewingShareId,      // TODO: Gebruiken in LayoutSelector
    isViewingShared: _isViewingShared,    // TODO: UI indicator
    viewSharedLayout: _viewSharedLayout,  // TODO: Gebruiken in LayoutSelector
    stopViewingShared: _stopViewingShared,// TODO: Gebruiken in LayoutSelector
    canEdit
  } = usePlattegrond({
    userId: user?.uid ?? null,
    userEmail: user?.email ?? null,
    userName: user?.displayName ?? null
  })

  // Sharing hook voor delen functionaliteit
  const {
    sharing: _sharing,                        // TODO: Loading state voor UI
    error: _shareError,                       // TODO: Error display
    pendingInvites: _pendingInvites,          // TODO: Notificaties
    createShareLink,
    inviteByEmail,
    acceptShareByToken,
    removeUserFromShare: _removeUserFromShare,// TODO: ShareDialog - user management
    revokeShareLink: _revokeShareLink,        // TODO: ShareDialog - link management
    deleteShare: _deleteShare,                // TODO: ShareDialog - delete share
    getShareInfo,
    syncLayoutToShare: _syncLayoutToShare     // TODO: Auto-sync
  } = useSharing({
    userId: user?.uid ?? null,
    userEmail: user?.email ?? null,
    userName: user?.displayName ?? null
  })

  // State voor ShareDialog
  const [shareDialogLayout, setShareDialogLayout] = useState<Layout | null>(null)

  // Check voor share token in URL bij mount
  useEffect(() => {
    const checkShareToken = async () => {
      const path = window.location.pathname
      if (path.startsWith('/share/')) {
        const token = path.replace('/share/', '')
        if (token && user?.uid) {
          const result = await acceptShareByToken(token)
          if (result.success) {
            // Redirect naar home en toon shared layout
            window.history.replaceState({}, '', '/')
            // Layout wordt automatisch getoond via sharedWithMe
          }
        }
      }
    }
    checkShareToken()
  }, [user?.uid, acceptShareByToken])

  // Loading state
  if (dataLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Plattegrond laden...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (dataError) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-slate-800 mb-2">Er ging iets mis</h2>
          <p className="text-slate-600 mb-4">{dataError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Probeer opnieuw
          </button>
        </div>
      </div>
    )
  }

  // Mobile versie
  // TODO: Voeg sharing props toe aan MobileAppContent wanneer ShareDialog klaar is
  if (isMobile) {
    return (
      <MobileAppContent
        user={user}
        logout={logout}
        geplaatsteItems={geplaatsteItems}
        saveItems={canEdit ? saveItems : () => {}} // Alleen opslaan als edit rechten
        layouts={layouts}
        activeLayoutId={activeLayoutId}
        switchLayout={switchLayout}
        createLayout={createLayout}
        renameLayout={renameLayout}
        duplicateLayout={duplicateLayout}
        deleteLayout={deleteLayout}
      />
    )
  }

  // Desktop versie
  return (
    <>
      <DesktopAppContent
        user={user}
        logout={logout}
        geplaatsteItems={geplaatsteItems}
        saveItems={canEdit ? saveItems : () => {}} // Alleen opslaan als edit rechten
        layouts={layouts}
        activeLayoutId={activeLayoutId}
        switchLayout={switchLayout}
        createLayout={createLayout}
        renameLayout={renameLayout}
        duplicateLayout={duplicateLayout}
        deleteLayout={deleteLayout}
        onShareLayout={setShareDialogLayout}
      />

      {/* Share Dialog */}
      <ShareDialog
        isOpen={shareDialogLayout !== null}
        onClose={() => setShareDialogLayout(null)}
        layout={shareDialogLayout}
        createShareLink={createShareLink}
        inviteByEmail={inviteByEmail}
        getShareInfo={getShareInfo}
      />
    </>
  )
}

// Desktop app content
function DesktopAppContent({
  user,
  logout,
  geplaatsteItems,
  saveItems,
  layouts,
  activeLayoutId,
  switchLayout,
  createLayout,
  renameLayout,
  duplicateLayout,
  deleteLayout,
  onShareLayout
}: {
  user: ReturnType<typeof useAuth>['user']
  logout: () => void
  geplaatsteItems: GeplaatstMeubel[]
  saveItems: (items: GeplaatstMeubel[]) => void
  layouts: Layout[]
  activeLayoutId: string
  switchLayout: (id: string) => void
  createLayout: (naam: string) => Promise<string>
  renameLayout: (id: string, naam: string) => Promise<void>
  duplicateLayout: (id: string, naam: string) => Promise<string>
  deleteLayout: (id: string) => Promise<void>
  onShareLayout: (layout: Layout) => void
}) {
  // Ref voor de canvas container om beschikbare ruimte te meten
  const canvasContainerRef = useRef<HTMLDivElement>(null)

  // State voor geselecteerd meubel uit de lijst (om te plaatsen)
  const [tePlaatsenMeubelId, setTePlaatsenMeubelId] = useState<string | null>(null)

  // State voor custom afmetingen van het te plaatsen meubel
  const [customAfmetingen, setCustomAfmetingen] = useState<{ breedte: number; hoogte: number } | null>(null)

  // State voor geselecteerd item op de plattegrond (om te bewerken)
  const [geselecteerdItemId, setGeselecteerdItemId] = useState<string | null>(null)

  // State voor zoom en pan - start met 0.6 als veilige default
  const [zoom, setZoom] = useState<number>(0.6)
  const [zoomInitialized, setZoomInitialized] = useState(false)
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 })

  // State voor lineaal/meet modus
  const [lineaalModus, setLineaalModus] = useState(false)
  const [meetResultaat, setMeetResultaat] = useState<{ afstand: number; van: {x: number, y: number}; naar: {x: number, y: number} } | null>(null)

  // Bereken initiële zoom zodat hele plattegrond past
  useEffect(() => {
    if (zoomInitialized) return // Al geïnitialiseerd

    const calculateInitialZoom = () => {
      if (!canvasContainerRef.current) return false

      const container = canvasContainerRef.current
      const availableWidth = container.clientWidth - 32 // padding
      const availableHeight = container.clientHeight - 32

      // Als container nog geen grootte heeft, probeer later opnieuw
      if (availableWidth <= 0 || availableHeight <= 0) return false

      // Bereken zoom zodat canvas past in beschikbare ruimte
      const zoomX = availableWidth / CANVAS_BREEDTE_PX
      const zoomY = availableHeight / CANVAS_HOOGTE_PX

      // Gebruik kleinste zoom zodat beide dimensies passen, met een kleine marge
      const fitZoom = Math.min(zoomX, zoomY) * 0.95

      // Clamp tussen 0.3 en 1 (nooit groter dan 100% bij start)
      const initialZoom = Math.max(0.3, Math.min(1, fitZoom))

      setZoom(initialZoom)
      setZoomInitialized(true)
      return true
    }

    // Probeer direct
    if (calculateInitialZoom()) return

    // Als dat niet lukt, probeer na requestAnimationFrame
    const frame1 = requestAnimationFrame(() => {
      if (calculateInitialZoom()) return

      // En nog een keer na een korte delay voor extra zekerheid
      const timeout = setTimeout(() => {
        calculateInitialZoom()
      }, 100)

      return () => clearTimeout(timeout)
    })

    return () => cancelAnimationFrame(frame1)
  }, [zoomInitialized])

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
  const handleZoomIn = () => setZoom(z => Math.min(z * 1.2, 3))
  const handleZoomOut = () => setZoom(z => Math.max(z / 1.2, 0.3))
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
        // Sla op naar Firebase
        saveItems([...geplaatsteItems, nieuwItem])
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
    const updatedItems = geplaatsteItems.map(item =>
      item.id === id ? { ...item, x, y } : item
    )
    saveItems(updatedItems)
  }

  // Item verwijderen
  const handleVerwijderen = () => {
    if (geselecteerdItemId) {
      const updatedItems = geplaatsteItems.filter(item => item.id !== geselecteerdItemId)
      saveItems(updatedItems)
      setGeselecteerdItemId(null)
    }
  }

  // Item roteren (90 graden)
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

  // Item roteren naar specifieke hoek (360 graden)
  const handleSetRotatie = (graden: number) => {
    if (geselecteerdItemId) {
      const updatedItems = geplaatsteItems.map(item =>
        item.id === geselecteerdItemId
          ? { ...item, rotatie: graden % 360 }
          : item
      )
      saveItems(updatedItems)
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

    const updatedItems = geplaatsteItems.map(item =>
      item.id === id
        ? { ...item, customBreedte: clampedBreedte, customHoogte: clampedHoogte }
        : item
    )
    saveItems(updatedItems)
  }

  // Alles wissen
  const handleAllesWissen = () => {
    saveItems([])
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
      // Sla op naar Firebase
      saveItems([...geplaatsteItems, nieuwItem])
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
            {/* Sync indicator */}
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Gesynchroniseerd</span>
            </div>

            {/* Layout Selector */}
            <LayoutSelector
              layouts={layouts}
              activeLayoutId={activeLayoutId}
              onSwitch={switchLayout}
              onCreate={createLayout}
              onRename={renameLayout}
              onDuplicate={duplicateLayout}
              onDelete={deleteLayout}
              onShare={onShareLayout}
            />

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

            {/* User info & logout */}
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              {user?.photoURL && (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Gebruiker'}
                  className="w-8 h-8 rounded-full"
                />
              )}
              <div className="text-sm">
                <div className="font-medium text-slate-700">{user?.displayName || 'Gebruiker'}</div>
              </div>
              <button
                onClick={logout}
                className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                title="Uitloggen"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
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
              zoom={zoom}
            />
            </aside>
          </div>
        </div>
      </main>

      {/* Zoom Controls */}
      <ZoomControls
        zoom={zoom}
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

      {/* Versienummer */}
      <div className="fixed bottom-2 left-2 text-xs text-slate-400 z-10">
        v{APP_VERSION}
      </div>
    </div>
  )
}

// Wrapper component met auth check
function AppWithAuth() {
  const { user, loading } = useAuth()

  // Loading state tijdens auth check
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Laden...</p>
        </div>
      </div>
    )
  }

  // Niet ingelogd -> login scherm
  if (!user) {
    return <LoginScherm />
  }

  // Ingelogd -> app content
  return <AppContent />
}

// Root App component met AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppWithAuth />
    </AuthProvider>
  )
}

export default App
