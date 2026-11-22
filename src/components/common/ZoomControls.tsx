import { ZoomIn, ZoomOut, RotateCcw, Maximize2 } from 'lucide-react';

interface ZoomControlsProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onFitWidth?: () => void;
}

export default function ZoomControls({
  zoom,
  onZoomChange,
  onFitWidth,
}: ZoomControlsProps) {
  const zoomPercent = Math.round(zoom * 100);

  const handleZoomIn = () => {
    onZoomChange(Math.min(1.5, Math.round((zoom + 0.1) * 10) / 10));
  };

  const handleZoomOut = () => {
    onZoomChange(Math.max(0.4, Math.round((zoom - 0.1) * 10) / 10));
  };

  const handleReset = () => {
    onZoomChange(1);
  };

  return (
    <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm border border-gray-200/80 shadow-md rounded-xl p-1 text-gray-700">
      <button
        type="button"
        onClick={handleZoomOut}
        disabled={zoom <= 0.4}
        className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 disabled:opacity-40 transition-colors"
        title="Zoom Out"
      >
        <ZoomOut className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={handleReset}
        className="px-2 py-1 text-xs font-semibold hover:bg-gray-100 rounded-lg text-gray-700 min-w-[50px] text-center transition-colors"
        title="Reset Zoom"
      >
        {zoomPercent}%
      </button>

      <button
        type="button"
        onClick={handleZoomIn}
        disabled={zoom >= 1.5}
        className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 disabled:opacity-40 transition-colors"
        title="Zoom In"
      >
        <ZoomIn className="w-4 h-4" />
      </button>

      {onFitWidth && (
        <button
          type="button"
          onClick={onFitWidth}
          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 border-l border-gray-200 ml-0.5 transition-colors"
          title="Fit to Screen"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
