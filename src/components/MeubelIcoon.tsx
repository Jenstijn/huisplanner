import React from 'react'

interface MeubelIcoonProps {
  type: string
  size?: number
  kleur: string
}

// Helper functies voor kleur manipulatie
const lighten = (hex: string, amount: number = 0.2): string => {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, ((num >> 16) & 0xff) + Math.round(255 * amount))
  const g = Math.min(255, ((num >> 8) & 0xff) + Math.round(255 * amount))
  const b = Math.min(255, (num & 0xff) + Math.round(255 * amount))
  return `rgb(${r}, ${g}, ${b})`
}

const darken = (hex: string, amount: number = 0.2): string => {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.max(0, ((num >> 16) & 0xff) - Math.round(255 * amount))
  const g = Math.max(0, ((num >> 8) & 0xff) - Math.round(255 * amount))
  const b = Math.max(0, (num & 0xff) - Math.round(255 * amount))
  return `rgb(${r}, ${g}, ${b})`
}

// Top-down view iconen
const iconen: Record<string, (kleur: string) => React.ReactNode> = {
  // Bank - rechthoek met kussens
  'bank': (kleur) => (
    <svg viewBox="0 0 32 18" className="w-full h-full">
      <rect x="1" y="3" width="30" height="14" rx="2" fill={kleur} />
      <rect x="2" y="4" width="28" height="4" rx="1" fill={lighten(kleur, 0.15)} />
      <rect x="3" y="9" width="12" height="7" rx="1" fill={lighten(kleur, 0.1)} />
      <rect x="17" y="9" width="12" height="7" rx="1" fill={lighten(kleur, 0.1)} />
    </svg>
  ),

  // Hoekbank - L-vorm
  'hoekbank': (kleur) => (
    <svg viewBox="0 0 28 28" className="w-full h-full">
      <rect x="1" y="1" width="26" height="12" rx="2" fill={kleur} />
      <rect x="1" y="11" width="12" height="16" rx="2" fill={kleur} />
      <rect x="2" y="2" width="24" height="3" rx="1" fill={lighten(kleur, 0.15)} />
      <rect x="2" y="12" width="3" height="14" rx="1" fill={lighten(kleur, 0.15)} />
      <rect x="4" y="6" width="10" height="5" rx="1" fill={lighten(kleur, 0.1)} />
      <rect x="16" y="6" width="10" height="5" rx="1" fill={lighten(kleur, 0.1)} />
      <rect x="4" y="15" width="7" height="10" rx="1" fill={lighten(kleur, 0.1)} />
    </svg>
  ),

  // Fauteuil - vierkant met rugleuning
  'fauteuil': (kleur) => (
    <svg viewBox="0 0 20 20" className="w-full h-full">
      <rect x="2" y="2" width="16" height="16" rx="3" fill={kleur} />
      <rect x="3" y="3" width="14" height="4" rx="1" fill={lighten(kleur, 0.15)} />
      <rect x="4" y="8" width="12" height="10" rx="2" fill={lighten(kleur, 0.1)} />
    </svg>
  ),

  // Chaise Longue Links - bank met verlengd ligdeel links (naar voren uitstekend)
  'chaise-longue-links': (kleur) => (
    <svg viewBox="0 0 32 20" className="w-full h-full">
      {/* Basis zitgedeelte (volledige breedte, bovenaan) */}
      <rect x="1" y="1" width="30" height="10" rx="2" fill={kleur} />
      {/* Verlengd ligdeel links (steekt naar voren/onder uit) */}
      <rect x="1" y="9" width="14" height="10" rx="2" fill={kleur} />
      {/* Rugleuning */}
      <rect x="2" y="2" width="28" height="3" rx="1" fill={lighten(kleur, 0.15)} />
      {/* Kussen zitdeel rechts */}
      <rect x="16" y="5" width="14" height="5" rx="1" fill={lighten(kleur, 0.1)} />
      {/* Kussen ligdeel */}
      <rect x="2" y="5" width="12" height="13" rx="1" fill={lighten(kleur, 0.1)} />
    </svg>
  ),

  // Chaise Longue Rechts - bank met verlengd ligdeel rechts (naar voren uitstekend)
  'chaise-longue-rechts': (kleur) => (
    <svg viewBox="0 0 32 20" className="w-full h-full">
      {/* Basis zitgedeelte (volledige breedte, bovenaan) */}
      <rect x="1" y="1" width="30" height="10" rx="2" fill={kleur} />
      {/* Verlengd ligdeel rechts (steekt naar voren/onder uit) */}
      <rect x="17" y="9" width="14" height="10" rx="2" fill={kleur} />
      {/* Rugleuning */}
      <rect x="2" y="2" width="28" height="3" rx="1" fill={lighten(kleur, 0.15)} />
      {/* Kussen zitdeel links */}
      <rect x="2" y="5" width="14" height="5" rx="1" fill={lighten(kleur, 0.1)} />
      {/* Kussen ligdeel */}
      <rect x="18" y="5" width="12" height="13" rx="1" fill={lighten(kleur, 0.1)} />
    </svg>
  ),

  // Salontafel - rechthoek
  'salontafel': (kleur) => (
    <svg viewBox="0 0 28 16" className="w-full h-full">
      <rect x="2" y="2" width="24" height="12" rx="2" fill={kleur} />
      <circle cx="5" cy="5" r="1.5" fill={darken(kleur, 0.2)} />
      <circle cx="23" cy="5" r="1.5" fill={darken(kleur, 0.2)} />
      <circle cx="5" cy="11" r="1.5" fill={darken(kleur, 0.2)} />
      <circle cx="23" cy="11" r="1.5" fill={darken(kleur, 0.2)} />
    </svg>
  ),

  // Ronde salontafel
  'salontafel-rond': (kleur) => (
    <svg viewBox="0 0 20 20" className="w-full h-full">
      <circle cx="10" cy="10" r="8" fill={kleur} />
      <circle cx="10" cy="10" r="3" fill={darken(kleur, 0.15)} />
    </svg>
  ),

  // Eettafel - rechthoek met poten
  'eettafel': (kleur) => (
    <svg viewBox="0 0 32 20" className="w-full h-full">
      <rect x="2" y="2" width="28" height="16" rx="1" fill={kleur} />
      <circle cx="5" cy="5" r="2" fill={darken(kleur, 0.2)} />
      <circle cx="27" cy="5" r="2" fill={darken(kleur, 0.2)} />
      <circle cx="5" cy="15" r="2" fill={darken(kleur, 0.2)} />
      <circle cx="27" cy="15" r="2" fill={darken(kleur, 0.2)} />
    </svg>
  ),

  // Ronde eettafel
  'eettafel-rond': (kleur) => (
    <svg viewBox="0 0 20 20" className="w-full h-full">
      <circle cx="10" cy="10" r="9" fill={kleur} />
      <circle cx="10" cy="10" r="3" fill={darken(kleur, 0.2)} />
    </svg>
  ),

  // Stoel
  'stoel': (kleur) => (
    <svg viewBox="0 0 16 18" className="w-full h-full">
      <rect x="2" y="8" width="12" height="9" rx="1" fill={kleur} />
      <rect x="3" y="1" width="10" height="7" rx="1" fill={lighten(kleur, 0.15)} />
    </svg>
  ),

  // Bed dubbel
  'bed-dubbel': (kleur) => (
    <svg viewBox="0 0 20 28" className="w-full h-full">
      <rect x="1" y="1" width="18" height="26" rx="2" fill={kleur} />
      <rect x="2" y="2" width="16" height="6" rx="1" fill={lighten(kleur, 0.15)} />
      <rect x="3" y="3" width="6" height="4" rx="1" fill={lighten(kleur, 0.25)} />
      <rect x="11" y="3" width="6" height="4" rx="1" fill={lighten(kleur, 0.25)} />
    </svg>
  ),

  // Bed enkel
  'bed-enkel': (kleur) => (
    <svg viewBox="0 0 14 28" className="w-full h-full">
      <rect x="1" y="1" width="12" height="26" rx="2" fill={kleur} />
      <rect x="2" y="2" width="10" height="6" rx="1" fill={lighten(kleur, 0.15)} />
      <rect x="3" y="3" width="8" height="4" rx="1" fill={lighten(kleur, 0.25)} />
    </svg>
  ),

  // Nachtkastje
  'nachtkastje': (kleur) => (
    <svg viewBox="0 0 16 16" className="w-full h-full">
      <rect x="2" y="2" width="12" height="12" rx="1" fill={kleur} />
      <rect x="4" y="4" width="8" height="4" rx="0.5" fill={lighten(kleur, 0.1)} />
      <rect x="4" y="9" width="8" height="4" rx="0.5" fill={lighten(kleur, 0.1)} />
      <circle cx="8" cy="6" r="1" fill={darken(kleur, 0.2)} />
      <circle cx="8" cy="11" r="1" fill={darken(kleur, 0.2)} />
    </svg>
  ),

  // Kledingkast
  'kledingkast': (kleur) => (
    <svg viewBox="0 0 28 14" className="w-full h-full">
      <rect x="1" y="1" width="26" height="12" rx="1" fill={kleur} />
      <line x1="14" y1="2" x2="14" y2="12" stroke={darken(kleur, 0.2)} strokeWidth="1" />
      <rect x="5" y="5" width="4" height="4" rx="0.5" fill={darken(kleur, 0.1)} />
      <rect x="19" y="5" width="4" height="4" rx="0.5" fill={darken(kleur, 0.1)} />
    </svg>
  ),

  // Bureau
  'bureau': (kleur) => (
    <svg viewBox="0 0 28 16" className="w-full h-full">
      <rect x="1" y="1" width="26" height="14" rx="1" fill={kleur} />
      <rect x="3" y="3" width="8" height="10" rx="0.5" fill={lighten(kleur, 0.1)} />
      <line x1="7" y1="5" x2="7" y2="11" stroke={darken(kleur, 0.15)} strokeWidth="0.5" />
    </svg>
  ),

  // Bureaustoel
  'bureaustoel': (kleur) => (
    <svg viewBox="0 0 16 16" className="w-full h-full">
      <circle cx="8" cy="8" r="6" fill={kleur} />
      <circle cx="8" cy="8" r="4" fill={lighten(kleur, 0.1)} />
      <circle cx="8" cy="8" r="1.5" fill={darken(kleur, 0.2)} />
    </svg>
  ),

  // TV Meubel
  'tv-meubel': (kleur) => (
    <svg viewBox="0 0 32 10" className="w-full h-full">
      <rect x="1" y="1" width="30" height="8" rx="1" fill={kleur} />
      <rect x="3" y="2" width="8" height="6" rx="0.5" fill={lighten(kleur, 0.1)} />
      <rect x="12" y="2" width="8" height="6" rx="0.5" fill={lighten(kleur, 0.1)} />
      <rect x="21" y="2" width="8" height="6" rx="0.5" fill={lighten(kleur, 0.1)} />
    </svg>
  ),

  // Boekenkast
  'boekenkast': (kleur) => (
    <svg viewBox="0 0 24 10" className="w-full h-full">
      <rect x="1" y="1" width="22" height="8" rx="1" fill={kleur} />
      <rect x="3" y="2" width="2" height="6" fill={darken(kleur, 0.1)} />
      <rect x="6" y="2" width="3" height="6" fill={lighten(kleur, 0.1)} />
      <rect x="10" y="2" width="2" height="6" fill={darken(kleur, 0.15)} />
      <rect x="13" y="2" width="4" height="6" fill={lighten(kleur, 0.05)} />
      <rect x="18" y="2" width="3" height="6" fill={darken(kleur, 0.1)} />
    </svg>
  ),

  // Plant
  'plant': (kleur) => (
    <svg viewBox="0 0 16 16" className="w-full h-full">
      <circle cx="8" cy="8" r="7" fill={kleur} />
      <circle cx="5" cy="6" r="2" fill={lighten(kleur, 0.15)} />
      <circle cx="11" cy="6" r="2" fill={lighten(kleur, 0.15)} />
      <circle cx="8" cy="10" r="2.5" fill={lighten(kleur, 0.1)} />
    </svg>
  ),

  // Lamp
  'lamp': (kleur) => (
    <svg viewBox="0 0 16 16" className="w-full h-full">
      <circle cx="8" cy="8" r="6" fill={kleur} opacity="0.3" />
      <circle cx="8" cy="8" r="4" fill={kleur} opacity="0.5" />
      <circle cx="8" cy="8" r="2" fill={kleur} />
    </svg>
  ),

  // Dressoir
  'dressoir': (kleur) => (
    <svg viewBox="0 0 28 10" className="w-full h-full">
      <rect x="1" y="1" width="26" height="8" rx="1" fill={kleur} />
      <rect x="2" y="2" width="11" height="6" rx="0.5" fill={lighten(kleur, 0.1)} />
      <rect x="15" y="2" width="11" height="6" rx="0.5" fill={lighten(kleur, 0.1)} />
      <circle cx="7" cy="5" r="1" fill={darken(kleur, 0.2)} />
      <circle cx="21" cy="5" r="1" fill={darken(kleur, 0.2)} />
    </svg>
  ),

  // Default fallback
  'default': (kleur) => (
    <svg viewBox="0 0 16 16" className="w-full h-full">
      <rect x="2" y="2" width="12" height="12" rx="2" fill={kleur} />
    </svg>
  ),
}

export default function MeubelIcoon({ type, size = 32, kleur }: MeubelIcoonProps) {
  const renderIcon = iconen[type] || iconen['default']
  return (
    <div
      style={{ width: size, height: size }}
      className="flex items-center justify-center overflow-hidden"
    >
      {renderIcon(kleur)}
    </div>
  )
}
