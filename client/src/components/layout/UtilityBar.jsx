import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import FontSizeControl from '../common/FontSizeControl';
import LanguageSwitch from '../common/LanguageSwitch';
import ThemeToggle from '../common/ThemeToggle';
import ScreenReaderModal from '../modals/ScreenReaderModal';
import { Volume2 } from 'lucide-react';

const UtilityBar = () => {
  const { t } = useTranslation();
  const [showScreenReaderModal, setShowScreenReaderModal] = useState(false);

  return (
    <>
      {/* Skip link for keyboard users (WCAG 2.4.1) */}
      <a href="#main-content" className="skip-link">
        {t('utility.skipToContent')}
      </a>

      {/* Top Thin Navy Utility Bar */}
      <div className="bg-[#173059] text-white border-b border-[#2d558d] text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Left: Skip link indicator & Screen reader modal trigger */}
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-block font-semibold tracking-wider text-[11px] text-white/80">
              GUJARAT STATE PORTAL
            </span>
            <span className="hidden sm:inline text-white/30" aria-hidden="true">•</span>
            <button
              type="button"
              onClick={() => setShowScreenReaderModal(true)}
              className="inline-flex items-center gap-1.5 text-white/90 hover:text-white underline underline-offset-2 transition-colors focus-visible:ring-2 focus-visible:ring-gov-saffron rounded px-1"
            >
              <Volume2 size={13} aria-hidden="true" />
              <span>{t('utility.screenReader')}</span>
            </button>
          </div>

          {/* Right: Font Scaler, Theme Toggle, Language Switcher */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 border-r border-white/20 pr-4">
              <span className="text-[11px] text-white/80 hidden md:inline">{t('utility.fontSize')}:</span>
              <FontSizeControl />
            </div>

            <div className="flex items-center gap-2 border-r border-white/20 pr-4">
              <ThemeToggle />
            </div>

            <div>
              <LanguageSwitch />
            </div>
          </div>
        </div>
      </div>

      {/* Screen Reader Modal */}
      <ScreenReaderModal
        isOpen={showScreenReaderModal}
        onClose={() => setShowScreenReaderModal(false)}
      />
    </>
  );
};

export default UtilityBar;
