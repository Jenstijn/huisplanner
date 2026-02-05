import { useState, useRef, useEffect, ReactNode } from 'react'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  /** Hoogte als percentage van scherm (0-1). Default 0.6 = 60% */
  height?: number
  /** Of de sheet volledig gesloten kan worden door naar beneden te swipen */
  canDismiss?: boolean
}

/**
 * Swipeable bottom sheet component met Liquid Glass design.
 * iOS 26 style met glassmorphism effect en smooth animaties.
 */
export default function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  height = 0.6,
  canDismiss = true
}: BottomSheetProps) {
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isAnimatingIn, setIsAnimatingIn] = useState(false)
  const sheetRef = useRef<HTMLDivElement>(null)
  const startYRef = useRef(0)
  const currentYRef = useRef(0)

  // Reset drag offset wanneer sheet opent/sluit
  useEffect(() => {
    if (isOpen) {
      setDragOffset(0)
      // Trigger entrance animation
      requestAnimationFrame(() => {
        setIsAnimatingIn(true)
      })
    } else {
      setIsAnimatingIn(false)
    }
  }, [isOpen])

  // Prevent body scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleTouchStart = (e: React.TouchEvent) => {
    // Alleen drag starten als we op de handle of header klikken
    const target = e.target as HTMLElement
    if (!target.closest('.sheet-handle') && !target.closest('.sheet-header')) {
      return
    }

    setIsDragging(true)
    startYRef.current = e.touches[0].clientY
    currentYRef.current = e.touches[0].clientY
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return

    currentYRef.current = e.touches[0].clientY
    const diff = currentYRef.current - startYRef.current

    // Alleen naar beneden swipen toestaan (positieve diff)
    if (diff > 0) {
      setDragOffset(diff)
    }
  }

  const handleTouchEnd = () => {
    if (!isDragging) return

    setIsDragging(false)

    // Als meer dan 100px naar beneden geswiped, sluit de sheet
    if (dragOffset > 100 && canDismiss) {
      onClose()
    }

    // Reset offset met animatie
    setDragOffset(0)
  }

  // Bereken sheet hoogte in pixels
  const sheetHeight = typeof window !== 'undefined' ? window.innerHeight * height : 400

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop with blur */}
      <div
        className="fixed inset-0 z-40 transition-all duration-300"
        onClick={canDismiss ? onClose : undefined}
        style={{
          backgroundColor: `rgba(0, 0, 0, ${Math.max(0, 0.25 - dragOffset / 800)})`,
          backdropFilter: `blur(${Math.max(0, 8 - dragOffset / 25)}px)`,
          WebkitBackdropFilter: `blur(${Math.max(0, 8 - dragOffset / 25)}px)`,
          opacity: isAnimatingIn ? 1 : 0,
        }}
      />

      {/* Sheet with glass effect */}
      <div
        ref={sheetRef}
        className={`fixed bottom-0 left-0 right-0 z-50 ${
          isDragging ? '' : 'transition-transform duration-300 ease-out'
        }`}
        style={{
          height: sheetHeight,
          transform: `translateY(${isAnimatingIn ? dragOffset : sheetHeight}px)`,
          maxHeight: '85vh'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Glass container */}
        <div className="h-full rounded-t-[28px] overflow-hidden"
          style={{
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(40px) saturate(1.8)',
            WebkitBackdropFilter: 'blur(40px) saturate(1.8)',
            boxShadow: '0 -8px 40px rgba(31, 38, 135, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
            borderTop: '1px solid rgba(255, 255, 255, 0.5)',
          }}
        >
          {/* Drag handle */}
          <div className="sheet-handle flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
            <div className="w-10 h-1 bg-slate-400/50 rounded-full" />
          </div>

          {/* Header */}
          {title && (
            <div className="sheet-header flex items-center justify-between px-5 pb-3">
              <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
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
          )}

          {/* Content */}
          <div
            className="overflow-y-auto overscroll-contain px-1"
            style={{ height: title ? 'calc(100% - 60px)' : 'calc(100% - 24px)' }}
          >
            {children}
          </div>
        </div>
      </div>
    </>
  )
}
