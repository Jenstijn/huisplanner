import { useEffect, useCallback } from 'react'

interface KeyboardShortcutHandlers {
  onUndo?: () => void
  onRedo?: () => void
  onDelete?: () => void
  onRotate?: () => void
  onEscape?: () => void
  onDuplicate?: () => void
}

/**
 * Hook voor keyboard shortcuts die werkt op zowel Mac (Cmd) als Windows/Linux (Ctrl).
 *
 * Shortcuts:
 * - Cmd/Ctrl+Z: Undo
 * - Cmd/Ctrl+Shift+Z of Cmd/Ctrl+Y: Redo
 * - Delete/Backspace: Verwijder geselecteerd item
 * - R: Roteer geselecteerd item
 * - Escape: Deselecteer / annuleer
 * - Cmd/Ctrl+D: Dupliceer geselecteerd item
 */
export function useKeyboardShortcuts({
  onUndo,
  onRedo,
  onDelete,
  onRotate,
  onEscape,
  onDuplicate
}: KeyboardShortcutHandlers) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Negeer als focus in input/textarea is
    const target = e.target as HTMLElement
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      return
    }

    // Detecteer modifier key (Cmd op Mac, Ctrl op Windows/Linux)
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
    const modifierKey = isMac ? e.metaKey : e.ctrlKey

    // Cmd/Ctrl+Z: Undo
    if (modifierKey && e.key.toLowerCase() === 'z' && !e.shiftKey) {
      e.preventDefault()
      onUndo?.()
      return
    }

    // Cmd/Ctrl+Shift+Z of Cmd/Ctrl+Y: Redo
    if (modifierKey && ((e.key.toLowerCase() === 'z' && e.shiftKey) || e.key.toLowerCase() === 'y')) {
      e.preventDefault()
      onRedo?.()
      return
    }

    // Cmd/Ctrl+D: Dupliceer
    if (modifierKey && e.key.toLowerCase() === 'd') {
      e.preventDefault()
      onDuplicate?.()
      return
    }

    // Geen modifier nodig voor deze:

    // Delete of Backspace: Verwijder
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault()
      onDelete?.()
      return
    }

    // R: Roteer (alleen als geen modifier)
    if (e.key.toLowerCase() === 'r' && !modifierKey && !e.shiftKey && !e.altKey) {
      e.preventDefault()
      onRotate?.()
      return
    }

    // Escape: Deselecteer/annuleer
    if (e.key === 'Escape') {
      e.preventDefault()
      onEscape?.()
      return
    }
  }, [onUndo, onRedo, onDelete, onRotate, onEscape, onDuplicate])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

/**
 * Helper om shortcut tekst te formatteren voor UI (bijv. tooltips).
 * Toont Cmd op Mac, Ctrl op Windows.
 */
export function formatShortcut(shortcut: string): string {
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0

  return shortcut
    .replace('Mod', isMac ? '⌘' : 'Ctrl')
    .replace('Shift', isMac ? '⇧' : 'Shift')
    .replace('Alt', isMac ? '⌥' : 'Alt')
    .replace('Delete', isMac ? '⌫' : 'Del')
}
