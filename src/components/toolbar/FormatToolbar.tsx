import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Highlighter,
  List,
  Palette,
  Minus,
  Sparkles,
} from 'lucide-react';
import { useResumeStore } from '../../store/useResumeStore';
import type { CanvasLayer } from '../../types/resume';
import { useState } from 'react';

const FONT_FAMILIES = [
  { label: 'Sans-Serif (System)', value: 'system-ui, sans-serif' },
  { label: 'Serif (Georgia)', value: 'Georgia, serif' },
  { label: 'Times New Roman', value: '"Times New Roman", Times, serif' },
  { label: 'Monospace', value: 'ui-monospace, monospace' },
  { label: 'Inter', value: 'Inter, system-ui, sans-serif' },
  { label: 'Roboto', value: 'Roboto, sans-serif' },
  { label: 'Playfair Display', value: '"Playfair Display", Georgia, serif' },
];

const FONT_SIZES = [
  '9px',
  '10px',
  '11px',
  '12px',
  '13px',
  '14px',
  '16px',
  '18px',
  '20px',
  '24px',
  '28px',
  '32px',
  '36px',
  '42px',
];

const LINE_SPACINGS = [1.2, 1.4, 1.5, 1.6, 1.8, 2.0];

export default function FormatToolbar() {
  const { currentProject, selectedLayerId, updateLayer } = useResumeStore();
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);

  if (!currentProject || !selectedLayerId) return null;

  const layer = currentProject.canvasLayers.find((l) => l.id === selectedLayerId);
  if (!layer || (layer.type !== 'text' && layer.type !== 'heading')) return null;

  const style = layer.style || {};

  const handleUpdateStyle = (updates: Partial<CanvasLayer['style']>) => {
    updateLayer(layer.id, {
      style: {
        ...style,
        ...updates,
      },
    });
  };

  // Toggle bold
  const isBold =
    (style.fontSize && parseInt(style.fontSize) >= 20) ||
    layer.type === 'heading' ||
    layer.htmlContent.includes('<b>') ||
    layer.htmlContent.includes('<strong>');

  const toggleBold = () => {
    if (layer.htmlContent.includes('<strong>')) {
      const replaced = layer.htmlContent
        .replace(/<strong>/gi, '')
        .replace(/<\/strong>/gi, '');
      updateLayer(layer.id, { htmlContent: replaced });
    } else {
      updateLayer(layer.id, {
        htmlContent: `<strong>${layer.htmlContent}</strong>`,
      });
    }
  };

  const toggleItalic = () => {
    if (layer.htmlContent.includes('<em>')) {
      const replaced = layer.htmlContent
        .replace(/<em>/gi, '')
        .replace(/<\/em>/gi, '');
      updateLayer(layer.id, { htmlContent: replaced });
    } else {
      updateLayer(layer.id, {
        htmlContent: `<em>${layer.htmlContent}</em>`,
      });
    }
  };

  const toggleUnderline = () => {
    if (layer.htmlContent.includes('<u>')) {
      const replaced = layer.htmlContent
        .replace(/<u>/gi, '')
        .replace(/<\/u>/gi, '');
      updateLayer(layer.id, { htmlContent: replaced });
    } else {
      updateLayer(layer.id, {
        htmlContent: `<u>${layer.htmlContent}</u>`,
      });
    }
  };

  const toggleBullet = () => {
    if (layer.htmlContent.includes('&bull;') || layer.htmlContent.includes('•')) {
      const replaced = layer.htmlContent
        .replace(/&bull;\s*/gi, '')
        .replace(/•\s*/gi, '');
      updateLayer(layer.id, { htmlContent: replaced });
    } else {
      updateLayer(layer.id, {
        htmlContent: `&bull; ${layer.htmlContent}`,
      });
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-md border border-indigo-100 shadow-xl rounded-xl px-3 py-1.5 flex items-center gap-2 text-gray-700 animate-in fade-in slide-in-from-top-1 z-40">
      {/* Indicator */}
      <span className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-wider">
        <Sparkles className="w-3 h-3 text-indigo-500" />
        Format
      </span>

      {/* Font Family Selector */}
      <select
        value={style.fontFamily || 'system-ui, sans-serif'}
        onChange={(e) => handleUpdateStyle({ fontFamily: e.target.value })}
        className="text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer font-medium"
      >
        {FONT_FAMILIES.map((f) => (
          <option key={f.value} value={f.value}>
            {f.label}
          </option>
        ))}
      </select>

      {/* Font Size Selector */}
      <select
        value={style.fontSize || (layer.type === 'heading' ? '22px' : '12px')}
        onChange={(e) => handleUpdateStyle({ fontSize: e.target.value })}
        className="text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer font-medium w-18"
      >
        {FONT_SIZES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <div className="h-4 w-px bg-gray-200" />

      {/* Bold, Italic, Underline */}
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={toggleBold}
          className={`p-1.5 rounded-lg hover:bg-gray-100 transition-colors ${
            isBold ? 'bg-indigo-100 text-indigo-700' : ''
          }`}
          title="Bold"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={toggleItalic}
          className={`p-1.5 rounded-lg hover:bg-gray-100 transition-colors ${
            layer.htmlContent.includes('<em>') ? 'bg-indigo-100 text-indigo-700' : ''
          }`}
          title="Italic"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={toggleUnderline}
          className={`p-1.5 rounded-lg hover:bg-gray-100 transition-colors ${
            layer.htmlContent.includes('<u>') ? 'bg-indigo-100 text-indigo-700' : ''
          }`}
          title="Underline"
        >
          <UnderlineIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="h-4 w-px bg-gray-200" />

      {/* Text Color Picker */}
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setShowColorPicker(!showColorPicker);
            setShowHighlightPicker(false);
          }}
          className="flex items-center gap-1 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          title="Text Color"
        >
          <Palette className="w-3.5 h-3.5" />
          <span
            className="w-3 h-3 rounded-full border border-gray-300 shrink-0"
            style={{ backgroundColor: style.color || '#000000' }}
          />
        </button>

        {showColorPicker && (
          <div className="absolute top-full mt-1.5 left-0 bg-white border border-gray-200 shadow-xl rounded-xl p-2.5 z-50 flex flex-col gap-2">
            <span className="text-[10px] font-bold text-gray-500 uppercase">Text Color</span>
            <input
              type="color"
              value={style.color || '#000000'}
              onChange={(e) => handleUpdateStyle({ color: e.target.value })}
              className="w-28 h-8 rounded border border-gray-200 cursor-pointer p-0"
            />
            <div className="flex flex-wrap gap-1 w-28">
              {['#0f172a', '#334155', '#64748b', '#4f46e5', '#2563eb', '#dc2626', '#16a34a', '#d97706'].map(
                (c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      handleUpdateStyle({ color: c });
                      setShowColorPicker(false);
                    }}
                    className="w-5 h-5 rounded-full border border-gray-300 hover:scale-110 transition-transform"
                    style={{ backgroundColor: c }}
                  />
                )
              )}
            </div>
          </div>
        )}
      </div>

      {/* Background Highlight */}
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setShowHighlightPicker(!showHighlightPicker);
            setShowColorPicker(false);
          }}
          className="flex items-center gap-1 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          title="Highlight / Background Color"
        >
          <Highlighter className="w-3.5 h-3.5" />
          <span
            className="w-3 h-3 rounded-full border border-gray-300 shrink-0"
            style={{
              backgroundColor: style.backgroundColor || 'transparent',
            }}
          />
        </button>

        {showHighlightPicker && (
          <div className="absolute top-full mt-1.5 left-0 bg-white border border-gray-200 shadow-xl rounded-xl p-2.5 z-50 flex flex-col gap-2">
            <span className="text-[10px] font-bold text-gray-500 uppercase">Highlight</span>
            <input
              type="color"
              value={style.backgroundColor || '#ffffff'}
              onChange={(e) => handleUpdateStyle({ backgroundColor: e.target.value })}
              className="w-28 h-8 rounded border border-gray-200 cursor-pointer p-0"
            />
            <div className="flex flex-wrap gap-1 w-28">
              {['#fef08a', '#bbf7d0', '#fed7aa', '#fbcfe8', '#e0e7ff', '#f1f5f9'].map(
                (c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      handleUpdateStyle({ backgroundColor: c });
                      setShowHighlightPicker(false);
                    }}
                    className="w-5 h-5 rounded-full border border-gray-300 hover:scale-110 transition-transform"
                    style={{ backgroundColor: c }}
                  />
                )
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                handleUpdateStyle({ backgroundColor: 'transparent' });
                setShowHighlightPicker(false);
              }}
              className="text-[10px] text-gray-500 hover:text-indigo-600 border border-gray-200 rounded py-0.5"
            >
              No Highlight
            </button>
          </div>
        )}
      </div>

      <div className="h-4 w-px bg-gray-200" />

      {/* Text Alignment */}
      <div className="flex items-center gap-0.5 bg-gray-100/70 p-0.5 rounded-lg">
        {[
          { align: 'left', icon: <AlignLeft className="w-3.5 h-3.5" /> },
          { align: 'center', icon: <AlignCenter className="w-3.5 h-3.5" /> },
          { align: 'right', icon: <AlignRight className="w-3.5 h-3.5" /> },
          { align: 'justify', icon: <AlignJustify className="w-3.5 h-3.5" /> },
        ].map((item) => (
          <button
            key={item.align}
            type="button"
            onClick={() =>
              handleUpdateStyle({
                textAlign: item.align as CanvasLayer['style']['textAlign'],
              })
            }
            className={`p-1 rounded transition-colors ${
              (style.textAlign || 'left') === item.align
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
            title={`Align ${item.align}`}
          >
            {item.icon}
          </button>
        ))}
      </div>

      <div className="h-4 w-px bg-gray-200" />

      {/* Line Spacing */}
      <select
        value={style.lineHeight || 1.5}
        onChange={(e) =>
          handleUpdateStyle({ lineHeight: parseFloat(e.target.value) })
        }
        className="text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer font-medium w-16"
        title="Line Spacing"
      >
        {LINE_SPACINGS.map((lh) => (
          <option key={lh} value={lh}>
            {lh}x
          </option>
        ))}
      </select>

      {/* Bullet point toggle */}
      <button
        type="button"
        onClick={toggleBullet}
        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
        title="Toggle Bullet Point"
      >
        <List className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
