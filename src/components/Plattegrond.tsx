import { useState } from 'react'
import { Stage, Layer, Rect, Text, Group, Line, Circle, Arc, Ellipse } from 'react-konva'
import {
  appartementKamers,
  PIXELS_PER_METER,
  beschikbareMeubels,
  ingebouwdeElementen,
  muren
} from '../data/appartement'
import { GeplaatstMeubel, Kamer, Muur } from '../types'
import { KonvaEventObject } from 'konva/lib/Node'
import { snapToWalls, snapStoelToTafel } from '../utils/snapLogic'

interface PlattegrondProps {
  geplaatsteItems: GeplaatstMeubel[]
  geselecteerdItem: string | null
  onItemSelect: (id: string | null) => void
  onItemMove: (id: string, x: number, y: number) => void
  onStageClick: (x: number, y: number) => void
  onDrop?: (meubelId: string, x: number, y: number, customBreedte?: number, customHoogte?: number) => void
}

// Offset om ruimte te maken voor labels en padding
const OFFSET_X = 40
const OFFSET_Y = 40

// Helper functie om punten naar pixel array te converteren voor Line component
const puntenNaarPixels = (punten: { x: number; y: number }[]): number[] => {
  const pixels: number[] = []
  punten.forEach(punt => {
    pixels.push(punt.x * PIXELS_PER_METER + OFFSET_X)
    pixels.push(punt.y * PIXELS_PER_METER + OFFSET_Y)
  })
  return pixels
}

// Helper functie om muur rendering te berekenen
const getMuurSegmenten = (
  muur: Muur,
  offsetX: number,
  offsetY: number,
  pixelsPerMeter: number
): {
  segmenten: { start: { x: number; y: number }; eind: { x: number; y: number } }[]
  openings: {
    type: 'deur' | 'raam'
    center: { x: number; y: number }
    breedte: number
    hoek: number
    swing?: 'links' | 'rechts' | 'schuif'
  }[]
} => {
  const startPx = {
    x: muur.start.x * pixelsPerMeter + offsetX,
    y: muur.start.y * pixelsPerMeter + offsetY
  }
  const eindPx = {
    x: muur.eind.x * pixelsPerMeter + offsetX,
    y: muur.eind.y * pixelsPerMeter + offsetY
  }

  const dx = eindPx.x - startPx.x
  const dy = eindPx.y - startPx.y
  const muurLengte = Math.sqrt(dx * dx + dy * dy)
  const muurHoek = Math.atan2(dy, dx) * (180 / Math.PI)

  const sortedOpenings = [...muur.openings].sort((a, b) => a.t - b.t)

  const segmenten: { start: { x: number; y: number }; eind: { x: number; y: number } }[] = []
  const openingDetails: {
    type: 'deur' | 'raam'
    center: { x: number; y: number }
    breedte: number
    hoek: number
    swing?: 'links' | 'rechts' | 'schuif'
  }[] = []

  let currentT = 0

  sortedOpenings.forEach((opening) => {
    const openingBreedtePx = opening.breedte * pixelsPerMeter
    const halfBreedteT = (openingBreedtePx / 2) / muurLengte
    const openingStartT = Math.max(0, opening.t - halfBreedteT)
    const openingEindT = Math.min(1, opening.t + halfBreedteT)

    if (openingStartT > currentT) {
      segmenten.push({
        start: { x: startPx.x + dx * currentT, y: startPx.y + dy * currentT },
        eind: { x: startPx.x + dx * openingStartT, y: startPx.y + dy * openingStartT }
      })
    }

    openingDetails.push({
      type: opening.type,
      center: { x: startPx.x + dx * opening.t, y: startPx.y + dy * opening.t },
      breedte: openingBreedtePx,
      hoek: muurHoek,
      swing: opening.swing
    })

    currentT = openingEindT
  })

  if (currentT < 1) {
    segmenten.push({
      start: { x: startPx.x + dx * currentT, y: startPx.y + dy * currentT },
      eind: { x: eindPx.x, y: eindPx.y }
    })
  }

  return { segmenten, openings: openingDetails }
}

// Helper functie om het midden van een kamer te berekenen
const getKamerMidden = (kamer: Kamer): { x: number; y: number } => {
  if (kamer.punten && kamer.punten.length > 0) {
    const sumX = kamer.punten.reduce((sum, p) => sum + p.x, 0)
    const sumY = kamer.punten.reduce((sum, p) => sum + p.y, 0)
    return {
      x: (sumX / kamer.punten.length) * PIXELS_PER_METER + OFFSET_X,
      y: (sumY / kamer.punten.length) * PIXELS_PER_METER + OFFSET_Y
    }
  } else if (kamer.x !== undefined && kamer.y !== undefined && kamer.breedte && kamer.hoogte) {
    return {
      x: (kamer.x + kamer.breedte / 2) * PIXELS_PER_METER + OFFSET_X,
      y: (kamer.y + kamer.hoogte / 2) * PIXELS_PER_METER + OFFSET_Y
    }
  }
  return { x: 0, y: 0 }
}

