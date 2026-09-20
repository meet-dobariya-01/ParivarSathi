import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const FontSizeControl = () => {
  const { fontSize, decreaseFontSize, resetFontSize, increaseFontSize } = useTheme();

  return (
    <div className="flex items-center gap-1" role="group" aria-label="Text Size Controls">
      <span className="sr-only">Font size:</span>
      <button
        type="button"
        onClick={decreaseFontSize}
        aria-label="Decrease text size"
        aria-pressed={fontSize === 'small'}
        className={`px-1.5 py-0.5 text-xs font-bold rounded transition-colors focus-visible:ring-2 focus-visible:ring-gov-saffron ${
          fontSize === 'small'
            ? 'bg-gov-saffron text-gov-navy-950'
            : 'text-white/90 hover:bg-white/20'
        }`}
      >
        A-
      </button>

      <button
        type="button"
        onClick={resetFontSize}
        aria-label="Default text size"
        aria-pressed={fontSize === 'normal'}
        className={`px-1.5 py-0.5 text-xs font-bold rounded transition-colors focus-visible:ring-2 focus-visible:ring-gov-saffron ${
          fontSize === 'normal'
            ? 'bg-gov-saffron text-gov-navy-950'
            : 'text-white/90 hover:bg-white/20'
        }`}
      >
        A
      </button>

      <button
        type="button"
        onClick={increaseFontSize}
        aria-label="Increase text size"
        aria-pressed={fontSize === 'large' || fontSize === 'xlarge'}
        className={`px-1.5 py-0.5 text-xs font-bold rounded transition-colors focus-visible:ring-2 focus-visible:ring-gov-saffron ${
          fontSize === 'large' || fontSize === 'xlarge'
            ? 'bg-gov-saffron text-gov-navy-950'
            : 'text-white/90 hover:bg-white/20'
        }`}
      >
        A+
      </button>
    </div>
  );
};

export default FontSizeControl;
