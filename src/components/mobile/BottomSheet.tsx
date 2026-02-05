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
 * Swipeable bottom sheet component voor mobile.
 * Ondersteunt drag-to-close en smooth animaties.
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
  const sheetRef = useRef<HTMLDivElement>(null)
  const startYRef = useRef(0)
  const currentYRef = useRef(0)

  // Reset drag offset wanneer sheet opent/sluit
  useEffect(() => {
    if (isOpen) {
      setDragOffset(0)
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
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 transition-opacity duration-300"
        onClick={canDismiss ? onClose : undefined}
        style={{ opacity: Math.max(0, 1 - dragOffset / 200) }}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 shadow-2xl ${
          isDragging ? '' : 'transition-transform duration-300 ease-out'
        }`}
        style={{
          height: sheetHeight,
          transform: `translateY(${dragOffset}px)`,
          maxHeight: '85vh'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag handle */}
        <div className="sheet-handle flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
          <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
        </div>

        {/* Header */}
        {title && (
          <div className="sheet-header flex items-center justify-between px-4 pb-3 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 active:bg-slate-200"
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
          className="overflow-y-auto overscroll-contain"
          style={{ height: title ? 'calc(100% - 60px)' : 'calc(100% - 24px)' }}
        >
          {children}
        </div>
      </div>
    </>
  )
}