// ============================================================================
// MEUBEL RENDERERS - Specifieke visuele weergave per meubeltype
// ============================================================================

interface MeubelRenderProps {
  width: number
  height: number
  isSelected: boolean
}

// Bank met kussens
const renderBank = ({ width, height, isSelected }: MeubelRenderProps) => (
  <Group>
    {/* Basis */}
    <Rect width={width} height={height} fill="#7a9a50" stroke={isSelected ? '#3b82f6' : '#5a7a30'} strokeWidth={isSelected ? 2 : 1} cornerRadius={4} />
    {/* Rugleuning */}
    <Rect x={2} y={2} width={width - 4} height={height * 0.25} fill="#6a8a40" cornerRadius={2} />
    {/* Kussens */}
    <Rect x={4} y={height * 0.3} width={width * 0.45 - 6} height={height * 0.65} fill="#8aaa60" cornerRadius={3} />
    <Rect x={width * 0.5 + 2} y={height * 0.3} width={width * 0.45 - 6} height={height * 0.65} fill="#8aaa60" cornerRadius={3} />
  </Group>
)

// Fauteuil
const renderFauteuil = ({ width, height, isSelected }: MeubelRenderProps) => (
  <Group>
    <Rect width={width} height={height} fill="#9a8070" stroke={isSelected ? '#3b82f6' : '#7a6050'} strokeWidth={isSelected ? 2 : 1} cornerRadius={4} />
    {/* Rugleuning */}
    <Rect x={3} y={3} width={width - 6} height={height * 0.3} fill="#8a7060" cornerRadius={2} />
    {/* Zitkussen */}
    <Ellipse x={width / 2} y={height * 0.65} radiusX={width * 0.35} radiusY={height * 0.25} fill="#aa9080" />
    {/* Armleuningen */}
    <Rect x={2} y={height * 0.25} width={width * 0.15} height={height * 0.6} fill="#8a7060" cornerRadius={2} />
    <Rect x={width - width * 0.15 - 2} y={height * 0.25} width={width * 0.15} height={height * 0.6} fill="#8a7060" cornerRadius={2} />
  </Group>
)

// Salontafel
const renderSalontafel = ({ width, height, isSelected }: MeubelRenderProps) => (
  <Group>
    <Rect width={width} height={height} fill="#d4a574" stroke={isSelected ? '#3b82f6' : '#b48554'} strokeWidth={isSelected ? 2 : 1} cornerRadius={3} />
    {/* Tafelblad patroon */}
    <Line points={[width * 0.1, height * 0.5, width * 0.9, height * 0.5]} stroke="#c49564" strokeWidth={1} />
    <Line points={[width * 0.5, height * 0.2, width * 0.5, height * 0.8]} stroke="#c49564" strokeWidth={1} />
  </Group>
)

// Eettafel
const renderEettafel = ({ width, height, isSelected }: MeubelRenderProps) => (
  <Group>
    <Rect width={width} height={height} fill="#b07040" stroke={isSelected ? '#3b82f6' : '#905020'} strokeWidth={isSelected ? 2 : 1} cornerRadius={2} />
    {/* Poten */}
    <Rect x={4} y={4} width={8} height={8} fill="#804020" />
    <Rect x={width - 12} y={4} width={8} height={8} fill="#804020" />
    <Rect x={4} y={height - 12} width={8} height={8} fill="#804020" />
    <Rect x={width - 12} y={height - 12} width={8} height={8} fill="#804020" />
  </Group>
)

// Stoel
const renderStoel = ({ width, height, isSelected }: MeubelRenderProps) => (
  <Group>
    {/* Zitting */}
    <Rect width={width} height={height} fill="#c8a898" stroke={isSelected ? '#3b82f6' : '#a88878'} strokeWidth={isSelected ? 2 : 1} cornerRadius={2} />
    {/* Rugleuning */}
    <Rect x={width * 0.15} y={2} width={width * 0.7} height={height * 0.25} fill="#b89888" cornerRadius={1} />
  </Group>
)

