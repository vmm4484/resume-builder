import { A4_WIDTH_PX, A4_HEIGHT_PX } from '../../utils/constants';

interface GridOverlayProps {
  visible: boolean;
  gridSize?: number;
}

export default function GridOverlay({
  visible,
  gridSize = 20,
}: GridOverlayProps) {
  if (!visible) return null;

  return (
    <div
      className="no-print absolute inset-0 pointer-events-none z-10"
      style={{
        width: `${A4_WIDTH_PX}px`,
        height: `${A4_HEIGHT_PX}px`,
        backgroundImage: `
          linear-gradient(to right, rgba(99, 102, 241, 0.08) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(99, 102, 241, 0.08) 1px, transparent 1px)
        `,
        backgroundSize: `${gridSize}px ${gridSize}px`,
      }}
    >
      {/* 40px Margin guide borders (subtle dashed line) */}
      <div
        className="absolute border border-dashed border-indigo-400/30 pointer-events-none"
        style={{
          top: 40,
          left: 40,
          right: 40,
          bottom: 40,
        }}
      />
    </div>
  );
}
