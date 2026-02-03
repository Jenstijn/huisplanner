interface ToolbarProps {
  geselecteerdItemId: string | null
  onVerwijderen: () => void
  onRoteren: () => void
  aantalItems: number
}

export default function Toolbar({
  geselecteerdItemId,
  onVerwijderen,
  onRoteren,
  aantalItems
}: ToolbarProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
      <div className="text-sm text-gray-600">
        {aantalItems} meubel{aantalItems !== 1 ? 's' : ''} geplaatst
      </div>

      <div className="flex gap-2">
        {geselecteerdItemId && (
          <>
            <button
              onClick={onRoteren}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
              title="Roteer 90 graden"
            >
              ↻ Roteer
            </button>
            <button
              onClick={onVerwijderen}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
            >
              Verwijder
            </button>
          </>
        )}
        {!geselecteerdItemId && (
          <span className="text-sm text-gray-400">
            Selecteer een meubel op de plattegrond om te bewerken
          </span>
        )}
      </div>
    </div>
  )
}