// Tweepersoonsbed
const renderBedDubbel = ({ width, height, isSelected }: MeubelRenderProps) => (
  <Group>
    {/* Matras */}
    <Rect width={width} height={height} fill="#e8e8f0" stroke={isSelected ? '#3b82f6' : '#b0b0c0'} strokeWidth={isSelected ? 2 : 1} cornerRadius={3} />
    {/* Hoofdeinde */}
    <Rect x={0} y={0} width={width} height={8} fill="#5060a0" cornerRadius={2} />
    {/* Kussens */}
    <Rect x={4} y={12} width={width * 0.45 - 6} height={height * 0.2} fill="#f0f0f8" stroke="#d0d0e0" strokeWidth={1} cornerRadius={4} />
    <Rect x={width * 0.5 + 2} y={12} width={width * 0.45 - 6} height={height * 0.2} fill="#f0f0f8" stroke="#d0d0e0" strokeWidth={1} cornerRadius={4} />
    {/* Dekbed */}
    <Rect x={3} y={height * 0.35} width={width - 6} height={height * 0.6} fill="#d0d8e8" cornerRadius={2} />
    {/* Dekbed vouw */}
    <Line points={[width * 0.3, height * 0.35, width * 0.3, height * 0.55]} stroke="#c0c8d8" strokeWidth={1} />
    <Line points={[width * 0.7, height * 0.35, width * 0.7, height * 0.55]} stroke="#c0c8d8" strokeWidth={1} />
  </Group>
)

// Eenpersoonsbed
const renderBedEnkel = ({ width, height, isSelected }: MeubelRenderProps) => (
  <Group>
    {/* Matras */}
    <Rect width={width} height={height} fill="#e8e8f0" stroke={isSelected ? '#3b82f6' : '#b0b0c0'} strokeWidth={isSelected ? 2 : 1} cornerRadius={3} />
    {/* Hoofdeinde */}
    <Rect x={0} y={0} width={width} height={6} fill="#5060a0" cornerRadius={2} />
    {/* Kussen */}
    <Rect x={4} y={10} width={width - 8} height={height * 0.18} fill="#f0f0f8" stroke="#d0d0e0" strokeWidth={1} cornerRadius={3} />
    {/* Dekbed */}
    <Rect x={3} y={height * 0.32} width={width - 6} height={height * 0.63} fill="#d0d8e8" cornerRadius={2} />
  </Group>
)

// Nachtkastje
const renderNachtkastje = ({ width, height, isSelected }: MeubelRenderProps) => (
  <Group>
    <Rect width={width} height={height} fill="#d4b896" stroke={isSelected ? '#3b82f6' : '#b49876'} strokeWidth={isSelected ? 2 : 1} cornerRadius={2} />
    {/* Lade */}
    <Rect x={3} y={height * 0.4} width={width - 6} height={height * 0.25} fill="#c4a886" stroke="#b49876" strokeWidth={0.5} />
    {/* Handvat */}
    <Rect x={width * 0.35} y={height * 0.48} width={width * 0.3} height={3} fill="#a08060" cornerRadius={1} />
  </Group>
)

// Kledingkast
const renderKledingkast = ({ width, height, isSelected }: MeubelRenderProps) => (
  <Group>
    <Rect width={width} height={height} fill="#9a8575" stroke={isSelected ? '#3b82f6' : '#7a6555'} strokeWidth={isSelected ? 2 : 1} cornerRadius={2} />
    {/* Deuren */}
    <Line points={[width / 2, 3, width / 2, height - 3]} stroke="#8a7565" strokeWidth={1} />
    {/* Handvatten */}
    <Rect x={width * 0.4 - 4} y={height * 0.45} width={4} height={height * 0.1} fill="#6a5545" cornerRadius={1} />
    <Rect x={width * 0.6} y={height * 0.45} width={4} height={height * 0.1} fill="#6a5545" cornerRadius={1} />
  </Group>
)

// Bureau
const renderBureau = ({ width, height, isSelected }: MeubelRenderProps) => (
  <Group>
    <Rect width={width} height={height} fill="#d2b48c" stroke={isSelected ? '#3b82f6' : '#b2946c'} strokeWidth={isSelected ? 2 : 1} cornerRadius={2} />
    {/* Laden */}
    <Rect x={width * 0.6} y={3} width={width * 0.35} height={height * 0.4} fill="#c2a47c" stroke="#b2946c" strokeWidth={0.5} />
    <Rect x={width * 0.6} y={height * 0.5} width={width * 0.35} height={height * 0.45} fill="#c2a47c" stroke="#b2946c" strokeWidth={0.5} />
  </Group>
)

// Bureaustoel
const renderBureaustoel = ({ width, height, isSelected }: MeubelRenderProps) => (
  <Group>
    {/* Zitting */}
    <Circle x={width / 2} y={height / 2} radius={Math.min(width, height) * 0.4} fill="#3f4f5f" stroke={isSelected ? '#3b82f6' : '#2f3f4f'} strokeWidth={isSelected ? 2 : 1} />
    {/* Rugleuning indicatie */}
    <Arc x={width / 2} y={height * 0.3} innerRadius={0} outerRadius={Math.min(width, height) * 0.25} angle={180} rotation={180} fill="#4f5f6f" />
  </Group>
)

