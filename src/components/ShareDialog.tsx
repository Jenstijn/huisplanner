import { useState, useEffect } from 'react'
import { Layout, SharePermission, Share } from '../types'

interface ShareDialogProps {
  isOpen: boolean
  onClose: () => void
  layout: Layout | null
  createShareLink: (layout: Layout, permission?: SharePermission) => Promise<string | null>
  inviteByEmail: (layout: Layout, email: string, permission?: SharePermission) => Promise<boolean>
  getShareInfo: (layoutId: string) => Promise<Share | null>
}

/**
 * ShareDialog - Modal voor het delen van een layout
 * iOS 26 Liquid Glass design
 */
export default function ShareDialog({
  isOpen,
  onClose,
  layout,
  createShareLink,
  inviteByEmail,
  getShareInfo
}: ShareDialogProps) {
  // Tab state
  const [activeTab, setActiveTab] = useState<'link' | 'email'>('link')

  // Form state
  const [permission, setPermission] = useState<SharePermission>('view')
  const [email, setEmail] = useState('')
  const [shareLink, setShareLink] = useState<string | null>(null)
  const [_shareInfo, setShareInfo] = useState<Share | null>(null) // TODO: Toon huidige deelnemers

  // Loading/status state
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reset state wanneer dialog opent
  useEffect(() => {
    if (isOpen && layout) {
      setShareLink(null)
      setCopied(false)
      setEmailSent(false)
      setError(null)
      setEmail('')

      // Laad bestaande share info
      const loadShareInfo = async () => {
        const info = await getShareInfo(layout.id)
        setShareInfo(info)
        if (info?.shareLink) {
          setShareLink(`${window.location.origin}/share/${info.shareLink}`)
        }
      }
      loadShareInfo()
    }
  }, [isOpen, layout, getShareInfo])

  // Genereer deellink
  const handleCreateLink = async () => {
    if (!layout) return

    setLoading(true)
    setError(null)

    try {
      const link = await createShareLink(layout, permission)
      if (link) {
        setShareLink(link)
      } else {
        setError('Kon geen deellink maken')
      }
    } catch (err) {
      setError('Er ging iets mis')
    } finally {
      setLoading(false)
    }
  }

  // Kopieer link naar klembord
  const handleCopyLink = async () => {
    if (!shareLink) return

    try {
      await navigator.clipboard.writeText(shareLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      // Fallback voor oudere browsers
      const textArea = document.createElement('textarea')
      textArea.value = shareLink
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Deel via WhatsApp
  const handleShareWhatsApp = () => {
    if (!shareLink || !layout) return
    const text = `Bekijk mijn plattegrond "${layout.naam}": ${shareLink}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  // Stuur e-mail uitnodiging
  const handleSendEmail = async () => {
    if (!layout || !email.trim()) return

    // Valideer e-mail
    if (!email.includes('@') || !email.includes('.')) {
      setError('Voer een geldig e-mailadres in')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const success = await inviteByEmail(layout, email, permission)
      if (success) {
        setEmailSent(true)
        setEmail('')
        setTimeout(() => setEmailSent(false), 3000)
      } else {
        setError('Kon uitnodiging niet versturen')
      }
    } catch (err) {
      setError('Er ging iets mis')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !layout) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 animate-fade-in"
        onClick={onClose}
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      />

      {/* Dialog */}
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-md animate-scale-in"
        style={{
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(40px) saturate(1.8)',
          WebkitBackdropFilter: 'blur(40px) saturate(1.8)',
          borderRadius: '28px',
          boxShadow: '0 12px 48px rgba(31, 38, 135, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.4)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200/50">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Layout delen</h2>
            <p className="text-sm text-slate-500 truncate max-w-[200px]">{layout.naam}</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 glass-fab flex items-center justify-center transition-all active:scale-90"
            aria-label="Sluiten"
          >
            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex p-2 mx-4 mt-4 glass-subtle rounded-2xl">
          <button
            onClick={() => setActiveTab('link')}
            className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'link'
                ? 'bg-white shadow-sm text-blue-600'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Deellink
            </span>
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'email'
                ? 'bg-white shadow-sm text-blue-600'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              E-mail
            </span>
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Permission selector */}
          <div className="mb-4">
            <label className="text-sm font-medium text-slate-700 mb-2 block">Rechten</label>
            <div className="flex gap-2">
              <button
                onClick={() => setPermission('view')}
                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${
                  permission === 'view'
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                    : 'glass-subtle text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Bekijken
                </span>
              </button>
              <button
                onClick={() => setPermission('edit')}
                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${
                  permission === 'edit'
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                    : 'glass-subtle text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Bewerken
                </span>
              </button>
            </div>
          </div>

          {/* Link tab content */}
          {activeTab === 'link' && (
            <div className="space-y-4">
              {shareLink ? (
                <>
                  {/* Link display */}
                  <div className="glass-subtle p-3 rounded-xl">
                    <p className="text-xs text-slate-500 mb-1">Deellink</p>
                    <p className="text-sm text-slate-700 truncate font-mono">{shareLink}</p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopyLink}
                      className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                        copied
                          ? 'bg-green-500 text-white'
                          : 'glass-button text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {copied ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Gekopieerd!
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Kopiëren
                        </span>
                      )}
                    </button>
                    <button
                      onClick={handleShareWhatsApp}
                      className="flex-1 py-3 rounded-xl text-sm font-medium bg-green-500 text-white hover:bg-green-600 transition-all"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        WhatsApp
                      </span>
                    </button>
                  </div>
                </>
              ) : (
                <button
                  onClick={handleCreateLink}
                  disabled={loading}
                  className="w-full py-3 rounded-xl text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Bezig...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      Genereer deellink
                    </span>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Email tab content */}
          {activeTab === 'email' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">E-mailadres</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="naam@voorbeeld.nl"
                  className="w-full px-4 py-3 rounded-xl glass-subtle text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <button
                onClick={handleSendEmail}
                disabled={loading || !email.trim()}
                className="w-full py-3 rounded-xl text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Bezig...
                  </span>
                ) : emailSent ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Uitnodiging verstuurd!
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Uitnodiging sturen
                  </span>
                )}
              </button>

              <p className="text-xs text-slate-500 text-center">
                De persoon krijgt automatisch toegang zodra ze inloggen met dit e-mailadres.
              </p>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200">
              <p className="text-sm text-red-600 text-center">{error}</p>
            </div>
          )}
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
