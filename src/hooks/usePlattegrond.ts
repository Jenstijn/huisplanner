import { useState, useEffect, useCallback } from 'react'
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'
import { GeplaatstMeubel, Layout } from '../types'

// Één gedeelde plattegrond voor alle gebruikers
const PLATTEGROND_ID = 'gedeeld'

// Genereer een unieke ID
const generateId = () => Math.random().toString(36).substring(2, 15)

export function usePlattegrond() {
  const [layouts, setLayouts] = useState<Layout[]>([])
  const [activeLayoutId, setActiveLayoutId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // De actieve layout
  const activeLayout = layouts.find(l => l.id === activeLayoutId) || null
  const items = activeLayout?.items || []

  // Real-time listener voor wijzigingen van andere gebruikers
  useEffect(() => {
    const docRef = doc(db, 'plattegronden', PLATTEGROND_ID)

    const unsubscribe = onSnapshot(
      docRef,
      async (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data()

          // Check of we nieuwe layout structuur hebben of oude
          if (data.layouts && data.activeLayoutId) {
            // Nieuwe structuur - gebruik direct
            const layoutsArray = Object.values(data.layouts) as Layout[]
            setLayouts(layoutsArray)
            setActiveLayoutId(data.activeLayoutId)
          } else if (data.items) {
            // Oude structuur - migreer naar nieuwe
            console.log('Migreren van oude structuur naar layouts...')
            const newLayoutId = generateId()
            const newLayout: Layout = {
              id: newLayoutId,
              naam: 'Layout 1',
              items: data.items || [],
              createdAt: new Date(),
              updatedAt: new Date()
            }

            // Sla migratie op naar Firestore
            await setDoc(docRef, {
              layouts: { [newLayoutId]: newLayout },
              activeLayoutId: newLayoutId,
              updatedAt: serverTimestamp()
            })

            setLayouts([newLayout])
            setActiveLayoutId(newLayoutId)
          } else {
            // Geen data - maak eerste layout
            const newLayoutId = generateId()
            const newLayout: Layout = {
              id: newLayoutId,
              naam: 'Layout 1',
              items: [],
              createdAt: new Date(),
              updatedAt: new Date()
            }

            await setDoc(docRef, {
              layouts: { [newLayoutId]: newLayout },
              activeLayoutId: newLayoutId,
              updatedAt: serverTimestamp()
            })

            setLayouts([newLayout])
            setActiveLayoutId(newLayoutId)
          }
        } else {
          // Document bestaat nog niet - maak eerste layout
          const newLayoutId = generateId()
          const newLayout: Layout = {
            id: newLayoutId,
            naam: 'Layout 1',
            items: [],
            createdAt: new Date(),
            updatedAt: new Date()
          }

          await setDoc(docRef, {
            layouts: { [newLayoutId]: newLayout },
            activeLayoutId: newLayoutId,
            updatedAt: serverTimestamp()
          })

          setLayouts([newLayout])
          setActiveLayoutId(newLayoutId)
        }
        setLoading(false)
        setError(null)
      },
      (err) => {
        console.error('Firestore error:', err)
        setError(err.message)
        setLoading(false)
      }
    )

    // Cleanup listener bij unmount
    return unsubscribe
  }, [])

  // Opslaan van items naar de actieve layout
  const saveItems = useCallback(async (newItems: GeplaatstMeubel[]) => {
    if (!activeLayoutId) return

    try {
      const docRef = doc(db, 'plattegronden', PLATTEGROND_ID)

      // Update alleen de items van de actieve layout
      const updatedLayout: Layout = {
        ...activeLayout!,
        items: newItems,
        updatedAt: new Date()
      }

      // Maak layouts object met alle layouts
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
    } catch (err) {
      console.error('Fout bij opslaan:', err)
      setError(err instanceof Error ? err.message : 'Onbekende fout bij opslaan')
    }
  }, [activeLayoutId, activeLayout, layouts])

  // Wissel naar een andere layout
  const switchLayout = useCallback(async (layoutId: string) => {
    try {
      const docRef = doc(db, 'plattegronden', PLATTEGROND_ID)

      // Maak layouts object
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
  }, [layouts])

  // Maak een nieuwe layout
  const createLayout = useCallback(async (naam: string): Promise<string> => {
    const newLayoutId = generateId()
    const newLayout: Layout = {
      id: newLayoutId,
      naam,
      items: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    try {
      const docRef = doc(db, 'plattegronden', PLATTEGROND_ID)

      // Maak layouts object met alle bestaande + nieuwe
      const layoutsObj: Record<string, Layout> = {}
      layouts.forEach(l => {
        layoutsObj[l.id] = l
      })
      layoutsObj[newLayoutId] = newLayout

      await setDoc(docRef, {
        layouts: layoutsObj,
        activeLayoutId: newLayoutId,  // Activeer de nieuwe layout
        updatedAt: serverTimestamp()
      })

      return newLayoutId
    } catch (err) {
      console.error('Fout bij aanmaken layout:', err)
      setError(err instanceof Error ? err.message : 'Onbekende fout bij aanmaken')
      return ''
    }
  }, [layouts])

  // Hernoem een layout
  const renameLayout = useCallback(async (layoutId: string, nieuweNaam: string) => {
    try {
      const docRef = doc(db, 'plattegronden', PLATTEGROND_ID)

      // Maak layouts object met hernoemde layout
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
  }, [layouts, activeLayoutId])

  // Dupliceer een layout
  const duplicateLayout = useCallback(async (layoutId: string, nieuweNaam: string): Promise<string> => {
    const sourceLayout = layouts.find(l => l.id === layoutId)
    if (!sourceLayout) return ''

    const newLayoutId = generateId()
    const newLayout: Layout = {
      id: newLayoutId,
      naam: nieuweNaam,
      items: [...sourceLayout.items],  // Kopieer items
      createdAt: new Date(),
      updatedAt: new Date()
    }

    try {
      const docRef = doc(db, 'plattegronden', PLATTEGROND_ID)

      // Maak layouts object met alle bestaande + nieuwe
      const layoutsObj: Record<string, Layout> = {}
      layouts.forEach(l => {
        layoutsObj[l.id] = l
      })
      layoutsObj[newLayoutId] = newLayout

      await setDoc(docRef, {
        layouts: layoutsObj,
        activeLayoutId: newLayoutId,  // Activeer de gedupliceerde layout
        updatedAt: serverTimestamp()
      })

      return newLayoutId
    } catch (err) {
      console.error('Fout bij dupliceren layout:', err)
      setError(err instanceof Error ? err.message : 'Onbekende fout bij dupliceren')
      return ''
    }
  }, [layouts])

  // Verwijder een layout
  const deleteLayout = useCallback(async (layoutId: string) => {
    // Voorkom verwijderen als dit de laatste layout is
    if (layouts.length <= 1) {
      setError('Kan de laatste layout niet verwijderen')
      return
    }

    try {
      const docRef = doc(db, 'plattegronden', PLATTEGROND_ID)

      // Maak layouts object zonder de verwijderde
      const layoutsObj: Record<string, Layout> = {}
      layouts.forEach(l => {
        if (l.id !== layoutId) {
          layoutsObj[l.id] = l
        }
      })

      // Als we de actieve layout verwijderen, schakel naar de eerste
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
  }, [layouts, activeLayoutId])

  return {
    // Basis items (voor backward compatibility)
    items,
    loading,
    error,
    saveItems,

    // Layout specifieke exports
    layouts,
    activeLayout,
    activeLayoutId,
    switchLayout,
    createLayout,
    renameLayout,
    duplicateLayout,
    deleteLayout
  }
}
