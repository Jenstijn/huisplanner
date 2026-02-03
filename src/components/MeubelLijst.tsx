import { beschikbareMeubels } from '../data/appartement'

interface MeubelLijstProps {
  geselecteerdMeubelId: string | null
  onMeubelSelect: (id: string | null) => void
}

export default function MeubelLijst({ geselecteerdMeubelId, onMeubelSelect }: MeubelLijstProps) {
  // Groepeer meubels per categorie
  const categorieen = {
    'Woonkamer': ['bank', 'fauteuil', 'salontafel', 'tv-meubel', 'boekenkast'],
    'Slaapkamer': ['tweepersoonsbed', 'eenpersoonsbed', 'nachtkastje', 'kledingkast', 'bureau', 'bureaustoel'],
    'Eetkamer': ['eettafel', 'eetkamerstoel'],
    'Accessoires': ['plant-groot', 'plant-klein', 'vloerlamp']
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 h-full overflow-y-auto">
      <h2 className="text-lg font-bold mb-4">Meubels</h2>

      {geselecteerdMeubelId && (
        <div className="mb-4 p-2 bg-orange-100 rounded text-sm">
          <strong>Geselecteerd:</strong>{' '}
          {beschikbareMeubels.find(m => m.id === geselecteerdMeubelId)?.naam}
          <button
            onClick={() => onMeubelSelect(null)}
            className="ml-2 text-orange-600 hover:text-orange-800"
          >
            ✕ Annuleren
          </button>
        </div>
      )}

      {Object.entries(categorieen).map(([categorie, meubelIds]) => (
        <div key={categorie} className="mb-4">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">{categorie}</h3>
          <div className="grid grid-cols-2 gap-2">
            {meubelIds.map((id) => {
              const meubel = beschikbareMeubels.find(m => m.id === id)
              if (!meubel) return null

              const isGeselecteerd = geselecteerdMeubelId === id

              return (
                <button
                  key={id}
                  onClick={() => onMeubelSelect(isGeselecteerd ? null : id)}
                  className={`
                    p-2 rounded text-left text-sm transition-all
                    ${isGeselecteerd
                      ? 'bg-orange-500 text-white ring-2 ring-orange-300'
                      : 'bg-gray-100 hover:bg-gray-200'
                    }
                  `}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: meubel.kleur }}
                    />
                    <span className="truncate">{meubel.naam}</span>
                  </div>
                  <div className="text-xs opacity-70 mt-1">
                    {meubel.breedte}m × {meubel.hoogte}m
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      ))}

      <div className="mt-6 pt-4 border-t text-xs text-gray-500">
        <p><strong>Tip:</strong> Selecteer een meubel en klik op de plattegrond om te plaatsen.</p>
        <p className="mt-1">Sleep meubels om ze te verplaatsen.</p>
      </div>
    </div>
  )
}
