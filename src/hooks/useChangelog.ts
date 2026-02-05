import { useState, useEffect, useCallback } from 'react'
import { getLatestVersion } from '../data/changelog'

const STORAGE_KEY = 'huisplanner_lastSeenVersion'

/**
 * Hook voor changelog state management.
 * Tracked welke versie de gebruiker al heeft gezien en toont
 * automatisch de changelog bij een nieuwe versie.
 */
export function useChangelog(currentVersion: string) {
  const [showChangelog, setShowChangelog] = useState(false)
  const [hasNewVersion, setHasNewVersion] = useState(false)

  // Check bij mount of er een nieuwe versie is
  useEffect(() => {
    const lastSeenVersion = localStorage.getItem(STORAGE_KEY)

    if (lastSeenVersion !== currentVersion) {
      setHasNewVersion(true)
      // Toon changelog altijd bij nieuwe versie (ook bij eerste bezoek)
      setShowChangelog(true)
    }
  }, [currentVersion])

  // Markeer huidige versie als gezien
  const markAsSeen = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, currentVersion)
    setHasNewVersion(false)
  }, [currentVersion])

  // Open changelog en markeer als gezien
  const openChangelog = useCallback(() => {
    setShowChangelog(true)
  }, [])

  // Sluit changelog en markeer als gezien
  const closeChangelog = useCallback(() => {
    setShowChangelog(false)
    markAsSeen()
  }, [markAsSeen])

  return {
    showChangelog,
    hasNewVersion,
    openChangelog,
    closeChangelog,
    markAsSeen,
    latestVersion: getLatestVersion()
  }
}
