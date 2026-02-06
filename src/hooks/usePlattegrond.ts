import { useState, useEffect, useCallback, useRef } from 'react'
import { doc, onSnapshot, setDoc, getDoc, serverTimestamp, collection, query, where } from 'firebase/firestore'
import { db } from '../firebase/config'
import { GeplaatstMeubel, Layout, Share, SharedLayoutInfo } from '../types'

// Legacy ID voor migratie
const LEGACY_PLATTEGROND_ID = 'gedeeld'

// Genereer een unieke ID
const generateId = () => Math.random().toString(36).substring(2, 15)

interface UsePlattegrondOptions {
  userId: string | null
  userEmail?: string | null  // Niet gebruikt in hook, maar beschikbaar voor context
  userName?: string | null   // Niet gebruikt in hook, maar beschikbaar voor context
}

export function usePlattegrond({ userId }: UsePlattegrondOptions) {
  // Eigen layouts state
  const [layouts, setLayouts] = useState<Layout[]>([])
  const [activeLayoutId, setActiveLayoutId] = useState<string>('')

  // Gedeelde layouts state (intern Share[], geëxporteerd als SharedLayoutInfo[])
  const [sharedWithMeRaw, setSharedWithMeRaw] = useState<Share[]>([])
  const [viewingShareId, setViewingShareId] = useState<string | null>(null)

  // Loading en error state
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [migrating, setMigrating] = useState(false)

  // Ref om te tracken of component gemount is (voorkomt memory leaks)
  const mountedRef = useRef(true)

  // Bereken document path voor user
  const getUserDocPath = useCallback(() => {
    if (!userId) return null
    return `users/${userId}/plattegronden/data`
  }, [userId])

  // Transformeer Share[] naar SharedLayoutInfo[] voor export
  const sharedWithMe: SharedLayoutInfo[] = sharedWithMeRaw.map(share => ({
    shareId: share.id,
    layout: share.layoutSnapshot,
    ownerName: share.ownerName || 'Onbekend',
    ownerEmail: share.ownerEmail || '',
    permission: share.permission,
    isOwner: share.ownerId === userId
  }))

  // De actieve layout (eigen of gedeeld)
  const activeLayout = viewingShareId
    ? sharedWithMeRaw.find(s => s.id === viewingShareId)?.layoutSnapshot || null
    : layouts.find(l => l.id === activeLayoutId) || null

  const items = activeLayout?.items || []

  // Helper: migreer legacy data naar user-specifieke data
  const migrateFromLegacy = useCallback(async () => {
    if (!userId) return

    setMigrating(true)
    try {
      // Check of legacy data bestaat
      const legacyDocRef = doc(db, 'plattegronden', LEGACY_PLATTEGROND_ID)
      const legacyDoc = await getDoc(legacyDocRef)

      const userDocRef = doc(db, getUserDocPath()!)

      if (legacyDoc.exists()) {
        const legacyData = legacyDoc.data()

        // Kopieer legacy data naar user's eigen document
        if (legacyData.layouts) {
          await setDoc(userDocRef, {
            layouts: legacyData.layouts,
            activeLayoutId: legacyData.activeLayoutId,
            migratedFrom: 'legacy',
            migratedAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          })
          console.log('✅ Data gemigreerd van legacy naar per-user storage')
        }
      } else {
        // Geen legacy data - maak nieuwe user aan met lege layout
        const newLayoutId = generateId()
        const newLayout: Layout = {
          id: newLayoutId,
          naam: 'Mijn Layout',
          items: [],
          createdAt: new Date(),
          updatedAt: new Date()
        }

        await setDoc(userDocRef, {
          layouts: { [newLayoutId]: newLayout },
          activeLayoutId: newLayoutId,
          updatedAt: serverTimestamp()
        })
        console.log('✅ Nieuwe user aangemaakt met lege layout')
      }
    } catch (err) {
      console.error('Migratie fout:', err)
      setError('Fout bij migreren van data')
    } finally {
      setMigrating(false)
    }
  }, [userId, getUserDocPath])

  // ========================================
  // EFFECT: Luister naar eigen layouts
  // ========================================
  useEffect(() => {
    // Reset mounted ref bij elke effect run
    mountedRef.current = true

    if (!userId) {
      setLoading(false)
      setLayouts([])
      return
    }

    const docPath = getUserDocPath()
    if (!docPath) return

    const docRef = doc(db, docPath)

    const unsubscribe = onSnapshot(
      docRef,
      async (snapshot) => {
        // Check of component nog gemount is voor elke async operatie
        if (!mountedRef.current) return

        if (snapshot.exists()) {
          const data = snapshot.data()

          if (data.layouts && data.activeLayoutId) {
            // User heeft al data
            const layoutsArray = Object.values(data.layouts) as Layout[]
            if (mountedRef.current) {
              setLayouts(layoutsArray)
              setActiveLayoutId(data.activeLayoutId)
            }
          } else {
            // Document bestaat maar heeft geen layouts - maak eerste
            const newLayoutId = generateId()
            const newLayout: Layout = {
              id: newLayoutId,
              naam: 'Mijn Layout',
              items: [],
              createdAt: new Date(),
              updatedAt: new Date()
            }

            try {
              await setDoc(docRef, {
                layouts: { [newLayoutId]: newLayout },
                activeLayoutId: newLayoutId,
                updatedAt: serverTimestamp()
              })

              if (mountedRef.current) {
                setLayouts([newLayout])
                setActiveLayoutId(newLayoutId)
              }
            } catch (err) {
              if (mountedRef.current) {
                console.error('Error creating initial layout:', err)
              }
            }
          }
          if (mountedRef.current) {
            setLoading(false)
          }
        } else {
          // Document bestaat niet - migreer of maak nieuw
          try {
            await migrateFromLegacy()
          } catch (err) {
            if (mountedRef.current) {
              console.error('Migration error:', err)
            }
          }
          // Listener zal opnieuw triggeren na migratie
        }
      },
      (err) => {
        console.error('Firestore error:', err)
        if (mountedRef.current) {
          setError(err.message)
          setLoading(false)
        }
      }
    )

    return () => {
      mountedRef.current = false
      unsubscribe()
    }
  }, [userId, getUserDocPath, migrateFromLegacy])

  // ========================================
  // EFFECT: Luister naar gedeelde layouts
  // ========================================
  useEffect(() => {
    if (!userId) {
      setSharedWithMeRaw([])
      return
    }

    // Query alle shares waar deze user in sharedWith zit
    const sharesQuery = query(
      collection(db, 'shares'),
      where('sharedWith', 'array-contains', userId)
    )

    const unsubscribe = onSnapshot(
      sharesQuery,
      (snapshot) => {
        const shares: Share[] = []
        snapshot.forEach((doc) => {
          const data = doc.data()
          shares.push({
            id: doc.id,
            ownerId: data.ownerId,
            ownerEmail: data.ownerEmail,
            ownerName: data.ownerName,
            layoutId: data.layoutId,
            layoutNaam: data.layoutNaam,
            layoutSnapshot: data.layoutSnapshot,
            permission: data.permission,
            sharedWith: data.sharedWith || [],
            shareLink: data.shareLink,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date()
          })
        })
        setSharedWithMeRaw(shares)
      },
      (err) => {
        console.error('Shares listener error:', err)
      }
    )

    return unsubscribe
  }, [userId])

  // ========================================
  // ACTIONS: Eigen layouts
  // ========================================

  // State voor save status feedback
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'error' | 'retrying'>('idle')
  const [saveRetryCount, setSaveRetryCount] = useState(0)
  const MAX_RETRIES = 3

  // Helper: Exponential backoff delay
  const getRetryDelay = (attempt: number) => Math.min(1000 * Math.pow(2, attempt), 10000)

  // Opslaan van items naar de actieve layout met retry logica
  const saveItems = useCallback(async (newItems: GeplaatstMeubel[]) => {
    if (!userId) return

    const attemptSave = async (attempt: number): Promise<boolean> => {
      try {
        if (viewingShareId) {
          // Opslaan naar gedeelde layout
          const share = sharedWithMeRaw.find(s => s.id === viewingShareId)
          if (!share || share.permission !== 'edit') {
            setError('Geen bewerkrechten voor deze layout')
            return false
          }

          const shareRef = doc(db, 'shares', viewingShareId)
          await setDoc(shareRef, {
            ...share,
            layoutSnapshot: {
              ...share.layoutSnapshot,
              items: newItems,
              updatedAt: new Date()
            },
            updatedAt: serverTimestamp()
          }, { merge: true })
        } else {
          // Opslaan naar eigen layout
          if (!activeLayoutId) return false

          const docRef = doc(db, getUserDocPath()!)

          const updatedLayout: Layout = {
            ...activeLayout!,
            items: newItems,
            updatedAt: new Date()
          }

          const layoutsObj: Record<string, Layout> = {}
          layouts.forEach(l => {
            if (l.id === activeLayoutId) {
              layoutsObj[l.id] = updatedLayout
            } else {
              layoutsObj[l.id] = l
            }
          })

          await setDoc(docRef, {
            layouts: layoutsObj,
            activeLayoutId,
            updatedAt: serverTimestamp()
          })
        }
        return true
      } catch (err) {
        console.error(`Save attempt ${attempt + 1} failed:`, err)
        return false
      }
    }

    // Start save met retry logica
    setSaveStatus('saving')
    setError(null)

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      if (attempt > 0) {
        setSaveStatus('retrying')
        setSaveRetryCount(attempt)
        const delay = getRetryDelay(attempt)
        console.log(`Retrying save in ${delay}ms (attempt ${attempt + 1}/${MAX_RETRIES + 1})`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }

      const success = await attemptSave(attempt)
      if (success) {
        setSaveStatus('idle')
        setSaveRetryCount(0)
        return
      }
    }

    // Alle retries gefaald
    setSaveStatus('error')
    setError('Opslaan mislukt na meerdere pogingen. Controleer je internetverbinding.')
    console.error('All save attempts failed')
  }, [userId, activeLayoutId, activeLayout, layouts, viewingShareId, sharedWithMeRaw, getUserDocPath])

  // Wissel naar een andere eigen layout
  const switchLayout = useCallback(async (layoutId: string) => {
    if (!userId) return

    // Stop met bekijken van gedeelde layout
    setViewingShareId(null)

    try {
      const docRef = doc(db, getUserDocPath()!)

      const layoutsObj: Record<string, Layout> = {}
      layouts.forEach(l => {
        layoutsObj[l.id] = l
      })

      await setDoc(docRef, {
        layouts: layoutsObj,
        activeLayoutId: layoutId,
        updatedAt: serverTimestamp()
      })
    } catch (err) {
      console.error('Fout bij wisselen layout:', err)
      setError(err instanceof Error ? err.message : 'Onbekende fout bij wisselen')
    }
  }, [userId, layouts, getUserDocPath])

  // Bekijk een gedeelde layout
  const viewSharedLayout = useCallback((shareId: string) => {
    setViewingShareId(shareId)
  }, [])

  // Stop met bekijken van gedeelde layout
  const stopViewingShared = useCallback(() => {
    setViewingShareId(null)
  }, [])

  // Maak een nieuwe layout
  const createLayout = useCallback(async (naam: string): Promise<string> => {
    if (!userId) return ''

    const newLayoutId = generateId()
    const newLayout: Layout = {
      id: newLayoutId,
      naam,
      items: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    try {
      const docRef = doc(db, getUserDocPath()!)

      const layoutsObj: Record<string, Layout> = {}
      layouts.forEach(l => {
        layoutsObj[l.id] = l
      })
      layoutsObj[newLayoutId] = newLayout

      // Stop met bekijken van gedeelde layout
      setViewingShareId(null)

      await setDoc(docRef, {
        layouts: layoutsObj,
        activeLayoutId: newLayoutId,
        updatedAt: serverTimestamp()
      })

      return newLayoutId
    } catch (err) {
      console.error('Fout bij aanmaken layout:', err)
      setError(err instanceof Error ? err.message : 'Onbekende fout bij aanmaken')
      return ''
    }
  }, [userId, layouts, getUserDocPath])

  // Hernoem een layout
  const renameLayout = useCallback(async (layoutId: string, nieuweNaam: string) => {
    if (!userId) return

    try {
      const docRef = doc(db, getUserDocPath()!)

      const layoutsObj: Record<string, Layout> = {}
      layouts.forEach(l => {
        if (l.id === layoutId) {
          layoutsObj[l.id] = { ...l, naam: nieuweNaam, updatedAt: new Date() }
        } else {
          layoutsObj[l.id] = l
        }
      })

      await setDoc(docRef, {
        layouts: layoutsObj,
        activeLayoutId,
        updatedAt: serverTimestamp()
      })
    } catch (err) {
      console.error('Fout bij hernoemen layout:', err)
      setError(err instanceof Error ? err.message : 'Onbekende fout bij hernoemen')
    }
  }, [userId, layouts, activeLayoutId, getUserDocPath])

  // Dupliceer een layout
  const duplicateLayout = useCallback(async (layoutId: string, nieuweNaam: string): Promise<string> => {
    if (!userId) return ''

    const sourceLayout = layouts.find(l => l.id === layoutId)
    if (!sourceLayout) return ''

    const newLayoutId = generateId()
    const newLayout: Layout = {
      id: newLayoutId,
      naam: nieuweNaam,
      items: [...sourceLayout.items],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    try {
      const docRef = doc(db, getUserDocPath()!)

      const layoutsObj: Record<string, Layout> = {}
      layouts.forEach(l => {
        layoutsObj[l.id] = l
      })
      layoutsObj[newLayoutId] = newLayout

      // Stop met bekijken van gedeelde layout
      setViewingShareId(null)

      await setDoc(docRef, {
        layouts: layoutsObj,
        activeLayoutId: newLayoutId,
        updatedAt: serverTimestamp()
      })

      return newLayoutId
    } catch (err) {
      console.error('Fout bij dupliceren layout:', err)
      setError(err instanceof Error ? err.message : 'Onbekende fout bij dupliceren')
      return ''
    }
  }, [userId, layouts, getUserDocPath])

  // Verwijder een layout
  const deleteLayout = useCallback(async (layoutId: string) => {
    if (!userId) return

    if (layouts.length <= 1) {
      setError('Kan de laatste layout niet verwijderen')
      return
    }

    try {
      const docRef = doc(db, getUserDocPath()!)

      const layoutsObj: Record<string, Layout> = {}
      layouts.forEach(l => {
        if (l.id !== layoutId) {
          layoutsObj[l.id] = l
        }
      })

      const remainingLayouts = layouts.filter(l => l.id !== layoutId)
      const newActiveId = layoutId === activeLayoutId
        ? remainingLayouts[0].id
        : activeLayoutId

      await setDoc(docRef, {
        layouts: layoutsObj,
        activeLayoutId: newActiveId,
        updatedAt: serverTimestamp()
      })
    } catch (err) {
      console.error('Fout bij verwijderen layout:', err)
      setError(err instanceof Error ? err.message : 'Onbekende fout bij verwijderen')
    }
  }, [userId, layouts, activeLayoutId, getUserDocPath])

  return {
    // Basis items
    items,
    loading: loading || migrating,
    error,
    saveItems,

    // Save status (voor UI feedback)
    saveStatus,
    saveRetryCount,

    // Eigen layouts
    layouts,
    activeLayout,
    activeLayoutId,
    switchLayout,
    createLayout,
    renameLayout,
    duplicateLayout,
    deleteLayout,

    // Gedeelde layouts
    sharedWithMe,
    viewingShareId,
    isViewingShared: !!viewingShareId,
    viewSharedLayout,
    stopViewingShared,

    // Permissies voor huidige view
    canEdit: viewingShareId
      ? sharedWithMeRaw.find(s => s.id === viewingShareId)?.permission === 'edit'
      : true
  }
}
