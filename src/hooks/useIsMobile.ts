import { useState, useEffect } from 'react'

/**
 * Eenvoudige debounce helper
 */
function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), wait)
  }
}

/**
 * Hook om te detecteren of de gebruiker op een mobiel apparaat zit.
 * Checkt op:
 * - Schermbreedte < 768px
 * - Touch ondersteuning
 *
 * Returns ook orientation voor landscape/portrait detectie.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  const [isLandscape, setIsLandscape] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      // Check voor touch device OF smalle viewport
      const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      const isNarrowScreen = window.innerWidth < 768

      setIsMobile(isNarrowScreen || (hasTouchScreen && window.innerWidth < 1024))
      setIsLandscape(window.innerWidth > window.innerHeight)
    }

    // Debounced versie voor resize events (voorkomt performance issues)
    const debouncedCheckMobile = debounce(checkMobile, 150)

    // Initial check (direct, niet gedebounced)
    checkMobile()

    // Luister naar resize events (gedebounced)
    window.addEventListener('resize', debouncedCheckMobile)

    // Luister naar orientation changes (direct, want die happen niet vaak)
    window.addEventListener('orientationchange', checkMobile)

    return () => {
      window.removeEventListener('resize', debouncedCheckMobile)
      window.removeEventListener('orientationchange', checkMobile)
    }
  }, [])

  return { isMobile, isLandscape }
}

/**
 * Hook om te detecteren of touch events beschikbaar zijn.
 * Handig voor het kiezen tussen drag-and-drop vs tap-to-place.
 */
export function useHasTouch() {
  const [hasTouch, setHasTouch] = useState(false)

  useEffect(() => {
    setHasTouch('ontouchstart' in window || navigator.maxTouchPoints > 0)
  }, [])

  return hasTouch
}
