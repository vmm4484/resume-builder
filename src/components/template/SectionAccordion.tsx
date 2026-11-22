import { ChevronDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useState, type ReactNode } from 'react';

interface SectionAccordionProps {
  title: string;
  icon: ReactNode;
  defaultOpen?: boolean;
  badge?: string;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  onTitleChange?: (newTitle: string) => void;
  children: ReactNode;
}

export default function SectionAccordion({
  title,
  icon,
  defaultOpen = false,
  badge,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  onTitleChange,
  children,
}: SectionAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-2xs">
      <div className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex-1 flex items-center gap-3 text-left outline-none cursor-pointer"
        >
          <span className="text-gray-500 shrink-0">{icon}</span>
          <span className="font-semibold text-gray-900 text-sm truncate">{title}</span>
          {badge && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-normal shrink-0">
              {badge}
            </span>
          )}
        </button>

        <div className="flex items-center gap-1 shrink-0 ml-2">
          {onMoveUp && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMoveUp();
              }}
              disabled={!canMoveUp}
              className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer"
              title="Move Section Up"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          )}
          {onMoveDown && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMoveDown();
              }}
              disabled={!canMoveDown}
              className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer"
              title="Move Section Down"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 text-gray-400 hover:text-gray-600 rounded cursor-pointer"
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-4">
          {onTitleChange && (
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider shrink-0">
                Heading:
              </span>
              <input
                type="text"
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder="Rename heading (e.g. Career Objective, Professional Experience)..."
                className="flex-1 bg-white border border-gray-200 rounded px-2.5 py-1 text-xs font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          )}
          {children}
        </div>
      )}
    </div>
  );
}
