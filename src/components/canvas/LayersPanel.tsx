import {
  Layers,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Copy,
  ChevronsUp,
  ChevronsDown,
  ChevronUp,
  ChevronDown,
  Type,
  Heading1,
  Minus,
  Square,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react';
import { useResumeStore } from '../../store/useResumeStore';
import type { CanvasLayer } from '../../types/resume';

const inputClass =
  'w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500';

function getLayerIcon(type: CanvasLayer['type']) {
  switch (type) {
    case 'heading':
      return <Heading1 className="w-3.5 h-3.5 text-indigo-500" />;
    case 'text':
      return <Type className="w-3.5 h-3.5 text-blue-500" />;
    case 'divider':
      return <Minus className="w-3.5 h-3.5 text-gray-500" />;
    case 'container':
      return <Square className="w-3.5 h-3.5 text-amber-500" />;
    case 'image':
      return <ImageIcon className="w-3.5 h-3.5 text-emerald-500" />;
  }
}

function getLayerLabel(layer: CanvasLayer): string {
  if (layer.type === 'heading' || layer.type === 'text') {
    const stripped = layer.htmlContent.replace(/<[^>]+>/g, '').trim();
    return stripped ? (stripped.length > 22 ? stripped.substring(0, 22) + '...' : stripped) : layer.type;
  }
  if (layer.type === 'divider') return 'Divider Line';
  if (layer.type === 'container') return 'Container Shape';
  if (layer.type === 'image') return 'Image Box';
  return 'Layer';
}

export default function LayersPanel() {
  const {
    currentProject,
    selectedLayerId,
    setSelectedLayerId,
    updateLayer,
    removeLayer,
    duplicateLayer,
    bringForward,
    sendBackward,
    bringToFront,
    sendToBack,
  } = useResumeStore();

  if (!currentProject) return null;

  const layers = currentProject.canvasLayers;
  // Sort layers by zIndex descending for display in panel
  const sortedLayers = [...layers].sort((a, b) => b.zIndex - a.zIndex);
  const selectedLayer = layers.find((l) => l.id === selectedLayerId);

  return (
    <div className="w-80 shrink-0 border-l border-gray-200 bg-white flex flex-col h-full shadow-xs select-none">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600" />
          <h2 className="text-sm font-semibold text-gray-900">Layers</h2>
        </div>
        <span className="text-xs bg-gray-100 text-gray-600 font-medium px-2 py-0.5 rounded-full">
          {layers.length}
        </span>
      </div>

      {/* Reorder & Action Bar (active when a layer is selected) */}
      {selectedLayer && (
        <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between text-gray-600">
          <div className="flex items-center gap-1">
            <button
              onClick={() => bringToFront(selectedLayer.id)}
              className="p-1 hover:bg-gray-200 rounded text-gray-700"
              title="Bring to Front"
            >
              <ChevronsUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => bringForward(selectedLayer.id)}
              className="p-1 hover:bg-gray-200 rounded text-gray-700"
              title="Bring Forward"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => sendBackward(selectedLayer.id)}
              className="p-1 hover:bg-gray-200 rounded text-gray-700"
              title="Send Backward"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => sendToBack(selectedLayer.id)}
              className="p-1 hover:bg-gray-200 rounded text-gray-700"
              title="Send to Back"
            >
              <ChevronsDown className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => duplicateLayer(selectedLayer.id)}
              className="p-1 hover:bg-gray-200 rounded text-gray-700"
              title="Duplicate Layer"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => removeLayer(selectedLayer.id)}
              className="p-1 hover:bg-red-100 text-red-500 rounded"
              title="Delete Layer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Layers List */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
        {sortedLayers.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs">No elements on canvas.</p>
            <p className="text-[11px] text-gray-400 mt-1">
              Add headings, text, shapes, or load the sample layout.
            </p>
          </div>
        ) : (
          sortedLayers.map((layer) => {
            const isSelected = layer.id === selectedLayerId;
            return (
              <div
                key={layer.id}
                onClick={() => setSelectedLayerId(layer.id)}
                className={`flex items-center gap-2.5 px-3 py-2 text-xs cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-indigo-50/80 text-indigo-900 border-l-3 border-indigo-600'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                {/* Icon */}
                <div className="shrink-0">{getLayerIcon(layer.type)}</div>

                {/* Label */}
                <span className="flex-1 truncate font-medium">
                  {getLayerLabel(layer)}
                </span>

                {/* Visibility */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateLayer(layer.id, { visible: !layer.visible });
                  }}
                  className={`p-1 rounded transition-colors ${
                    layer.visible
                      ? 'text-gray-400 hover:text-gray-600'
                      : 'text-amber-500 bg-amber-50'
                  }`}
                  title={layer.visible ? 'Hide' : 'Show'}
                >
                  {layer.visible ? (
                    <Eye className="w-3.5 h-3.5" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5" />
                  )}
                </button>

                {/* Lock */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateLayer(layer.id, { locked: !layer.locked });
                  }}
                  className={`p-1 rounded transition-colors ${
                    layer.locked
                      ? 'text-amber-600 bg-amber-50'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                  title={layer.locked ? 'Unlock' : 'Lock'}
                >
                  {layer.locked ? (
                    <Lock className="w-3.5 h-3.5" />
                  ) : (
                    <Unlock className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Layer Properties Inspector (when a layer is selected) */}
      {selectedLayer && (
        <div className="border-t border-gray-200 p-3 bg-gray-50 max-h-[300px] overflow-y-auto space-y-3">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            Layer Properties
          </p>

          {/* Position & Size */}
          <div className="grid grid-cols-4 gap-1.5 text-center">
            <div>
              <span className="text-[10px] text-gray-400 font-mono">X</span>
              <input
                type="number"
                className={inputClass}
                value={selectedLayer.x}
                onChange={(e) =>
                  updateLayer(selectedLayer.id, {
                    x: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-mono">Y</span>
              <input
                type="number"
                className={inputClass}
                value={selectedLayer.y}
                onChange={(e) =>
                  updateLayer(selectedLayer.id, {
                    y: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-mono">W</span>
              <input
                type="number"
                className={inputClass}
                value={selectedLayer.width}
                onChange={(e) =>
                  updateLayer(selectedLayer.id, {
                    width: Math.max(10, parseInt(e.target.value) || 10),
                  })
                }
              />
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-mono">H</span>
              <input
                type="number"
                className={inputClass}
                value={selectedLayer.height}
                onChange={(e) =>
                  updateLayer(selectedLayer.id, {
                    height: Math.max(2, parseInt(e.target.value) || 2),
                  })
                }
              />
            </div>
          </div>

          {/* Typography options for text / heading */}
          {(selectedLayer.type === 'text' ||
            selectedLayer.type === 'heading') && (
            <div className="space-y-2 pt-1 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-gray-500 w-16">Font Size:</span>
                <input
                  type="text"
                  placeholder="14px"
                  className={inputClass}
                  value={selectedLayer.style?.fontSize || ''}
                  onChange={(e) =>
                    updateLayer(selectedLayer.id, {
                      style: {
                        ...selectedLayer.style,
                        fontSize: e.target.value,
                      },
                    })
                  }
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-gray-500 w-16">Color:</span>
                <input
                  type="color"
                  className="w-7 h-7 rounded border border-gray-200 cursor-pointer p-0 bg-transparent"
                  value={selectedLayer.style?.color || '#000000'}
                  onChange={(e) =>
                    updateLayer(selectedLayer.id, {
                      style: {
                        ...selectedLayer.style,
                        color: e.target.value,
                      },
                    })
                  }
                />
                <input
                  type="text"
                  className={inputClass}
                  value={selectedLayer.style?.color || ''}
                  onChange={(e) =>
                    updateLayer(selectedLayer.id, {
                      style: {
                        ...selectedLayer.style,
                        color: e.target.value,
                      },
                    })
                  }
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-gray-500 w-16">Align:</span>
                <div className="flex items-center border border-gray-200 rounded overflow-hidden">
                  {(['left', 'center', 'right'] as const).map((align) => (
                    <button
                      key={align}
                      onClick={() =>
                        updateLayer(selectedLayer.id, {
                          style: {
                            ...selectedLayer.style,
                            textAlign: align,
                          },
                        })
                      }
                      className={`p-1.5 transition-colors ${
                        (selectedLayer.style?.textAlign || 'left') === align
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {align === 'left' && <AlignLeft className="w-3 h-3" />}
                      {align === 'center' && (
                        <AlignCenter className="w-3 h-3" />
                      )}
                      {align === 'right' && <AlignRight className="w-3 h-3" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Background & Borders */}
          <div className="space-y-2 pt-1 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-gray-500 w-16">Bg Color:</span>
              <input
                type="color"
                className="w-7 h-7 rounded border border-gray-200 cursor-pointer p-0 bg-transparent"
                value={selectedLayer.style?.backgroundColor || '#ffffff'}
                onChange={(e) =>
                  updateLayer(selectedLayer.id, {
                    style: {
                      ...selectedLayer.style,
                      backgroundColor: e.target.value,
                    },
                  })
                }
              />
              <button
                onClick={() =>
                  updateLayer(selectedLayer.id, {
                    style: {
                      ...selectedLayer.style,
                      backgroundColor: 'transparent',
                    },
                  })
                }
                className="text-[10px] text-gray-500 hover:text-indigo-600 px-1.5 py-0.5 border rounded"
              >
                Clear
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-gray-500 w-16">Radius:</span>
              <input
                type="number"
                placeholder="0"
                className={inputClass}
                value={selectedLayer.style?.borderRadius || 0}
                onChange={(e) =>
                  updateLayer(selectedLayer.id, {
                    style: {
                      ...selectedLayer.style,
                      borderRadius: parseInt(e.target.value) || 0,
                    },
                  })
                }
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-gray-500 w-16">Opacity:</span>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                className="flex-1 accent-indigo-600"
                value={selectedLayer.style?.opacity ?? 1}
                onChange={(e) =>
                  updateLayer(selectedLayer.id, {
                    style: {
                      ...selectedLayer.style,
                      opacity: parseFloat(e.target.value),
                    },
                  })
                }
              />
              <span className="text-[10px] text-gray-500 w-8 text-right">
                {Math.round((selectedLayer.style?.opacity ?? 1) * 100)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
