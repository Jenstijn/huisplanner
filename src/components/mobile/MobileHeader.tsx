import { User } from 'firebase/auth'
import { Layout } from '../../types'

interface MobileHeaderProps {
  user: User | null
  layouts: Layout[]
  activeLayoutId: string
  onLayoutSwitch: (layoutId: string) => void
  onMenuOpen: () => void
  isSynced?: boolean
}

export default function MobileHeader({
  layouts,
  activeLayoutId,
  onLayoutSwitch,
  onMenuOpen,
  isSynced = true
}: MobileHeaderProps) {
  return (
    <header className="mx-3 mt-3 safe-area-top">
      <div className="glass h-14 flex items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 glass-fab-primary flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          {/* Sync indicator */}
          {isSynced && (
            <div className="w-2 h-2 bg-emerald-400 rounded-full shadow-lg shadow-emerald-400/50" title="Gesynchroniseerd" />
          )}
        </div>

        {/* Layout selector - glass dropdown */}
        <div className="flex-1 mx-3">
          <div className="relative">
            <select
              value={activeLayoutId}
              onChange={(e) => onLayoutSwitch(e.target.value)}
              className="w-full px-4 py-2 text-sm font-medium text-slate-700 glass-subtle rounded-glass-sm focus:outline-none focus:ring-2 focus:ring-white/30 appearance-none cursor-pointer bg-transparent"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.75rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.25em 1.25em',
                paddingRight: '2.5rem'
              }}
            >
              {layouts.map(layout => (
                <option key={layout.id} value={layout.id}>
                  {layout.naam} ({layout.items.length})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Hamburger menu button */}
        <button
          onClick={onMenuOpen}
          className="w-10 h-10 glass-fab flex items-center justify-center transition-all active:scale-95"
          aria-label="Menu openen"
        >
          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </header>
  )
}
