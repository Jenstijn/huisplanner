import { useState, useEffect, useRef } from 'react'
import { Group, Rect, Ellipse, Line } from 'react-konva'
import Konva from 'konva'

interface AirfryerEasterEggProps {
  x: number
  y: number
  pixelsPerMeter: number
  rotatie?: number  // Rotatie in graden (default 0)
}

// Airfryer staat op het aanrecht in de keuken
export default function AirfryerEasterEgg({ x, y, pixelsPerMeter, rotatie = 0 }: AirfryerEasterEggProps) {
  const [frikadelVisible, setFrikadelVisible] = useState(false)
  const frikadelRef = useRef<Konva.Group>(null)

  // Schaal voor de airfryer (in meters, dan omzetten naar pixels)
  const airfryerBreedte = 0.30 * pixelsPerMeter  // 30cm breed
  const airfryerHoogte = 0.25 * pixelsPerMeter   // 25cm diep
  const frikadelBreedte = 0.06 * pixelsPerMeter  // 6cm breed (groter!)
  const frikadelHoogte = 0.18 * pixelsPerMeter   // 18cm lang (groter!)

  // Random interval voor frikadel (tussen 2 en 5 minuten)
  useEffect(() => {
    const scheduleNextFrikadel = () => {
      // Random tijd tussen 2-5 minuten (120.000 - 300.000 ms)
      // Voor testen: 10-30 seconden
      const minDelay = 10000  // 10 seconden (voor development)
      const maxDelay = 30000  // 30 seconden (voor development)
      // const minDelay = 120000  // 2 minuten (voor productie)
      // const maxDelay = 300000  // 5 minuten (voor productie)

      const delay = Math.random() * (maxDelay - minDelay) + minDelay

      return setTimeout(() => {
        launchFrikadel()
        // Schedule de volgende
        const nextTimer = scheduleNextFrikadel()
        return () => clearTimeout(nextTimer)
      }, delay)
    }

    const timer = scheduleNextFrikadel()
    return () => clearTimeout(timer)
  }, [])

  // Frikadel animatie - vliegt naar links (negatieve x richting)
  const launchFrikadel = () => {
    setFrikadelVisible(true)

    // Start animatie na korte delay (zodat component gerenderd is)
    setTimeout(() => {
      if (frikadelRef.current) {
        // Reset positie
        frikadelRef.current.x(airfryerBreedte / 2)
        frikadelRef.current.y(airfryerHoogte / 2)
        frikadelRef.current.rotation(0)
        frikadelRef.current.opacity(1)

        // Animatie: spring naar links, draai, verdwijn
        const tween = new Konva.Tween({
          node: frikadelRef.current,
          duration: 1.5,
          x: -60,  // Spring 60px naar links (van aanrecht af)
          y: airfryerHoogte / 2 - 30,  // Een beetje omhoog
          rotation: 720,  // 2 volledige rotaties
          easing: Konva.Easings.EaseOut,
          onFinish: () => {
            // Val terug animatie
            if (frikadelRef.current) {
              new Konva.Tween({
                node: frikadelRef.current,
                duration: 0.8,
                x: -80,  // Verder naar links
                y: airfryerHoogte / 2 + 20,  // Val naar beneden
                opacity: 0,
                easing: Konva.Easings.EaseIn,
                onFinish: () => {
                  setFrikadelVisible(false)
                }
              }).play()
            }
          }
        })
        tween.play()
      }
    }, 50)
  }

  return (
    <Group
      x={x}
      y={y}
      rotation={rotatie}
      offsetX={airfryerBreedte / 2}
      offsetY={airfryerHoogte / 2}
    >
      {/* Airfryer body */}
      <Rect
        x={0}
        y={0}
        width={airfryerBreedte}
        height={airfryerHoogte}
        fill="#2d2d2d"
        cornerRadius={4}
        stroke="#1a1a1a"
        strokeWidth={1}
      />

      {/* Airfryer deksel/bovenkant */}
      <Rect
        x={2}
        y={2}
        width={airfryerBreedte - 4}
        height={airfryerHoogte * 0.4}
        fill="#404040"
        cornerRadius={3}
      />

      {/* Ventilatie roostertje */}
      <Line
        points={[
          airfryerBreedte * 0.3, airfryerHoogte * 0.15,
          airfryerBreedte * 0.7, airfryerHoogte * 0.15
        ]}
        stroke="#555"
        strokeWidth={2}
      />
      <Line
        points={[
          airfryerBreedte * 0.3, airfryerHoogte * 0.25,
          airfryerBreedte * 0.7, airfryerHoogte * 0.25
        ]}
        stroke="#555"
        strokeWidth={2}
      />

      {/* Handvat */}
      <Rect
        x={airfryerBreedte * 0.35}
        y={-4}
        width={airfryerBreedte * 0.3}
        height={6}
        fill="#1a1a1a"
        cornerRadius={2}
      />

      {/* LED indicator (groen = aan) */}
      <Ellipse
        x={airfryerBreedte * 0.85}
        y={airfryerHoogte * 0.7}
        radiusX={3}
        radiusY={3}
        fill="#00ff00"
        shadowColor="#00ff00"
        shadowBlur={5}
        shadowOpacity={0.8}
      />

      {/* Frikadel (alleen zichtbaar tijdens animatie) */}
      {frikadelVisible && (
        <Group
          ref={frikadelRef}
          x={airfryerBreedte / 2}
          y={airfryerHoogte / 2}
          offsetX={frikadelBreedte / 2}
          offsetY={frikadelHoogte / 2}
        >
          {/* Frikadel vorm - bruine capsule */}
          <Ellipse
            x={frikadelBreedte / 2}
            y={frikadelHoogte / 2}
            radiusX={frikadelBreedte / 2}
            radiusY={frikadelHoogte / 2}
            fill="#8B4513"  // Saddle brown
            stroke="#5D2E0C"
            strokeWidth={1}
          />
          {/* Grill streepjes op de frikadel */}
          <Line
            points={[
              frikadelBreedte * 0.3, frikadelHoogte * 0.3,
              frikadelBreedte * 0.7, frikadelHoogte * 0.3
            ]}
            stroke="#3d1f0a"
            strokeWidth={1}
          />
          <Line
            points={[
              frikadelBreedte * 0.25, frikadelHoogte * 0.5,
              frikadelBreedte * 0.75, frikadelHoogte * 0.5
            ]}
            stroke="#3d1f0a"
            strokeWidth={1}
          />
          <Line
            points={[
              frikadelBreedte * 0.3, frikadelHoogte * 0.7,
              frikadelBreedte * 0.7, frikadelHoogte * 0.7
            ]}
            stroke="#3d1f0a"
            strokeWidth={1}
          />
        </Group>
      )}
    </Group>
  )
}
