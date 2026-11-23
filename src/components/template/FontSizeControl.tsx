import { useState, useEffect } from 'react';

interface FontSizeControlProps {
  label: string;
  value?: number;
  defaultValue: number;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  description?: string;
  onChange: (newSize: number) => void;
  onReset?: () => void;
}

/**
 * Directly editable font size stepper control with -, direct numeric input, and +.
 */
export default function FontSizeControl({
  label,
  value,
  defaultValue,
  min = 8,
  max = 48,
  step = 0.5,
  unit = 'px',
  description,
  onChange,
  onReset,
}: FontSizeControlProps) {
  const current = value !== undefined ? value : defaultValue;
  const isCustom = value !== undefined && value !== defaultValue;
  const [inputValue, setInputValue] = useState<string>(String(current));

  useEffect(() => {
    setInputValue(String(current));
  }, [current]);

  const handleDecrease = () => {
    const next = Math.max(min, Number((current - step).toFixed(1)));
    onChange(next);
  };

  const handleIncrease = () => {
    const next = Math.min(max, Number((current + step).toFixed(1)));
    onChange(next);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setInputValue(text);
    const parsed = parseFloat(text);
    if (!isNaN(parsed) && parsed >= min && parsed <= max) {
      onChange(Number(parsed.toFixed(1)));
    }
  };

  const handleBlur = () => {
    const parsed = parseFloat(inputValue);
    if (isNaN(parsed) || parsed < min) {
      onChange(min);
      setInputValue(String(min));
    } else if (parsed > max) {
      onChange(max);
      setInputValue(String(max));
    } else {
      const rounded = Number(parsed.toFixed(1));
      onChange(rounded);
      setInputValue(String(rounded));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleBlur();
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <div className="flex items-center justify-between gap-2 text-xs py-1.5 border-b border-slate-100 last:border-none">
      <div className="min-w-0 pr-1">
        <span className="text-gray-700 font-medium text-[12px] block truncate">
          {label}
        </span>
        {description && (
          <span className="text-[10px] text-gray-400 block -mt-0.5">
            {description}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <div className="flex items-center bg-white border border-gray-300 rounded-md shadow-2xs overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all">
          <button
            type="button"
            onClick={handleDecrease}
            disabled={current <= min}
            className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 text-gray-700 transition-colors font-bold disabled:opacity-25 cursor-pointer text-xs"
            title={`Decrease ${label} size`}
          >
            -
          </button>
          <input
            type="number"
            step={step}
            min={min}
            max={max}
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="w-10 text-center font-semibold text-gray-800 text-[11.5px] bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none px-0.5 cursor-text"
            title={`Directly edit ${label} font size (${unit})`}
          />
          <button
            type="button"
            onClick={handleIncrease}
            disabled={current >= max}
            className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 text-gray-700 transition-colors font-bold disabled:opacity-25 cursor-pointer text-xs"
            title={`Increase ${label} size`}
          >
            +
          </button>
        </div>
        <span className="text-[11px] text-gray-400 select-none w-3 text-right">
          {unit}
        </span>
        {isCustom && onReset && (
          <button
            type="button"
            onClick={onReset}
            className="text-[10.5px] text-indigo-600 hover:text-indigo-800 font-medium underline underline-offset-2 ml-1 cursor-pointer"
            title="Reset to default"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
