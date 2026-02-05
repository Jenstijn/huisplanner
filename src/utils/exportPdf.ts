import jsPDF from 'jspdf'

/**
 * Exporteer een Konva Stage naar PDF.
 * Gebruikt de ingebouwde toDataURL van Konva voor betere kwaliteit.
 */
export async function exportStageToPdf(
  stageRef: React.RefObject<any>,
  layoutNaam: string = 'Plattegrond'
): Promise<void> {
  const stage = stageRef.current
  if (!stage) {
    throw new Error('Stage reference is niet beschikbaar')
  }

  // Krijg de huidige stage dimensies
  const stageWidth = stage.width()
  const stageHeight = stage.height()

  // Sla huidige transformatie op
  const originalScale = { x: stage.scaleX(), y: stage.scaleY() }
  const originalPosition = { x: stage.x(), y: stage.y() }

  // Reset naar 1:1 schaal voor export (geen zoom)
  stage.scale({ x: 1, y: 1 })
  stage.position({ x: 0, y: 0 })

  // Exporteer stage als high-res afbeelding
  const pixelRatio = 2 // 2x resolutie voor scherpe print
  const dataUrl = stage.toDataURL({
    pixelRatio,
    mimeType: 'image/png',
    quality: 1
  })

  // Herstel originele transformatie
  stage.scale(originalScale)
  stage.position(originalPosition)

  // Maak PDF (A4 landscape past beter bij plattegronden)
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  })

  // A4 landscape dimensies in mm
  const pageWidth = 297
  const pageHeight = 210

  // Bereken schaal om afbeelding passend te maken met marges
  const margin = 10
  const availableWidth = pageWidth - (margin * 2)
  const availableHeight = pageHeight - (margin * 2) - 15 // Extra ruimte voor titel

  const imageAspect = stageWidth / stageHeight
  const pageAspect = availableWidth / availableHeight

  let imgWidth: number
  let imgHeight: number

  if (imageAspect > pageAspect) {
    // Afbeelding is breder dan pagina verhoudingsgewijs
    imgWidth = availableWidth
    imgHeight = availableWidth / imageAspect
  } else {
    // Afbeelding is hoger dan pagina verhoudingsgewijs
    imgHeight = availableHeight
    imgWidth = availableHeight * imageAspect
  }

  // Centreer afbeelding
  const x = margin + (availableWidth - imgWidth) / 2
  const y = margin + 10 // Ruimte voor titel

  // Voeg titel toe
  pdf.setFontSize(16)
  pdf.setFont('helvetica', 'bold')
  pdf.text(layoutNaam, pageWidth / 2, margin + 5, { align: 'center' })

  // Voeg datum toe
  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'normal')
  const datum = new Date().toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
  pdf.text(`Geëxporteerd op ${datum}`, pageWidth / 2, margin + 10, { align: 'center' })

  // Voeg afbeelding toe
  pdf.addImage(dataUrl, 'PNG', x, y, imgWidth, imgHeight)

  // Voeg footer toe
  pdf.setFontSize(8)
  pdf.setTextColor(128)
  pdf.text('Gemaakt met Huisplanner', pageWidth / 2, pageHeight - 5, { align: 'center' })

  // Download PDF
  const fileName = `${layoutNaam.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
  pdf.save(fileName)
}

/**
 * Alternatieve export functie die html2canvas gebruikt.
 * Handig als backup of voor HTML elementen buiten Konva.
 */
export async function exportElementToPdf(
  element: HTMLElement,
  layoutNaam: string = 'Plattegrond'
): Promise<void> {
  // Dynamisch importeren om bundle size te beperken
  const html2canvas = (await import('html2canvas')).default

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff'
  })

  const imgData = canvas.toDataURL('image/png')

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  })

  const pageWidth = 297
  const pageHeight = 210
  const margin = 10

  // Bereken schaal
  const imgWidth = pageWidth - (margin * 2)
  const imgHeight = (canvas.height * imgWidth) / canvas.width

  // Voeg titel toe
  pdf.setFontSize(16)
  pdf.setFont('helvetica', 'bold')
  pdf.text(layoutNaam, pageWidth / 2, margin + 5, { align: 'center' })

  // Voeg afbeelding toe
  pdf.addImage(imgData, 'PNG', margin, margin + 10, imgWidth, Math.min(imgHeight, pageHeight - margin - 15))

  // Download
  const fileName = `${layoutNaam.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
  pdf.save(fileName)
}
