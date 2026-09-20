import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSwitch = ({ compact = false }) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'en';

  const languages = [
    { code: 'en', label: 'English', short: 'EN' },
    { code: 'gu', label: 'ગુજરાતી', short: 'ગુજ' },
    { code: 'hi', label: 'हिन्दी', short: 'हि' }
  ];

  const changeLang = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem('i18nextLng', code);
  };

  return (
    <div className="flex items-center gap-1.5" role="group" aria-label="Language Selector">
      <Globe size={13} className="text-white/80 shrink-0" aria-hidden="true" />
      <div className="flex items-center gap-1 text-xs">
        {languages.map((lang, index) => {
          const isActive = currentLang.startsWith(lang.code);
          return (
            <React.Fragment key={lang.code}>
              <button
                type="button"
                onClick={() => changeLang(lang.code)}
                aria-pressed={isActive}
                title={lang.label}
                className={`px-1.5 py-0.5 rounded font-medium transition-colors focus-visible:ring-2 focus-visible:ring-gov-saffron ${
                  isActive
                    ? 'bg-gov-saffron text-gov-navy-950 font-bold'
                    : 'text-white/90 hover:bg-white/20'
                }`}
              >
                {compact ? lang.short : lang.label}
              </button>
              {index < languages.length - 1 && (
                <span className="text-white/40 text-[10px]" aria-hidden="true">|</span>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default LanguageSwitch;
