import { Rnd } from 'react-rnd';
import type { CanvasLayer } from '../../types/resume';
import { Lock, Image as ImageIcon } from 'lucide-react';
import React, { useRef, useState } from 'react';

interface LayerItemProps {
  layer: CanvasLayer;
  isSelected: boolean;
  scale: number;
  snapToGrid: boolean;
  gridSize: number;
  onSelect: (e: React.MouseEvent) => void;
  onUpdate: (updates: Partial<CanvasLayer>) => void;
}

export default function LayerItem({
  layer,
  isSelected,
  scale,
  snapToGrid,
  gridSize,
  onSelect,
  onUpdate,
}: LayerItemProps) {
  const [isEditingText, setIsEditingText] = useState(false);
  const textInputRef = useRef<HTMLDivElement>(null);

  if (!layer.visible) return null;

  const style = layer.style || {};

  const handleDragStop = (
    _e: any,
    d: { x: number; y: number }
  ) => {
    onUpdate({ x: Math.round(d.x), y: Math.round(d.y) });
  };

  const handleResizeStop = (
    _e: any,
    _direction: any,
    ref: HTMLElement,
    _delta: any,
    position: { x: number; y: number }
  ) => {
    onUpdate({
      width: Math.round(ref.offsetWidth),
      height: Math.round(ref.offsetHeight),
      x: Math.round(position.x),
      y: Math.round(position.y),
    });
  };

  const handleDoubleClick = () => {
    if (layer.type === 'text' || layer.type === 'heading') {
      setIsEditingText(true);
      setTimeout(() => {
        textInputRef.current?.focus();
      }, 50);
    }
  };

  const handleBlurText = () => {
    setIsEditingText(false);
    if (textInputRef.current) {
      onUpdate({ htmlContent: textInputRef.current.innerHTML });
    }
  };

  return (
    <Rnd
      size={{ width: layer.width, height: layer.height }}
      position={{ x: layer.x, y: layer.y }}
      scale={scale}
      bounds="parent"
      disableDragging={layer.locked || isEditingText}
      enableResizing={
        !layer.locked && !isEditingText
          ? {
              top: isSelected,
              right: isSelected,
              bottom: isSelected,
              left: isSelected,
              topRight: isSelected,
              bottomRight: isSelected,
              bottomLeft: isSelected,
              topLeft: isSelected,
            }
          : false
      }
      dragGrid={snapToGrid ? [gridSize, gridSize] : [1, 1]}
      resizeGrid={snapToGrid ? [gridSize, gridSize] : [1, 1]}
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
      style={{
        zIndex: layer.zIndex,
      }}
      className={`group select-none ${
        isSelected
          ? 'ring-2 ring-indigo-500 ring-offset-0'
          : 'hover:ring-1 hover:ring-indigo-300'
      }`}
      onClick={(e: React.MouseEvent) => {
        e.stopPropagation();
        onSelect(e);
      }}
      onDoubleClick={handleDoubleClick}
    >
      {/* Selection handle indicators */}
      {isSelected && (
        <div className="no-print">
          <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-indigo-600 rounded-sm pointer-events-none z-30" />
          <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-indigo-600 rounded-sm pointer-events-none z-30" />
          <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-indigo-600 rounded-sm pointer-events-none z-30" />
          <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-indigo-600 rounded-sm pointer-events-none z-30" />
        </div>
      )}

      {/* Lock badge */}
      {layer.locked && isSelected && (
        <div className="no-print absolute -top-6 right-0 bg-gray-900 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 shadow">
          <Lock className="w-2.5 h-2.5" /> Locked
        </div>
      )}

      {/* Layer Content */}
      <div
        className="w-full h-full relative overflow-hidden"
        style={{
          backgroundColor: style.backgroundColor || 'transparent',
          color: style.color || '#1e293b',
          fontFamily: style.fontFamily || 'inherit',
          fontSize: style.fontSize || (layer.type === 'heading' ? '20px' : '12px'),
          textAlign: style.textAlign || 'left',
          lineHeight: style.lineHeight || 1.5,
          letterSpacing: style.letterSpacing || 'normal',
          padding: `${style.padding || 0}px`,
          borderWidth: `${style.borderWidth || 0}px`,
          borderColor: style.borderColor || 'transparent',
          borderStyle: (style.borderWidth || 0) > 0 ? 'solid' : 'none',
          borderRadius: `${style.borderRadius || 0}px`,
          opacity: style.opacity ?? 1,
        }}
      >
        {layer.type === 'container' && (
          <div className="w-full h-full" />
        )}

        {layer.type === 'divider' && (
          <div
            className="w-full h-full"
            style={{
              backgroundColor: style.backgroundColor || style.borderColor || '#cbd5e1',
            }}
          />
        )}

        {layer.type === 'image' && (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 overflow-hidden">
            {layer.htmlContent ? (
              <img
                src={layer.htmlContent}
                alt="Layer image"
                className="w-full h-full object-cover pointer-events-none"
              />
            ) : (
              <div className="text-gray-400 flex flex-col items-center gap-1 p-2 text-center">
                <ImageIcon className="w-6 h-6" />
                <span className="text-[10px]">Double-click to set image</span>
              </div>
            )}
          </div>
        )}

        {(layer.type === 'text' || layer.type === 'heading') && (
          <div
            ref={textInputRef}
            contentEditable={isEditingText}
            suppressContentEditableWarning
            onInput={() => {
              if (textInputRef.current) {
                onUpdate({ htmlContent: textInputRef.current.innerHTML });
              }
            }}
            onBlur={handleBlurText}
            className={`w-full h-full outline-none break-words rich-text-content ${
              isEditingText ? 'cursor-text ring-1 ring-indigo-400 p-1 bg-white/40' : ''
            }`}
            dangerouslySetInnerHTML={{ __html: layer.htmlContent }}
          />
        )}
      </div>
    </Rnd>
  );
}
