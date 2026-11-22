import {
  Type,
  Heading1,
  Minus,
  Square,
  Image as ImageIcon,
  Grid,
  Magnet,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useRef } from 'react';
import { useResumeStore } from '../../store/useResumeStore';

export default function CanvasAddElements() {
  const addLayer = useResumeStore((s) => s.addLayer);
  const showGrid = useResumeStore((s) => s.showGrid);
  const setShowGrid = useResumeStore((s) => s.setShowGrid);
  const snapToGrid = useResumeStore((s) => s.snapToGrid);
  const setSnapToGrid = useResumeStore((s) => s.setSnapToGrid);
  const loadSampleCanvasLayers = useResumeStore((s) => s.loadSampleCanvasLayers);
  const currentProject = useResumeStore((s) => s.currentProject);
  const reorderLayers = useResumeStore((s) => s.reorderLayers);

  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleAddHeading = () => {
    addLayer({
      type: 'heading',
      x: 60,
      y: 80,
      width: 400,
      height: 44,
      zIndex: 1,
      htmlContent: 'Section Heading',
      locked: false,
      visible: true,
      style: {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '24px',
        color: '#0f172a',
        textAlign: 'left',
      },
    });
  };

  const handleAddText = () => {
    addLayer({
      type: 'text',
      x: 60,
      y: 130,
      width: 450,
      height: 64,
      zIndex: 1,
      htmlContent: 'Enter your text or description here. Double-click to edit directly.',
      locked: false,
      visible: true,
      style: {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '14px',
        color: '#475569',
        textAlign: 'left',
        lineHeight: 1.5,
      },
    });
  };

  const handleAddDivider = () => {
    addLayer({
      type: 'divider',
      x: 60,
      y: 120,
      width: 674,
      height: 2,
      zIndex: 1,
      htmlContent: '',
      locked: false,
      visible: true,
      style: {
        backgroundColor: '#cbd5e1',
      },
    });
  };

  const handleAddContainer = () => {
    addLayer({
      type: 'container',
      x: 60,
      y: 200,
      width: 320,
      height: 120,
      zIndex: 1,
      htmlContent: '',
      locked: false,
      visible: true,
      style: {
        backgroundColor: '#f1f5f9',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        opacity: 1,
      },
    });
  };

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      addLayer({
        type: 'image',
        x: 60,
        y: 60,
        width: 120,
        height: 120,
        zIndex: 1,
        htmlContent: evt.target?.result as string,
        locked: false,
        visible: true,
        style: {
          borderRadius: 9999,
          borderWidth: 2,
          borderColor: '#e2e8f0',
        },
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleClearAll = () => {
    if (confirm('Clear all canvas layers?')) {
      reorderLayers([]);
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between shadow-xs z-10">
      {/* Add element buttons */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mr-1">
          Add:
        </span>

        <button
          onClick={handleAddHeading}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 border border-gray-200 rounded-lg transition-colors"
          title="Add Heading Box"
        >
          <Heading1 className="w-3.5 h-3.5 text-indigo-500" />
          <span>Heading</span>
        </button>

        <button
          onClick={handleAddText}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 border border-gray-200 rounded-lg transition-colors"
          title="Add Text Block"
        >
          <Type className="w-3.5 h-3.5 text-indigo-500" />
          <span>Text</span>
        </button>

        <button
          onClick={handleAddDivider}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 border border-gray-200 rounded-lg transition-colors"
          title="Add Divider Line"
        >
          <Minus className="w-3.5 h-3.5 text-indigo-500" />
          <span>Divider</span>
        </button>

        <button
          onClick={handleAddContainer}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 border border-gray-200 rounded-lg transition-colors"
          title="Add Background Shape / Card"
        >
          <Square className="w-3.5 h-3.5 text-indigo-500" />
          <span>Container</span>
        </button>

        <button
          onClick={() => imageInputRef.current?.click()}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 border border-gray-200 rounded-lg transition-colors"
          title="Upload &amp; Add Image"
        >
          <ImageIcon className="w-3.5 h-3.5 text-indigo-500" />
          <span>Image</span>
        </button>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageFile}
          className="hidden"
        />
      </div>

      {/* Grid & Alignment tools */}
      <div className="flex items-center gap-2">
        {/* Toggle Grid */}
        <button
          onClick={() => setShowGrid(!showGrid)}
          className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
            showGrid
              ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
          title="Toggle Gridlines Overlay"
        >
          <Grid className="w-3.5 h-3.5" />
          <span>Grid</span>
        </button>

        {/* Toggle Snap to Grid */}
        <button
          onClick={() => setSnapToGrid(!snapToGrid)}
          className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
            snapToGrid
              ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
          title="Toggle Snap-to-Grid (10px)"
        >
          <Magnet className="w-3.5 h-3.5" />
          <span>Snap</span>
        </button>

        <div className="h-4 w-px bg-gray-200" />

        {/* Sample Canvas Template */}
        <button
          onClick={loadSampleCanvasLayers}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
          title="Load pre-built A4 resume canvas template"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Load Sample Layout</span>
        </button>

        {currentProject && currentProject.canvasLayers.length > 0 && (
          <button
            onClick={handleClearAll}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Clear all canvas layers"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
