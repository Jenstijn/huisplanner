import { User } from 'firebase/auth'
import { Layout } from '../../types'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  user: User | null
  onLogout: () => void
  layouts: Layout[]
  activeLayoutId: string
  onCreateLayout: (naam: string) => Promise<string>
  onDeleteLayout: (layoutId: string) => Promise<void>
  onDuplicateLayout: (layoutId: string, naam: string) => Promise<string>
  aantalItems: number
  onAllesWissen: () => void
  onShareLayout?: (layout: Layout) => void
  activeLayout?: Layout
  appVersion?: string
  hasNewVersion?: boolean
  onOpenChangelog?: () => void
  onExportPdf?: () => void
  isExporting?: boolean
}

/**
 * Mobile hamburger menu drawer met Liquid Glass design.
 * iOS 26 style - schuift in vanaf rechts met glass effect.
 */
export default function MobileMenu({
  isOpen,
  onClose,
  user,
  onLogout,
  layouts,
  activeLayoutId,
  onCreateLayout,
  onDeleteLayout,
  onDuplicateLayout,
  aantalItems,
  onAllesWissen,
  onShareLayout,
  activeLayout: activeLayoutProp,
  appVersion,
  hasNewVersion,
  onOpenChangelog,
  onExportPdf,
  isExporting
}: MobileMenuProps) {
  const activeLayout = activeLayoutProp || layouts.find(l => l.id === activeLayoutId)

  const handleCreateLayout = async () => {
    const naam = prompt('Naam voor nieuwe layout:')
    if (naam?.trim()) {
      await onCreateLayout(naam.trim())
      onClose()
    }
  }

  const handleDuplicateLayout = async () => {
    if (activeLayout) {
      await onDuplicateLayout(activeLayoutId, `${activeLayout.naam} (kopie)`)
      onClose()
    }
  }

  const handleDeleteLayout = async () => {
    if (layouts.length <= 1) {
      alert('Je kunt de laatste layout niet verwijderen')
      return
    }
    if (confirm(`Weet je zeker dat je "${activeLayout?.naam}" wilt verwijderen?`)) {
      await onDeleteLayout(activeLayoutId)
      onClose()
    }
  }

  const handleAllesWissen = () => {
    if (confirm('Weet je zeker dat je alle meubels wilt verwijderen?')) {
      onAllesWissen()
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop with blur */}
      <div
        className="fixed inset-0 z-50 animate-fade-in"
        onClick={onClose}
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      />

      {/* Menu drawer with glass effect */}
      <div
        className="fixed top-3 right-3 bottom-3 w-[280px] z-50 animate-slide-in-right"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(40px) saturate(1.8)',
          WebkitBackdropFilter: 'blur(40px) saturate(1.8)',
          borderRadius: '24px',
          boxShadow: '0 8px 40px rgba(31, 38, 135, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.4)',
        }}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4">
            <h2 className="text-lg font-semibold text-slate-800">Menu</h2>
            <button
              onClick={onClose}
              className="w-9 h-9 glass-fab flex items-center justify-center transition-all active:scale-90"
            >
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* User info */}
          {user && (
            <div className="px-4 pb-4">
              <div className="glass-subtle p-3 flex items-center gap-3">
                {user.photoURL && (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Gebruiker'}
                    className="w-11 h-11 rounded-full ring-2 ring-white/50"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-800 truncate text-sm">
                    {user.displayName || 'Gebruiker'}
                  </div>
                  <div className="text-xs text-slate-500 truncate">
                    {user.email}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Menu items */}
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {/* Statistieken */}
            <div className="mb-4">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">
                Statistieken
              </div>
              <div className="flex gap-2">
                <div className="flex-1 glass-subtle p-3 text-center">
                  <div className="text-xl font-bold text-blue-600">{aantalItems}</div>
                  <div className="text-xs text-slate-500">Meubels</div>
                </div>
                <div className="flex-1 glass-subtle p-3 text-center">
                  <div className="text-xl font-bold text-emerald-600">{layouts.length}</div>
                  <div className="text-xs text-slate-500">Layouts</div>
                </div>
              </div>
            </div>

            {/* Samenwerken sectie */}
            {onShareLayout && activeLayout && (
              <div className="mb-4">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">
                  Samenwerken
                </div>
                <button
                  onClick={() => {
                    onShareLayout(activeLayout)
                    onClose()
                  }}
                  className="w-full glass-button flex items-center gap-3 px-3 py-2.5 text-left"
                >
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <span className="text-sm text-slate-700 font-medium">Deel deze layout</span>
                    <p className="text-xs text-slate-500">Werk samen via link of e-mail</p>
                  </div>
                </button>

                {/* PDF Export knop */}
                {onExportPdf && (
                  <button
                    onClick={() => {
                      onExportPdf()
                      onClose()
                    }}
                    disabled={isExporting}
                    className="w-full glass-button flex items-center gap-3 px-3 py-2.5 text-left disabled:opacity-50 mt-1"
                  >
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/30">
                      {isExporting ? (
                        <svg className="w-4 h-4 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <span className="text-sm text-slate-700 font-medium">
                        {isExporting ? 'Exporteren...' : 'Exporteer als PDF'}
                      </span>
                      <p className="text-xs text-slate-500">Download je plattegrond</p>
                    </div>
                  </button>
                )}
              </div>
            )}

            {/* Layout acties */}
            <div className="mb-4">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">
                Layout Acties
              </div>
              <div className="space-y-1">
                <button
                  onClick={handleCreateLayout}
                  className="w-full glass-button flex items-center gap-3 px-3 py-2.5 text-left"
                >
                  <div className="w-8 h-8 glass-fab flex items-center justify-center">
                    <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <span className="text-sm text-slate-700">Nieuwe layout</span>
                </button>

                <button
                  onClick={handleDuplicateLayout}
                  className="w-full glass-button flex items-center gap-3 px-3 py-2.5 text-left"
                >
                  <div className="w-8 h-8 glass-fab flex items-center justify-center">
                    <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-sm text-slate-700">Dupliceer layout</span>
                </button>

                {layouts.length > 1 && (
                  <button
                    onClick={handleDeleteLayout}
                    className="w-full glass-button flex items-center gap-3 px-3 py-2.5 text-left hover:!bg-red-500/10"
                  >
                    <div className="w-8 h-8 glass-fab flex items-center justify-center">
                      <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </div>
                    <span className="text-sm text-red-600">Verwijder layout</span>
                  </button>
                )}
              </div>
            </div>

            {/* Gevaarlijke acties */}
            {aantalItems > 0 && (
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">
                  Plattegrond
                </div>
                <button
                  onClick={handleAllesWissen}
                  className="w-full glass-button flex items-center gap-3 px-3 py-2.5 text-left hover:!bg-red-500/10"
                >
                  <div className="w-8 h-8 glass-fab flex items-center justify-center">
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                  <span className="text-sm text-red-600">Wis alle meubels</span>
                </button>
              </div>
            )}
          </div>

          {/* Footer met versie en logout */}
          <div className="p-4 space-y-3">
            {/* Wat is nieuw knop */}
            {onOpenChangelog && (
              <button
                onClick={() => {
                  onOpenChangelog()
                  onClose()
                }}
                className="w-full glass-button flex items-center gap-3 px-3 py-2.5 text-left"
              >
                <div className="relative w-8 h-8 glass-fab flex items-center justify-center">
                  {hasNewVersion && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full" />
                  )}
                  <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-sm text-slate-700">Wat is nieuw?</span>
              </button>
            )}

            {/* Logout knop */}
            <button
              onClick={onLogout}
              className="w-full glass-button flex items-center justify-center gap-2 px-4 py-3"
            >
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="text-sm font-medium text-slate-700">Uitloggen</span>
            </button>

            {/* Versienummer */}
            {appVersion && (
              <div className="text-center text-xs text-slate-400 pt-2">
                Huisplanner v{appVersion}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Animation styles */}
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </>
  )
}