// TV Meubel
const renderTVMeubel = ({ width, height, isSelected }: MeubelRenderProps) => (
  <Group>
    <Rect width={width} height={height} fill="#4a4a4a" stroke={isSelected ? '#3b82f6' : '#2a2a2a'} strokeWidth={isSelected ? 2 : 1} cornerRadius={2} />
    {/* Vakken */}
    <Rect x={3} y={3} width={width * 0.3 - 4} height={height - 6} fill="#3a3a3a" cornerRadius={1} />
    <Rect x={width * 0.33} y={3} width={width * 0.34} height={height - 6} fill="#3a3a3a" cornerRadius={1} />
    <Rect x={width * 0.7} y={3} width={width * 0.3 - 4} height={height - 6} fill="#3a3a3a" cornerRadius={1} />
  </Group>
)

// Boekenkast
const renderBoekenkast = ({ width, height, isSelected }: MeubelRenderProps) => (
  <Group>
    <Rect width={width} height={height} fill="#8b4513" stroke={isSelected ? '#3b82f6' : '#6b2503'} strokeWidth={isSelected ? 2 : 1} cornerRadius={1} />
    {/* Planken */}
    <Line points={[2, height * 0.33, width - 2, height * 0.33]} stroke="#7b3503" strokeWidth={2} />
    <Line points={[2, height * 0.66, width - 2, height * 0.66]} stroke="#7b3503" strokeWidth={2} />
    {/* Boeken indicatie */}
    <Rect x={4} y={4} width={6} height={height * 0.28} fill="#c04040" />
    <Rect x={12} y={4} width={5} height={height * 0.28} fill="#4040c0" />
    <Rect x={19} y={4} width={7} height={height * 0.28} fill="#40a040" />
  </Group>
)

// Plant
const renderPlant = ({ width, height, isSelected }: MeubelRenderProps) => (
  <Group>
    {/* Pot */}
    <Rect x={width * 0.2} y={height * 0.6} width={width * 0.6} height={height * 0.35} fill="#a05030" stroke={isSelected ? '#3b82f6' : '#803010'} strokeWidth={isSelected ? 2 : 1} cornerRadius={2} />
    {/* Plant */}
    <Circle x={width * 0.5} y={height * 0.35} radius={width * 0.35} fill="#2a8b2a" />
    <Circle x={width * 0.3} y={height * 0.45} radius={width * 0.2} fill="#3a9b3a" />
    <Circle x={width * 0.7} y={height * 0.4} radius={width * 0.22} fill="#3a9b3a" />
  </Group>
)

// Vloerlamp
const renderLamp = ({ width, height, isSelected }: MeubelRenderProps) => (
  <Group>
    {/* Voet */}
    <Circle x={width / 2} y={height * 0.85} radius={width * 0.35} fill="#707070" stroke={isSelected ? '#3b82f6' : '#505050'} strokeWidth={isSelected ? 2 : 1} />
    {/* Paal */}
    <Rect x={width * 0.45} y={height * 0.3} width={width * 0.1} height={height * 0.55} fill="#606060" />
    {/* Kap */}
    <Ellipse x={width / 2} y={height * 0.2} radiusX={width * 0.4} radiusY={height * 0.15} fill="#ffd700" stroke="#ddb700" strokeWidth={1} />
  </Group>
)

// Hoekbank (L-vorm)
const renderHoekbank = ({ width, height, isSelected }: MeubelRenderProps) => (
  <Group>
    {/* Horizontaal deel (onderaan) */}
    <Rect x={0} y={height * 0.55} width={width} height={height * 0.45} fill="#7a9a50" stroke={isSelected ? '#3b82f6' : '#5a7a30'} strokeWidth={isSelected ? 2 : 1} cornerRadius={4} />
    {/* Verticaal deel (links) */}
    <Rect x={0} y={0} width={width * 0.35} height={height} fill="#7a9a50" stroke={isSelected ? '#3b82f6' : '#5a7a30'} strokeWidth={isSelected ? 2 : 1} cornerRadius={4} />
    {/* Kussens horizontaal */}
    <Rect x={width * 0.38} y={height * 0.62} width={width * 0.28} height={height * 0.32} fill="#8aaa60" cornerRadius={3} />
    <Rect x={width * 0.68} y={height * 0.62} width={width * 0.28} height={height * 0.32} fill="#8aaa60" cornerRadius={3} />
    {/* Kussens verticaal */}
    <Rect x={width * 0.05} y={height * 0.08} width={width * 0.25} height={height * 0.2} fill="#8aaa60" cornerRadius={3} />
    <Rect x={width * 0.05} y={height * 0.32} width={width * 0.25} height={height * 0.2} fill="#8aaa60" cornerRadius={3} />
  </Group>
)

