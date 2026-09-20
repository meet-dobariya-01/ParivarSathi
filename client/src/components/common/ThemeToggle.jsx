import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Moon, Sun, Eye } from 'lucide-react';

const ThemeToggle = () => {
  const { theme, toggleHighContrast, toggleDarkTheme } = useTheme();

  return (
    <div className="flex items-center gap-1.5" role="group" aria-label="Display Controls">
      {/* High Contrast Toggle Button */}
      <button
        type="button"
        onClick={toggleHighContrast}
        aria-pressed={theme === 'high-contrast'}
        title="Toggle High Contrast Display"
        className={`px-2 py-0.5 text-xs font-semibold rounded inline-flex items-center gap-1 transition-colors focus-visible:ring-2 focus-visible:ring-gov-saffron ${
          theme === 'high-contrast'
            ? 'bg-[#ffff00] text-black font-extrabold border border-black'
            : 'text-white/90 hover:bg-white/20 border border-white/30'
        }`}
      >
        <Eye size={12} aria-hidden="true" />
        <span>High Contrast</span>
      </button>

      {/* Dark / Light Toggle Button */}
      <button
        type="button"
        onClick={toggleDarkTheme}
        aria-pressed={theme === 'dark'}
        title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        className="p-1 rounded text-white/90 hover:bg-white/20 transition-colors focus-visible:ring-2 focus-visible:ring-gov-saffron"
      >
        {theme === 'dark' ? (
          <Sun size={14} aria-label="Switch to Light Theme" />
        ) : (
          <Moon size={14} aria-label="Switch to Dark Theme" />
        )}
      </button>
    </div>
  );
};

export default ThemeToggle;
