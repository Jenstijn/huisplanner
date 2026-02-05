import { useState, useRef, useEffect } from 'react'
import { Layout } from '../types'

interface LayoutSelectorProps {
  layouts: Layout[]
  activeLayoutId: string
  onSwitch: (layoutId: string) => void
  onCreate: (naam: string) => Promise<string>
  onRename: (layoutId: string, naam: string) => Promise<void>
  onDuplicate: (layoutId: string, naam: string) => Promise<string>
  onDelete: (layoutId: string) => Promise<void>
  onShare?: (layout: Layout) => void  // Optioneel - voor delen functionaliteit
}

export default function LayoutSelector({
  layouts,
  activeLayoutId,
  onSwitch,
  onCreate,
  onRename,
  onDuplicate,
  onDelete,
  onShare
}: LayoutSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [showNewInput, setShowNewInput] = useState(false)
  const [newLayoutName, setNewLayoutName] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const newInputRef = useRef<HTMLInputElement>(null)

  const activeLayout = layouts.find(l => l.id === activeLayoutId)

  // Sluit dropdown bij klik buiten
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setEditingId(null)
        setShowNewInput(false)
        setShowDeleteConfirm(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Focus input wanneer editing start
  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editingId])

  // Focus new input
  useEffect(() => {
    if (showNewInput && newInputRef.current) {
      newInputRef.current.focus()
    }
  }, [showNewInput])

  const handleStartEdit = (layout: Layout) => {
    setEditingId(layout.id)
    setEditingName(layout.naam)
  }

  const handleSaveEdit = async () => {
    if (editingId && editingName.trim()) {
      await onRename(editingId, editingName.trim())
    }
    setEditingId(null)
    setEditingName('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit()
    } else if (e.key === 'Escape') {
      setEditingId(null)
      setEditingName('')
    }
  }

  const handleCreateNew = async () => {
    if (newLayoutName.trim()) {
      await onCreate(newLayoutName.trim())
      setNewLayoutName('')
      setShowNewInput(false)
      setIsOpen(false)
    }
  }

  const handleNewKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreateNew()
    } else if (e.key === 'Escape') {
      setShowNewInput(false)
      setNewLayoutName('')
    }
  }

  const handleDuplicate = async (layout: Layout) => {
    await onDuplicate(layout.id, `${layout.naam} (kopie)`)
    setIsOpen(false)
  }

  const handleDelete = async (layoutId: string) => {
    await onDelete(layoutId)
    setShowDeleteConfirm(null)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <span className="text-sm font-medium text-gray-700">
          {activeLayout?.naam || 'Layout'}
        </span>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="py-1">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Layouts ({layouts.length})
            </div>

            {/* Layout list */}
            {layouts.map(layout => (
              <div
                key={layout.id}
                className={`group flex items-center justify-between px-3 py-2 hover:bg-gray-50 ${
                  layout.id === activeLayoutId ? 'bg-blue-50' : ''
                }`}
              >
                {editingId === layout.id ? (
                  <input
                    ref={inputRef}
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={handleSaveEdit}
                    onKeyDown={handleKeyDown}
                    className="flex-1 px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <>
                    <button
                      onClick={() => {
                        onSwitch(layout.id)
                        setIsOpen(false)
                      }}
                      className="flex-1 flex items-center gap-2 text-left"
                    >
                      {layout.id === activeLayoutId && (
                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                      <span className={`text-sm ${layout.id === activeLayoutId ? 'font-medium text-blue-700' : 'text-gray-700'}`}>
                        {layout.naam}
                      </span>
                      <span className="text-xs text-gray-400">
                        ({layout.items.length})
                      </span>
                    </button>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* Share button */}
                      {onShare && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onShare(layout)
                          }}
                          className="p-1 text-gray-400 hover:text-blue-500 rounded"
                          title="Delen"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                          </svg>
                        </button>
                      )}

                      {/* Edit button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleStartEdit(layout)
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded"
                        title="Hernoemen"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>

                      {/* Duplicate button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDuplicate(layout)
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded"
                        title="Dupliceren"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>

                      {/* Delete button */}
                      {layouts.length > 1 && (
                        showDeleteConfirm === layout.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDelete(layout.id)
                              }}
                              className="p-1 text-red-600 hover:text-red-700 rounded"
                              title="Bevestig verwijderen"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setShowDeleteConfirm(null)
                              }}
                              className="p-1 text-gray-400 hover:text-gray-600 rounded"
                              title="Annuleren"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setShowDeleteConfirm(layout.id)
                            }}
                            className="p-1 text-gray-400 hover:text-red-500 rounded"
                            title="Verwijderen"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}

            {/* Divider */}
            <div className="border-t border-gray-100 my-1"></div>

            {/* New layout */}
            {showNewInput ? (
              <div className="px-3 py-2 flex items-center gap-2">
                <input
                  ref={newInputRef}
                  type="text"
                  value={newLayoutName}
                  onChange={(e) => setNewLayoutName(e.target.value)}
                  onKeyDown={handleNewKeyDown}
                  placeholder="Naam nieuwe layout..."
                  className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleCreateNew}
                  disabled={!newLayoutName.trim()}
                  className="p-1 text-blue-600 hover:text-blue-700 disabled:text-gray-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    setShowNewInput(false)
                    setNewLayoutName('')
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowNewInput(true)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nieuwe layout
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
