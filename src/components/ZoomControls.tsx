interface ZoomControlsProps {
  zoom: number
  onZoomIn: () => void
  onZoomOut: () => void
  onZoomReset: () => void
}

export default function ZoomControls({ zoom, onZoomIn, onZoomOut, onZoomReset }: ZoomControlsProps) {
  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-1 bg-white rounded-xl shadow-lg border border-slate-200 p-1.5 z-50">
      {/* Zoom In */}
      <button
        onClick={onZoomIn}
        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        title="Zoom in"
      >
        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
        </svg>
      </button>

      {/* Zoom percentage */}
      <div className="text-xs text-center text-slate-600 py-1.5 font-medium">
        {Math.round(zoom * 100)}%
      </div>

      {/* Zoom Out */}
      <button
        onClick={onZoomOut}
        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        title="Zoom uit"
      >
        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
        </svg>
      </button>

      {/* Divider */}
      <div className="border-t border-slate-200 my-1"></div>

      {/* Reset */}
      <button
        onClick={onZoomReset}
        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        title="Reset zoom"
      >
        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
        </svg>
      </button>
    </div>
  )
}
