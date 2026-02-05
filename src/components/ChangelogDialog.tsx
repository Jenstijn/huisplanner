import { changelog, ChangeType, Release } from '../data/changelog'

interface ChangelogDialogProps {
  isOpen: boolean
  onClose: () => void
  currentVersion: string
}

// Icoon per type wijziging
const TypeIcon = ({ type }: { type: ChangeType }) => {
  switch (type) {
    case 'feature':
      return (
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-600 text-xs">
          ✨
        </span>
      )
    case 'fix':
      return (
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-orange-100 text-orange-600 text-xs">
          🔧
        </span>
      )
    case 'improvement':
      return (
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs">
          💡
        </span>
      )
  }
}

// Render een enkele release
const ReleaseCard = ({ release, isLatest }: { release: Release; isLatest: boolean }) => (
  <div className={`mb-4 ${isLatest ? '' : 'opacity-80'}`}>
    <div className="flex items-center gap-2 mb-2">
      <span className={`text-sm font-bold ${isLatest ? 'text-blue-600' : 'text-slate-700'}`}>
        v{release.version}
      </span>
      {isLatest && (
        <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
          Nieuw
        </span>
      )}
      <span className="text-xs text-slate-400">{release.date}</span>
    </div>
    <h4 className="text-sm font-semibold text-slate-800 mb-2">{release.title}</h4>
    <ul className="space-y-1.5">
      {release.entries.map((entry, idx) => (
        <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
          <TypeIcon type={entry.type} />
          <span>{entry.description}</span>
        </li>
      ))}
    </ul>
  </div>
)

export default function ChangelogDialog({ isOpen, onClose, currentVersion }: ChangelogDialogProps) {
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 animate-fade-in"
        onClick={onClose}
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      />

      {/* Dialog */}
      <div
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90vw] max-w-md max-h-[80vh] animate-scale-in"
        style={{
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(40px) saturate(1.8)',
          WebkitBackdropFilter: 'blur(40px) saturate(1.8)',
          borderRadius: '24px',
          boxShadow: '0 8px 40px rgba(31, 38, 135, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.4)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200/50">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Wat is nieuw?</h2>
            <p className="text-xs text-slate-500">Huisplanner v{currentVersion}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content - scrollable */}
        <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 120px)' }}>
          {changelog.map((release, idx) => (
            <ReleaseCard key={release.version} release={release} isLatest={idx === 0} />
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200/50">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition-colors"
          >
            Sluiten
          </button>
        </div>
      </div>

      {/* Animation styles */}
      <style>{`
        @keyframes scaleIn {
          from {
            transform: translate(-50%, -50%) scale(0.95);
            opacity: 0;
          }
          to {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
        }
        .animate-scale-in {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </>
  )
}