// Ronde salontafel
const renderSalontafelRond = ({ width, height, isSelected }: MeubelRenderProps) => (
  <Group>
    <Circle x={width / 2} y={height / 2} radius={Math.min(width, height) / 2} fill="#d4a574" stroke={isSelected ? '#3b82f6' : '#b48554'} strokeWidth={isSelected ? 2 : 1} />
    {/* Houten nerf patroon */}
    <Line points={[width * 0.3, height * 0.5, width * 0.7, height * 0.5]} stroke="#c49564" strokeWidth={1} />
    <Line points={[width * 0.5, height * 0.3, width * 0.5, height * 0.7]} stroke="#c49564" strokeWidth={1} />
  </Group>
)

// Ronde eettafel
const renderEettafelRond = ({ width, height, isSelected }: MeubelRenderProps) => (
  <Group>
    <Circle x={width / 2} y={height / 2} radius={Math.min(width, height) / 2} fill="#b07040" stroke={isSelected ? '#3b82f6' : '#905020'} strokeWidth={isSelected ? 2 : 1} />
    {/* Centrale poot indicatie */}
    <Circle x={width / 2} y={height / 2} radius={Math.min(width, height) * 0.15} fill="#804020" />
  </Group>
)

// Dressoir
const renderDressoir = ({ width, height, isSelected }: MeubelRenderProps) => (
  <Group>
    <Rect width={width} height={height} fill="#9a8575" stroke={isSelected ? '#3b82f6' : '#7a6555'} strokeWidth={isSelected ? 2 : 1} cornerRadius={2} />
    {/* Laden */}
    <Rect x={3} y={3} width={width / 2 - 5} height={height - 6} fill="#8a7565" stroke="#7a6555" strokeWidth={0.5} cornerRadius={1} />
    <Rect x={width / 2 + 2} y={3} width={width / 2 - 5} height={height - 6} fill="#8a7565" stroke="#7a6555" strokeWidth={0.5} cornerRadius={1} />
    {/* Handvatten */}
    <Rect x={width * 0.2} y={height * 0.4} width={width * 0.1} height={3} fill="#6a5545" cornerRadius={1} />
    <Rect x={width * 0.7} y={height * 0.4} width={width * 0.1} height={3} fill="#6a5545" cornerRadius={1} />
  </Group>
)

// Map icoon naar render functie
const meubelRenderers: Record<string, (props: MeubelRenderProps) => JSX.Element> = {
  'bank': renderBank,
  'hoekbank': renderHoekbank,
  'fauteuil': renderFauteuil,
  'salontafel': renderSalontafel,
  'salontafel-rond': renderSalontafelRond,
  'eettafel': renderEettafel,
  'eettafel-rond': renderEettafelRond,
  'stoel': renderStoel,
  'bed-dubbel': renderBedDubbel,
  'bed-enkel': renderBedEnkel,
  'nachtkastje': renderNachtkastje,
  'kledingkast': renderKledingkast,
  'bureau': renderBureau,
  'bureaustoel': renderBureaustoel,
  'tv-meubel': renderTVMeubel,
  'boekenkast': renderBoekenkast,
  'plant': renderPlant,
  'lamp': renderLamp,
  'dressoir': renderDressoir,
}

// Fallback renderer voor onbekende meubels
const renderDefault = ({ width, height, isSelected }: MeubelRenderProps, kleur: string, naam: string) => (
  <Group>
    <Rect width={width} height={height} fill={kleur} stroke={isSelected ? '#3b82f6' : '#505050'} strokeWidth={isSelected ? 2 : 1} cornerRadius={4} />
    <Text width={width} height={height} text={naam} fontSize={9} fontFamily="Inter, system-ui, sans-serif" fill="#fff" align="center" verticalAlign="middle" />
  </Group>
)

