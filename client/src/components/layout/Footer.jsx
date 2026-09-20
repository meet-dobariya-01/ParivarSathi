import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ScreenReaderModal from '../modals/ScreenReaderModal';
import { PhoneCall, Mail, Clock, ExternalLink } from 'lucide-react';

const Footer = () => {
  const { t } = useTranslation();
  const [screenReaderOpen, setScreenReaderOpen] = useState(false);

  // Useful Government Portals Strip
  const usefulLinks = [
    { name: 'Digital India', url: 'https://www.digitalindia.gov.in' },
    { name: 'DigiLocker', url: 'https://www.digilocker.gov.in' },
    { name: 'UMANG', url: 'https://web.umang.gov.in' },
    { name: 'India.gov.in', url: 'https://www.india.gov.in' },
    { name: 'MyGov Gujarat', url: 'https://gujarat.mygov.in' },
    { name: 'data.gov.in', url: 'https://data.gov.in' }
  ];

  return (
    <footer className="bg-[#15294a] text-white border-t-4 border-gov-saffron mt-auto" role="contentinfo">
      {/* Useful Links Strip (myScheme style) */}
      <div className="bg-[#0f1d35] border-b border-white/10 py-3.5 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <span className="font-bold text-gov-saffron uppercase tracking-wider text-[11px]">
            {t('footer.usefulLinks')}:
          </span>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {usefulLinks.map((item) => (
              <a
                key={item.name}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/80 hover:text-white hover:underline flex items-center gap-1 focus-visible:ring-1 focus-visible:ring-gov-saffron"
              >
                <span>{item.name}</span>
                <ExternalLink size={11} aria-hidden="true" className="opacity-60" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 text-xs">
          {/* Col 1: About ParivarSathi */}
          <div className="lg:col-span-1 space-y-3">
            <div className="font-gujarati text-lg font-bold text-gov-saffron">
              {t('header.portalNameGuj')} / {t('header.portalNameEng')}
            </div>
            <p className="text-white/80 leading-relaxed text-xs">
              {t('header.portalSubtitle')} — Unified family registry platform enabling automated scheme discovery and targeted welfare delivery for every household in Gujarat.
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="font-bold text-sm text-gov-saffron uppercase tracking-wider mb-3">
              {t('footer.quickLinks')}
            </h4>
            <ul className="space-y-2 text-white/85">
              <li>
                <Link to="/faq" className="hover:text-white hover:underline focus-visible:ring-1 focus-visible:ring-gov-saffron">
                  {t('footer.faq')}
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setScreenReaderOpen(true)}
                  className="hover:text-white hover:underline focus-visible:ring-1 focus-visible:ring-gov-saffron text-left"
                >
                  {t('footer.screenReader')}
                </button>
              </li>
              <li>
                <Link to="/grievance" className="hover:text-white hover:underline focus-visible:ring-1 focus-visible:ring-gov-saffron">
                  Lodge Public Grievance
                </Link>
              </li>
              <li>
                <Link to="/find-schemes" className="hover:text-white hover:underline focus-visible:ring-1 focus-visible:ring-gov-saffron">
                  Schemes Directory
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Portal Policies & Guidelines */}
          <div>
            <h4 className="font-bold text-sm text-gov-saffron uppercase tracking-wider mb-3">
              Policies & Help
            </h4>
            <ul className="space-y-2 text-white/85">
              <li>
                <a href="#accessibility" onClick={(e) => { e.preventDefault(); setScreenReaderOpen(true); }} className="hover:text-white hover:underline">
                  {t('footer.accessibility')}
                </a>
              </li>
              <li>
                <span className="text-white/60 cursor-default">{t('footer.disclaimer')}</span>
              </li>
              <li>
                <span className="text-white/60 cursor-default">{t('footer.privacy')}</span>
              </li>
              <li>
                <span className="text-white/60 cursor-default">{t('footer.sitemap')}</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Helpline & Support */}
          <div>
            <h4 className="font-bold text-sm text-gov-saffron uppercase tracking-wider mb-3">
              {t('footer.helplineTitle')}
            </h4>
            <div className="space-y-2.5 text-white/85">
              <div className="flex items-start gap-2">
                <PhoneCall size={14} className="text-gov-green mt-0.5 shrink-0" aria-hidden="true" />
                <div>
                  <div className="font-bold text-white text-sm">1800-233-5500</div>
                  <div className="text-[11px] text-white/70">{t('footer.helplineTollFree')}</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Mail size={14} className="text-gov-saffron mt-0.5 shrink-0" aria-hidden="true" />
                <div className="text-[11px]">
                  support-parivarsathi@gujarat.gov.in
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock size={14} className="text-gov-teal mt-0.5 shrink-0" aria-hidden="true" />
                <div className="text-[11px] text-white/70">
                  {t('footer.helplineHours')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Legal & Timestamp Strip */}
      <div className="bg-[#0b1527] border-t border-white/10 py-3.5 px-4 text-[11px] text-white/70">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div>
            © 2026 Government of Gujarat. {t('footer.copyright')}
          </div>
          <div className="text-white/60 font-mono">
            {t('footer.lastUpdated')}
          </div>
        </div>
      </div>

      <ScreenReaderModal
        isOpen={screenReaderOpen}
        onClose={() => setScreenReaderOpen(false)}
      />
    </footer>
  );
};

export default Footer;
