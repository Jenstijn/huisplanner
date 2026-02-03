import { Stage, Layer, Rect, Text, Group } from 'react-konva'
import { appartementKamers, PIXELS_PER_METER, beschikbareMeubels } from '../data/appartement'
import { GeplaatstMeubel } from '../types'
import { KonvaEventObject } from 'konva/lib/Node'

interface PlattegrondProps {
  geplaatsteItems: GeplaatstMeubel[]
  geselecteerdItem: string | null
  onItemSelect: (id: string | null) => void
  onItemMove: (id: string, x: number, y: number) => void
  onStageClick: (x: number, y: number) => void
}

// Offset om ruimte te maken voor het balkon en labels
const OFFSET_X = 30
const OFFSET_Y = 100

export default function Plattegrond({
  geplaatsteItems,
  geselecteerdItem,
  onItemSelect,
  onItemMove,
  onStageClick
}: PlattegrondProps) {
  // Canvas grootte berekenen
  const canvasBreedte = 8.27 * PIXELS_PER_METER + OFFSET_X * 2
  const canvasHoogte = 10.34 * PIXELS_PER_METER + OFFSET_Y + 50

  const handleStageClick = (e: KonvaEventObject<MouseEvent>) => {
    // Negeer clicks op geplaatste meubels (gemarkeerd met name="meubel")
    const targetName = e.target.name()
    if (targetName === 'meubel' || targetName === 'meubel-text') {
      return
    }

    // Haal de stage op voor positie
    const stage = e.target.getStage()
    if (stage) {
      const pos = stage.getPointerPosition()
      if (pos) {
        // Converteer pixels naar meters
        const meterX = (pos.x - OFFSET_X) / PIXELS_PER_METER
        const meterY = (pos.y - OFFSET_Y) / PIXELS_PER_METER
        onStageClick(meterX, meterY)
      }
    }
  }

  return (
    <Stage
      width={canvasBreedte}
      height={canvasHoogte}
      onClick={handleStageClick}
      style={{ backgroundColor: '#f9f9f9', border: '1px solid #ccc' }}
    >
      <Layer>
        {/* Titel */}
        <Text
          x={OFFSET_X}
          y={20}
          text="Appartement Plattegrond"
          fontSize={20}
          fontStyle="bold"
          fill="#333"
        />
        <Text
          x={OFFSET_X}
          y={45}
          text="Klik op een meubel in de lijst en dan op de plattegrond om te plaatsen"
          fontSize={12}
          fill="#666"
        />

        {/* Kamers tekenen */}
        {appartementKamers.map((kamer) => (
          <Group key={kamer.id}>
            {/* Kamer rechthoek */}
            <Rect
              x={kamer.x * PIXELS_PER_METER + OFFSET_X}
              y={kamer.y * PIXELS_PER_METER + OFFSET_Y}
              width={kamer.breedte * PIXELS_PER_METER}
              height={kamer.hoogte * PIXELS_PER_METER}
              fill={kamer.kleur}
              stroke="#333"
              strokeWidth={2}
            />
            {/* Kamer naam */}
            <Text
              x={kamer.x * PIXELS_PER_METER + OFFSET_X + 5}
              y={kamer.y * PIXELS_PER_METER + OFFSET_Y + 5}
              text={kamer.naam}
              fontSize={12}
              fill="#333"
            />
            {/* Afmetingen */}
            <Text
              x={kamer.x * PIXELS_PER_METER + OFFSET_X + 5}
              y={kamer.y * PIXELS_PER_METER + OFFSET_Y + 20}
              text={`${kamer.breedte.toFixed(2)}m x ${kamer.hoogte.toFixed(2)}m`}
              fontSize={10}
              fill="#666"
            />
          </Group>
        ))}

        {/* Geplaatste meubels tekenen */}
        {geplaatsteItems.map((item) => {
          const meubel = beschikbareMeubels.find(m => m.id === item.meubelId)
          if (!meubel) return null

          const isGeselecteerd = item.id === geselecteerdItem

          return (
            <Group
              key={item.id}
              x={item.x * PIXELS_PER_METER + OFFSET_X}
              y={item.y * PIXELS_PER_METER + OFFSET_Y}
              rotation={item.rotatie}
              draggable
              onClick={() => {
                onItemSelect(item.id)
              }}
              onDragEnd={(e) => {
                const newX = (e.target.x() - OFFSET_X) / PIXELS_PER_METER
                const newY = (e.target.y() - OFFSET_Y) / PIXELS_PER_METER
                onItemMove(item.id, newX, newY)
              }}
            >
              <Rect
                name="meubel"
                width={meubel.breedte * PIXELS_PER_METER}
                height={meubel.hoogte * PIXELS_PER_METER}
                fill={meubel.kleur}
                stroke={isGeselecteerd ? '#ff6600' : '#333'}
                strokeWidth={isGeselecteerd ? 3 : 1}
                cornerRadius={3}
                shadowColor={isGeselecteerd ? '#ff6600' : 'transparent'}
                shadowBlur={isGeselecteerd ? 10 : 0}
              />
              <Text
                name="meubel-text"
                width={meubel.breedte * PIXELS_PER_METER}
                height={meubel.hoogte * PIXELS_PER_METER}
                text={meubel.naam}
                fontSize={10}
                fill="#fff"
                align="center"
                verticalAlign="middle"
              />
            </Group>
          )
        })}

        {/* Schaal indicator */}
        <Group x={OFFSET_X} y={canvasHoogte - 30}>
          <Rect
            width={PIXELS_PER_METER}
            height={5}
            fill="#333"
          />
          <Text
            y={10}
            text="1 meter"
            fontSize={10}
            fill="#333"
          />
        </Group>
      </Layer>
    </Stage>
  )
}
