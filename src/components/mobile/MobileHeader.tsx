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
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-3 safe-area-top">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/20">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </div>
        {/* Sync indicator */}
        {isSynced && (
          <div className="w-2 h-2 bg-green-500 rounded-full" title="Gesynchroniseerd"></div>
        )}
      </div>

      {/* Layout selector - compact dropdown */}
      <div className="flex-1 mx-3">
        <select
          value={activeLayoutId}
          onChange={(e) => onLayoutSwitch(e.target.value)}
          className="w-full px-3 py-2 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
            backgroundPosition: 'right 0.5rem center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '1.5em 1.5em',
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

      {/* Hamburger menu button */}
      <button
        onClick={onMenuOpen}
        className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 active:bg-slate-200 transition-colors"
        aria-label="Menu openen"
      >
        <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </header>
  )
}
