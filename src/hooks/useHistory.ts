import { useState, useCallback, useRef } from 'react'

/**
 * Generic undo/redo hook voor state history management.
 * Houdt een stack bij van vorige states en maakt undo/redo mogelijk.
 */
export function useHistory<T>(
  initialState: T,
  maxHistoryLength: number = 50
) {
  // Huidige state
  const [state, setState] = useState<T>(initialState)

  // History stacks
  const undoStack = useRef<T[]>([])
  const redoStack = useRef<T[]>([])

  // Track of we in een undo/redo operatie zitten
  const isUndoRedoRef = useRef(false)

  /**
   * Update de state en voeg de vorige state toe aan de undo stack.
   * Wist de redo stack (nieuwe actie na undo = geen redo meer mogelijk).
   */
  const set = useCallback((newState: T | ((prev: T) => T)) => {
    setState(prev => {
      const nextState = typeof newState === 'function'
        ? (newState as (prev: T) => T)(prev)
        : newState

      // Als dit geen undo/redo is, voeg toe aan history
      if (!isUndoRedoRef.current) {
        // Voeg huidige state toe aan undo stack
        undoStack.current = [...undoStack.current, prev].slice(-maxHistoryLength)
        // Wis redo stack bij nieuwe actie
        redoStack.current = []
      }

      return nextState
    })
  }, [maxHistoryLength])

  /**
   * Ga terug naar de vorige state.
   * Returns de nieuwe state (of undefined als undo niet mogelijk was).
   */
  const undo = useCallback((): T | undefined => {
    if (undoStack.current.length === 0) return undefined

    isUndoRedoRef.current = true

    // Pop van undo stack
    const previousState = undoStack.current[undoStack.current.length - 1]
    undoStack.current = undoStack.current.slice(0, -1)

    setState(currentState => {
      // Push huidige state naar redo stack
      redoStack.current = [...redoStack.current, currentState]
      return previousState
    })

    isUndoRedoRef.current = false
    return previousState
  }, [])

  /**
   * Ga vooruit naar de volgende state (na een undo).
   * Returns de nieuwe state (of undefined als redo niet mogelijk was).
   */
  const redo = useCallback((): T | undefined => {
    if (redoStack.current.length === 0) return undefined

    isUndoRedoRef.current = true

    // Pop van redo stack
    const nextState = redoStack.current[redoStack.current.length - 1]
    redoStack.current = redoStack.current.slice(0, -1)

    setState(currentState => {
      // Push huidige state naar undo stack
      undoStack.current = [...undoStack.current, currentState]
      return nextState
    })

    isUndoRedoRef.current = false
    return nextState
  }, [])

  /**
   * Wis alle history (bijv. bij layout switch).
   */
  const clearHistory = useCallback(() => {
    undoStack.current = []
    redoStack.current = []
  }, [])

  /**
   * Reset naar een nieuwe initial state en wis history.
   */
  const reset = useCallback((newInitialState: T) => {
    setState(newInitialState)
    clearHistory()
  }, [clearHistory])

  return {
    state,
    set,
    undo,
    redo,
    reset,
    clearHistory,
    canUndo: undoStack.current.length > 0,
    canRedo: redoStack.current.length > 0,
    undoCount: undoStack.current.length,
    redoCount: redoStack.current.length
  }
}
