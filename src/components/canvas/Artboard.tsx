import React from 'react';
import { A4_WIDTH_PX, A4_HEIGHT_PX } from '../../utils/constants';
import { useResumeStore } from '../../store/useResumeStore';
import LayerItem from './LayerItem';
import GridOverlay from './GridOverlay';

interface ArtboardProps {
  scale: number;
  activePage?: number;
  viewMode?: 'all' | 'single';
}

export default function Artboard({
  scale,
  activePage = 1,
  viewMode = 'all',
}: ArtboardProps) {
  const {
    currentProject,
    selectedLayerId,
    setSelectedLayerId,
    updateLayer,
    showGrid,
    snapToGrid,
    gridSize,
  } = useResumeStore();

  if (!currentProject) return null;

  const layers = currentProject.canvasLayers;

  // Determine total pages in canvas mode
  const maxPageFromLayers = layers.reduce((max, l) => Math.max(max, l.page || 1), 1);
  const totalPages = Math.max(1, maxPageFromLayers);

  // Pages to render
  const pagesToRender = viewMode === 'all'
    ? Array.from({ length: totalPages }, (_, i) => i + 1)
    : [activePage];

  return (
    <>
      {/* Screen Artboards (NO PRINT) */}
      <div className="no-print flex flex-col items-center gap-8 pb-16">
        {pagesToRender.map((pageNum) => {
          const pageLayers = layers.filter((l) => (l.page || 1) === pageNum);

          const handleArtboardClick = (e: React.MouseEvent) => {
            if (e.target === e.currentTarget) {
              setSelectedLayerId(null);
            }
          };

          return (
            <div key={pageNum} className="flex flex-col items-center gap-2">
              {/* Page Header Label (No print) */}
              <div className="no-print flex items-center justify-between w-full px-2 text-xs font-medium text-slate-500">
                <span className="bg-slate-200/80 px-2.5 py-1 rounded-md text-slate-700 shadow-xs border border-slate-300">
                  Page {pageNum} of {totalPages}
                </span>
                <span className="text-[11px] text-slate-400">
                  {pageLayers.length} {pageLayers.length === 1 ? 'element' : 'elements'}
                </span>
              </div>

              {/* Scaled Artboard Wrapper */}
              <div
                style={{
                  width: `${A4_WIDTH_PX * scale}px`,
                  height: `${A4_HEIGHT_PX * scale}px`,
                  transition: 'width 0.15s ease-out, height 0.15s ease-out',
                }}
                className="shrink-0 relative"
              >
                {/* Scaled Sheet */}
                <div
                  id={`resume-canvas-artboard-page-${pageNum}`}
                  onClick={handleArtboardClick}
                  className="bg-white shadow-2xl relative border border-gray-300 origin-top-left overflow-hidden"
                  style={{
                    width: `${A4_WIDTH_PX}px`,
                    height: `${A4_HEIGHT_PX}px`,
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                  }}
                >
                  {/* Snap-to-Grid / Guide Overlay */}
                  <GridOverlay visible={showGrid} gridSize={gridSize} />

                  {/* Canvas Layers for this page */}
                  {pageLayers.map((layer) => (
                    <LayerItem
                      key={layer.id}
                      layer={layer}
                      isSelected={layer.id === selectedLayerId}
                      scale={scale}
                      snapToGrid={snapToGrid}
                      gridSize={gridSize}
                      onSelect={() => setSelectedLayerId(layer.id)}
                      onUpdate={(updates) => updateLayer(layer.id, updates)}
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
