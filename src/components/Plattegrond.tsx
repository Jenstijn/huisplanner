import { Stage, Layer, Rect, Text, Group, Line, Arc, Circle } from 'react-konva'
import {
  appartementKamers,
  PIXELS_PER_METER,
  beschikbareMeubels,
  deuren,
  ramen,
  ingebouwdeElementen
} from '../data/appartement'
import { GeplaatstMeubel, Kamer } from '../types'
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

// Helper functie om punten naar pixel array te converteren voor Line component
const puntenNaarPixels = (punten: { x: number; y: number }[]): number[] => {
  const pixels: number[] = []
  punten.forEach(punt => {
    pixels.push(punt.x * PIXELS_PER_METER + OFFSET_X)
    pixels.push(punt.y * PIXELS_PER_METER + OFFSET_Y)
  })
  return pixels
}

// Helper functie om het midden van een kamer te berekenen
const getKamerMidden = (kamer: Kamer): { x: number; y: number } => {
  if (kamer.punten && kamer.punten.length > 0) {
    // Voor polygonen: bereken gemiddelde van alle punten
    const sumX = kamer.punten.reduce((sum, p) => sum + p.x, 0)
    const sumY = kamer.punten.reduce((sum, p) => sum + p.y, 0)
    return {
      x: (sumX / kamer.punten.length) * PIXELS_PER_METER + OFFSET_X,
      y: (sumY / kamer.punten.length) * PIXELS_PER_METER + OFFSET_Y
    }
  } else if (kamer.x !== undefined && kamer.y !== undefined && kamer.breedte && kamer.hoogte) {
    // Voor rechthoeken
    return {
      x: (kamer.x + kamer.breedte / 2) * PIXELS_PER_METER + OFFSET_X,
      y: (kamer.y + kamer.hoogte / 2) * PIXELS_PER_METER + OFFSET_Y
    }
  }
  return { x: 0, y: 0 }
}

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
        {appartementKamers.map((kamer) => {
          const midden = getKamerMidden(kamer)

          // Bepaal of dit een polygoon of rechthoek is
          if (kamer.punten && kamer.punten.length > 0) {
            // Polygoon kamer (voor schuine muren)
            return (
              <Group key={kamer.id}>
                <Line
                  points={puntenNaarPixels(kamer.punten)}
                  closed={true}
                  fill={kamer.kleur}
                  stroke={kamer.isGemeenschappelijk ? '#666' : '#333'}
                  strokeWidth={2}
                />
                <Text
                  x={midden.x - 30}
                  y={midden.y - 10}
                  text={kamer.naam}
                  fontSize={12}
                  fill={kamer.isGemeenschappelijk ? '#666' : '#333'}
                />
              </Group>
            )
          } else if (kamer.x !== undefined && kamer.y !== undefined && kamer.breedte && kamer.hoogte) {
            // Rechthoek kamer
            return (
              <Group key={kamer.id}>
                <Rect
                  x={kamer.x * PIXELS_PER_METER + OFFSET_X}
                  y={kamer.y * PIXELS_PER_METER + OFFSET_Y}
                  width={kamer.breedte * PIXELS_PER_METER}
                  height={kamer.hoogte * PIXELS_PER_METER}
                  fill={kamer.kleur}
                  stroke={kamer.isGemeenschappelijk ? '#666' : '#333'}
                  strokeWidth={2}
                />
                <Text
                  x={kamer.x * PIXELS_PER_METER + OFFSET_X + 5}
                  y={kamer.y * PIXELS_PER_METER + OFFSET_Y + 5}
                  text={kamer.naam}
                  fontSize={12}
                  fill={kamer.isGemeenschappelijk ? '#666' : '#333'}
                />
                <Text
                  x={kamer.x * PIXELS_PER_METER + OFFSET_X + 5}
                  y={kamer.y * PIXELS_PER_METER + OFFSET_Y + 20}
                  text={`${kamer.breedte.toFixed(2)}m x ${kamer.hoogte.toFixed(2)}m`}
                  fontSize={10}
                  fill="#666"
                />
              </Group>
            )
          }
          return null
        })}

        {/* Ingebouwde elementen tekenen */}
        {ingebouwdeElementen.map((element) => (
          <Group key={element.id}>
            {element.type === 'douche' ? (
              // Douche als cirkel
              <Circle
                x={element.x * PIXELS_PER_METER + OFFSET_X + (element.breedte * PIXELS_PER_METER) / 2}
                y={element.y * PIXELS_PER_METER + OFFSET_Y + (element.hoogte * PIXELS_PER_METER) / 2}
                radius={(element.breedte * PIXELS_PER_METER) / 2}
                fill={element.kleur}
                stroke="#888"
                strokeWidth={1}
              />
            ) : (
              <Rect
                x={element.x * PIXELS_PER_METER + OFFSET_X}
                y={element.y * PIXELS_PER_METER + OFFSET_Y}
                width={element.breedte * PIXELS_PER_METER}
                height={element.hoogte * PIXELS_PER_METER}
                fill={element.kleur}
                stroke="#888"
                strokeWidth={1}
              />
            )}
            <Text
              x={element.x * PIXELS_PER_METER + OFFSET_X + 2}
              y={element.y * PIXELS_PER_METER + OFFSET_Y + 2}
              text={element.naam}
              fontSize={8}
              fill="#555"
            />
          </Group>
        ))}

        {/* Deuren tekenen */}
        {deuren.map((deur) => {
          const x = deur.x * PIXELS_PER_METER + OFFSET_X
          const y = deur.y * PIXELS_PER_METER + OFFSET_Y
          const breedte = deur.breedte * PIXELS_PER_METER

          // Bepaal rotatie en swing richting op basis van deur richting
          let rotation = 0
          let arcStartAngle = 0

          switch (deur.richting) {
            case 'noord':
              rotation = 0
              arcStartAngle = deur.opensNaar === 'binnen' ? 180 : 0
              break
            case 'oost':
              rotation = 90
              arcStartAngle = deur.opensNaar === 'binnen' ? 270 : 90
              break
            case 'zuid':
              rotation = 180
              arcStartAngle = deur.opensNaar === 'binnen' ? 0 : 180
              break
            case 'west':
              rotation = 270
              arcStartAngle = deur.opensNaar === 'binnen' ? 90 : 270
              break
          }

          return (
            <Group key={deur.id}>
              {/* Deuropening (witte onderbreking in muur) */}
              <Rect
                x={x}
                y={y - 3}
                width={breedte}
                height={6}
                fill="#f9f9f9"
              />
              {/* Deur swing arc */}
              {deur.openingsHoek > 0 && (
                <Arc
                  x={x}
                  y={y}
                  innerRadius={0}
                  outerRadius={breedte}
                  angle={deur.openingsHoek}
                  rotation={arcStartAngle}
                  fill="transparent"
                  stroke="#999"
                  strokeWidth={1}
                  dash={[3, 3]}
                />
              )}
              {/* Deur lijn */}
              <Line
                points={[x, y, x + breedte, y]}
                stroke="#666"
                strokeWidth={3}
              />
            </Group>
          )
        })}

        {/* Ramen tekenen */}
        {ramen.map((raam) => {
          const x = raam.x * PIXELS_PER_METER + OFFSET_X
          const y = raam.y * PIXELS_PER_METER + OFFSET_Y
          const breedte = raam.breedte * PIXELS_PER_METER

          // Bepaal oriëntatie
          const isVerticaal = raam.richting === 'oost' || raam.richting === 'west'

          return (
            <Group key={raam.id}>
              {isVerticaal ? (
                // Verticaal raam
                <>
                  <Line
                    points={[x, y, x, y + breedte]}
                    stroke="#4da6ff"
                    strokeWidth={4}
                  />
                  <Line
                    points={[x - 2, y + breedte / 2, x + 2, y + breedte / 2]}
                    stroke="#4da6ff"
                    strokeWidth={2}
                  />
                </>
              ) : (
                // Horizontaal raam
                <>
                  <Line
                    points={[x, y, x + breedte, y]}
                    stroke="#4da6ff"
                    strokeWidth={4}
                  />
                  <Line
                    points={[x + breedte / 2, y - 2, x + breedte / 2, y + 2]}
                    stroke="#4da6ff"
                    strokeWidth={2}
                  />
                </>
              )}
            </Group>
          )
        })}

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
