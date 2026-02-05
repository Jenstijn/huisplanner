import { useState, useEffect, useCallback } from 'react'
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'
import { GeplaatstMeubel } from '../types'

// Één gedeelde plattegrond voor alle gebruikers
const PLATTEGROND_ID = 'gedeeld'

export function usePlattegrond() {
  const [items, setItems] = useState<GeplaatstMeubel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Real-time listener voor wijzigingen van andere gebruikers
  useEffect(() => {
    const docRef = doc(db, 'plattegronden', PLATTEGROND_ID)

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data()
          setItems(data.items || [])
        } else {
          // Document bestaat nog niet, start met lege array
          setItems([])
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

  // Opslaan naar Firestore - met useCallback voor stabiele referentie
  const saveItems = useCallback(async (newItems: GeplaatstMeubel[]) => {
    try {
      const docRef = doc(db, 'plattegronden', PLATTEGROND_ID)
      await setDoc(docRef, {
        items: newItems,
        updatedAt: serverTimestamp()
      }, { merge: true })
    } catch (err) {
      console.error('Fout bij opslaan:', err)
      setError(err instanceof Error ? err.message : 'Onbekende fout bij opslaan')
    }
  }, [])

  return {
    items,
    loading,
    error,
    saveItems
  }
}