export default function Plattegrond({
  geplaatsteItems,
  geselecteerdItem,
  onItemSelect,
  onItemMove,
  onStageClick,
  onDrop
}: PlattegrondProps) {
  const canvasBreedte = 9 * PIXELS_PER_METER + OFFSET_X * 2
  const canvasHoogte = 12.5 * PIXELS_PER_METER + OFFSET_Y * 2
  const [isDraggingOver, setIsDraggingOver] = useState(false)

  const handleStageClick = (e: KonvaEventObject<MouseEvent>) => {
    const targetName = e.target.name()
    if (targetName === 'meubel' || targetName === 'meubel-text') {
      return
    }

    const stage = e.target.getStage()
    if (stage) {
      const pos = stage.getPointerPosition()
      if (pos) {
        const meterX = (pos.x - OFFSET_X) / PIXELS_PER_METER
        const meterY = (pos.y - OFFSET_Y) / PIXELS_PER_METER
        onStageClick(meterX, meterY)
      }
    }
  }

  // Drop handlers voor drag-and-drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    setIsDraggingOver(true)
  }

  const handleDragLeave = () => {
    setIsDraggingOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingOver(false)

    if (!onDrop) return

    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'))
      if (data.meubelId) {
        // Bereken positie relatief aan de canvas
        const rect = e.currentTarget.getBoundingClientRect()
        const x = (e.clientX - rect.left - OFFSET_X) / PIXELS_PER_METER
        const y = (e.clientY - rect.top - OFFSET_Y) / PIXELS_PER_METER

        onDrop(data.meubelId, x, y, data.breedte, data.hoogte)
      }
    } catch (err) {
      console.error('Drop data parsing error:', err)
    }
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative inline-block transition-all duration-200 ${isDraggingOver ? 'ring-4 ring-blue-400 ring-opacity-50 rounded-xl' : ''}`}
    >
    <Stage
      width={canvasBreedte}
      height={canvasHoogte}
      onClick={handleStageClick}
      style={{
        backgroundColor: '#fafafa',
        borderRadius: '12px',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)'
      }}
    >
      <Layer>
        {/* Subtiele grid achtergrond */}
        {Array.from({ length: Math.ceil(canvasBreedte / (PIXELS_PER_METER / 2)) }).map((_, i) => (
          <Line
            key={`grid-v-${i}`}
            points={[i * PIXELS_PER_METER / 2, 0, i * PIXELS_PER_METER / 2, canvasHoogte]}
            stroke="#e8e8e8"
            strokeWidth={i % 2 === 0 ? 1 : 0.5}
            dash={i % 2 === 0 ? undefined : [2, 4]}
          />
        ))}
        {Array.from({ length: Math.ceil(canvasHoogte / (PIXELS_PER_METER / 2)) }).map((_, i) => (
          <Line
            key={`grid-h-${i}`}
            points={[0, i * PIXELS_PER_METER / 2, canvasBreedte, i * PIXELS_PER_METER / 2]}
            stroke="#e8e8e8"
            strokeWidth={i % 2 === 0 ? 1 : 0.5}
            dash={i % 2 === 0 ? undefined : [2, 4]}
          />
        ))}

        {/* Kamers tekenen */}
        {appartementKamers.map((kamer) => {
          const midden = getKamerMidden(kamer)

          if (kamer.punten && kamer.punten.length > 0) {
            return (
              <Group key={kamer.id}>
                <Line
                  points={puntenNaarPixels(kamer.punten)}
                  closed={true}
                  fill={kamer.kleur}
                  stroke={kamer.isGemeenschappelijk ? '#a0a0a0' : '#4a4a4a'}
                  strokeWidth={kamer.isGemeenschappelijk ? 1.5 : 2}
                />
                <Text
                  x={midden.x - 40}
                  y={midden.y - 8}
                  width={80}
                  text={kamer.naam}
                  fontSize={11}
                  fontFamily="Inter, system-ui, sans-serif"
                  fontStyle={kamer.isGemeenschappelijk ? 'italic' : 'normal'}
                  fill={kamer.isGemeenschappelijk ? '#808080' : '#404040'}
                  align="center"
                />
              </Group>
            )
          }
          return null
        })}

        {/* Muren met deuren en ramen tekenen */}
        {muren.map((muur) => {
          const { segmenten, openings } = getMuurSegmenten(muur, OFFSET_X, OFFSET_Y, PIXELS_PER_METER)
          const muurDikte = muur.isBuiten ? 4 : 2

          return (
            <Group key={muur.id}>
              {/* Muur segmenten */}
              {segmenten.map((segment, i) => (
                <Line
                  key={`${muur.id}-segment-${i}`}
                  points={[segment.start.x, segment.start.y, segment.eind.x, segment.eind.y]}
                  stroke={muur.isBuiten ? '#202020' : '#404040'}
                  strokeWidth={muurDikte}
                  lineCap="round"
                />
              ))}

              {/* Ramen als blauwe lijnen */}
              {openings
                .filter((o) => o.type === 'raam')
                .map((raam, i) => {
                  const hoekRad = (raam.hoek * Math.PI) / 180
                  const halfBreedte = raam.breedte / 2
                  return (
                    <Group key={`${muur.id}-raam-${i}`}>
                      <Line
                        points={[
                          raam.center.x - Math.cos(hoekRad) * halfBreedte,
                          raam.center.y - Math.sin(hoekRad) * halfBreedte,
                          raam.center.x + Math.cos(hoekRad) * halfBreedte,
                          raam.center.y + Math.sin(hoekRad) * halfBreedte
                        ]}
                        stroke="#4a90d9"
                        strokeWidth={4}
                        lineCap="round"
                      />
                      <Line
                        points={[
                          raam.center.x - Math.cos(hoekRad) * halfBreedte,
                          raam.center.y - Math.sin(hoekRad) * halfBreedte,
                          raam.center.x + Math.cos(hoekRad) * halfBreedte,
                          raam.center.y + Math.sin(hoekRad) * halfBreedte
                        ]}
                        stroke="#87ceeb"
                        strokeWidth={2}
                        lineCap="round"
                      />
                    </Group>
                  )
                })}

              {/* Deuren - alleen witte opening, geen swing arc */}
              {openings
                .filter((o) => o.type === 'deur')
                .map((deur, i) => {
                  const hoekRad = (deur.hoek * Math.PI) / 180
                  const halfBreedte = deur.breedte / 2

                  const deurStart = {
                    x: deur.center.x - Math.cos(hoekRad) * halfBreedte,
                    y: deur.center.y - Math.sin(hoekRad) * halfBreedte
                  }
                  const deurEind = {
                    x: deur.center.x + Math.cos(hoekRad) * halfBreedte,
                    y: deur.center.y + Math.sin(hoekRad) * halfBreedte
                  }

                  return (
                    <Group key={`${muur.id}-deur-${i}`}>
                      {/* Deur opening (witte achtergrond) */}
                      <Line
                        points={[deurStart.x, deurStart.y, deurEind.x, deurEind.y]}
                        stroke="#f5f5f5"
                        strokeWidth={muurDikte + 2}
                        lineCap="round"
                      />

                      {/* Schuifdeur indicator */}
                      {deur.swing === 'schuif' && (
                        <Line
                          points={[deurStart.x, deurStart.y, deurEind.x, deurEind.y]}
                          stroke="#707070"
                          strokeWidth={2}
                          dash={[4, 4]}
                        />
                      )}
                    </Group>
                  )
                })}
            </Group>
          )
        })}

        {/* Ingebouwde elementen tekenen (ZONDER labels) */}
        {ingebouwdeElementen.map((element) => (
          <Group key={element.id}>
            {element.type === 'douche' ? (
              <Circle
                x={element.x * PIXELS_PER_METER + OFFSET_X + (element.breedte * PIXELS_PER_METER) / 2}
                y={element.y * PIXELS_PER_METER + OFFSET_Y + (element.hoogte * PIXELS_PER_METER) / 2}
                radius={(element.breedte * PIXELS_PER_METER) / 2}
                fill={element.kleur}
                stroke="#9ab8c8"
                strokeWidth={1}
              />
            ) : element.type === 'wc' ? (
              <Group>
                <Rect
                  x={element.x * PIXELS_PER_METER + OFFSET_X}
                  y={element.y * PIXELS_PER_METER + OFFSET_Y}
                  width={element.breedte * PIXELS_PER_METER}
                  height={element.hoogte * PIXELS_PER_METER}
                  fill={element.kleur}
                  stroke="#a0a0a0"
                  strokeWidth={1}
                  cornerRadius={2}
                />
                {/* WC deksel */}
                <Ellipse
                  x={element.x * PIXELS_PER_METER + OFFSET_X + (element.breedte * PIXELS_PER_METER) / 2}
                  y={element.y * PIXELS_PER_METER + OFFSET_Y + (element.hoogte * PIXELS_PER_METER) * 0.55}
                  radiusX={(element.breedte * PIXELS_PER_METER) * 0.35}
                  radiusY={(element.hoogte * PIXELS_PER_METER) * 0.3}
                  fill="#f0f0f0"
                  stroke="#c0c0c0"
                  strokeWidth={1}
                />
              </Group>
            ) : element.type === 'wastafel' ? (
              <Group>
                <Rect
                  x={element.x * PIXELS_PER_METER + OFFSET_X}
                  y={element.y * PIXELS_PER_METER + OFFSET_Y}
                  width={element.breedte * PIXELS_PER_METER}
                  height={element.hoogte * PIXELS_PER_METER}
                  fill={element.kleur}
                  stroke="#a0a0a0"
                  strokeWidth={1}
                  cornerRadius={2}
                />
                {/* Wasbak */}
                <Ellipse
                  x={element.x * PIXELS_PER_METER + OFFSET_X + (element.breedte * PIXELS_PER_METER) / 2}
                  y={element.y * PIXELS_PER_METER + OFFSET_Y + (element.hoogte * PIXELS_PER_METER) / 2}
                  radiusX={(element.breedte * PIXELS_PER_METER) * 0.35}
                  radiusY={(element.hoogte * PIXELS_PER_METER) * 0.3}
                  fill="#e8f0f8"
                  stroke="#a0b0c0"
                  strokeWidth={1}
                />
              </Group>
            ) : element.type === 'bad' ? (
              <Group>
                <Rect
                  x={element.x * PIXELS_PER_METER + OFFSET_X}
                  y={element.y * PIXELS_PER_METER + OFFSET_Y}
                  width={element.breedte * PIXELS_PER_METER}
                  height={element.hoogte * PIXELS_PER_METER}
                  fill={element.kleur}
                  stroke="#88a8b8"
                  strokeWidth={1}
                  cornerRadius={4}
                />
                {/* Bad binnenkant */}
                <Rect
                  x={element.x * PIXELS_PER_METER + OFFSET_X + 3}
                  y={element.y * PIXELS_PER_METER + OFFSET_Y + 3}
                  width={element.breedte * PIXELS_PER_METER - 6}
                  height={element.hoogte * PIXELS_PER_METER - 6}
                  fill="#c8e0f0"
                  cornerRadius={3}
                />
              </Group>
            ) : (
              <Rect
                x={element.x * PIXELS_PER_METER + OFFSET_X}
                y={element.y * PIXELS_PER_METER + OFFSET_Y}
                width={element.breedte * PIXELS_PER_METER}
                height={element.hoogte * PIXELS_PER_METER}
                fill={element.kleur}
                stroke="#a0a0a0"
                strokeWidth={1}
                cornerRadius={2}
              />
            )}
          </Group>
        ))}

        {/* Geplaatste meubels tekenen met visuele stijl */}
        {geplaatsteItems.map((item) => {
          const meubel = beschikbareMeubels.find(m => m.id === item.meubelId)
          if (!meubel) return null

          const isGeselecteerd = item.id === geselecteerdItem
          // Gebruik custom afmetingen indien aanwezig, anders standaard
          const width = (item.customBreedte ?? meubel.breedte) * PIXELS_PER_METER
          const height = (item.customHoogte ?? meubel.hoogte) * PIXELS_PER_METER

          const renderer = meubel.icoon ? meubelRenderers[meubel.icoon] : null

          return (
            <Group
              key={item.id}
              x={item.x * PIXELS_PER_METER + OFFSET_X}
              y={item.y * PIXELS_PER_METER + OFFSET_Y}
              rotation={item.rotatie}
              draggable
              name="meubel"
              onClick={(e) => {
                e.cancelBubble = true  // Stop event propagation naar Stage
                onItemSelect(item.id)
              }}
              onDragEnd={(e) => {
                const rawX = (e.target.x() - OFFSET_X) / PIXELS_PER_METER
                const rawY = (e.target.y() - OFFSET_Y) / PIXELS_PER_METER

                // Haal meubel afmetingen op
                const breedte = item.customBreedte ?? meubel.breedte
                const hoogte = item.customHoogte ?? meubel.hoogte

                // Check eerst voor stoel-naar-tafel snap (alleen voor eetkamerstoelen)
                if (item.meubelId === 'eetkamerstoel') {
                  const tafelSnap = snapStoelToTafel(
                    rawX, rawY, breedte, hoogte,
                    geplaatsteItems, beschikbareMeubels
                  )
                  if (tafelSnap.snapped) {
                    // Update positie in pixels voor visuele feedback
                    e.target.x(tafelSnap.x * PIXELS_PER_METER + OFFSET_X)
                    e.target.y(tafelSnap.y * PIXELS_PER_METER + OFFSET_Y)
                    onItemMove(item.id, tafelSnap.x, tafelSnap.y)
                    return
                  }
                }

                // Anders: probeer snap naar muren
                const wallSnap = snapToWalls(rawX, rawY, breedte, hoogte, muren)
                if (wallSnap.snapped) {
                  // Update positie in pixels voor visuele feedback
                  e.target.x(wallSnap.x * PIXELS_PER_METER + OFFSET_X)
                  e.target.y(wallSnap.y * PIXELS_PER_METER + OFFSET_Y)
                  onItemMove(item.id, wallSnap.x, wallSnap.y)
                } else {
                  onItemMove(item.id, rawX, rawY)
                }
              }}
            >
              {renderer
                ? renderer({ width, height, isSelected: isGeselecteerd })
                : renderDefault({ width, height, isSelected: isGeselecteerd }, meubel.kleur, meubel.naam)
              }
              {/* Selectie indicator */}
              {isGeselecteerd && (
                <Rect
                  width={width}
                  height={height}
                  stroke="#3b82f6"
                  strokeWidth={2}
                  cornerRadius={4}
                  shadowColor="#3b82f6"
                  shadowBlur={12}
                  shadowOpacity={0.4}
                />
              )}
            </Group>
          )
        })}

        {/* Schaal indicator */}
        <Group x={OFFSET_X} y={canvasHoogte - 25}>
          <Rect width={PIXELS_PER_METER} height={4} fill="#404040" cornerRadius={2} />
          <Text y={8} text="1 meter" fontSize={10} fontFamily="Inter, system-ui, sans-serif" fill="#606060" />
        </Group>
      </Layer>
    </Stage>
    </div>
  )
}
