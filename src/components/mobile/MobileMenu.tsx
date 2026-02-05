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
}

/**
 * Mobile hamburger menu drawer.
 * Schuift in vanaf rechts met overlay.
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
  onAllesWissen
}: MobileMenuProps) {
  const activeLayout = layouts.find(l => l.id === activeLayoutId)

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
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Menu drawer */}
      <div className="fixed top-0 right-0 bottom-0 w-72 bg-white z-50 shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">Menu</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 active:bg-slate-200"
          >
            <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* User info */}
        {user && (
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              {user.photoURL && (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Gebruiker'}
                  className="w-12 h-12 rounded-full"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-slate-800 truncate">
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
        <div className="flex-1 overflow-y-auto py-2">
          {/* Statistieken */}
          <div className="px-4 py-3">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Statistieken
            </div>
            <div className="flex gap-3">
              <div className="flex-1 p-3 bg-blue-50 rounded-xl text-center">
                <div className="text-xl font-bold text-blue-600">{aantalItems}</div>
                <div className="text-xs text-blue-600/70">Meubels</div>
              </div>
              <div className="flex-1 p-3 bg-green-50 rounded-xl text-center">
                <div className="text-xl font-bold text-green-600">{layouts.length}</div>
                <div className="text-xs text-green-600/70">Layouts</div>
              </div>
            </div>
          </div>

          {/* Layout acties */}
          <div className="px-4 py-3">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Layout Acties
            </div>
            <div className="space-y-1">
              <button
                onClick={handleCreateLayout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 active:bg-slate-100 text-left"
              >
                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-sm text-slate-700">Nieuwe layout</span>
              </button>

              <button
                onClick={handleDuplicateLayout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 active:bg-slate-100 text-left"
              >
                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span className="text-sm text-slate-700">Dupliceer huidige layout</span>
              </button>

              {layouts.length > 1 && (
                <button
                  onClick={handleDeleteLayout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-50 active:bg-red-100 text-left"
                >
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span className="text-sm text-red-600">Verwijder layout</span>
                </button>
              )}
            </div>
          </div>

          {/* Gevaarlijke acties */}
          {aantalItems > 0 && (
            <div className="px-4 py-3">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Plattegrond
              </div>
              <button
                onClick={handleAllesWissen}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-50 active:bg-red-100 text-left"
              >
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span className="text-sm text-red-600">Wis alle meubels</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer met logout */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-xl transition-colors"
          >
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="text-sm font-medium text-slate-700">Uitloggen</span>
          </button>
        </div>
      </div>

      {/* Animation styles */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.3s ease-out;
        }
      `}</style>
    </>
  )
}
