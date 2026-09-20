import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Badge from '../common/Badge';
import Button from '../common/Button';
import {
  ShieldCheck, Printer, Edit3, Sparkles, MapPin,
  IndianRupee, User, Copy, Check, QrCode
} from 'lucide-react';

const FamilyIdCard = ({
  family,
  head,
  onEditFamily,
  onFindBenefits,
  className = ''
}) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  if (!family) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(family.family_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`printable-card bg-white border-2 border-gov-navy rounded-lg shadow-gov overflow-hidden ${className}`}>
      {/* Official Government Card Top Banner */}
      <div className="bg-gov-navy text-white px-6 py-3 flex flex-wrap items-center justify-between gap-3 border-b-2 border-gov-saffron">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-gov-saffron"></div>
          <span className="text-xs font-bold uppercase tracking-widest text-gov-saffron">
            {t('dashboard.familyIdCard')}
          </span>
          <span className="text-white/40">•</span>
          <span className="text-[11px] text-white/80 font-medium">
            Government of Gujarat • કૌટુંબિક ઓળખપત્ર
          </span>
        </div>

        <Badge variant="verified" size="sm">
          <ShieldCheck size={13} aria-hidden="true" />
          {t('dashboard.verified')}
        </Badge>
      </div>

      {/* Card Body */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Main Details (8 cols) */}
          <div className="md:col-span-8 space-y-4">
            <div>
              <div className="text-xs font-bold text-gov-navy uppercase tracking-wider mb-1">
                Unified Family Identification Number (UFID)
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-2xl sm:text-3xl font-extrabold text-gov-navy tracking-wider bg-blue-50 px-3 py-1 rounded border border-blue-200">
                  {family.family_id}
                </span>
                <button
                  type="button"
                  onClick={handleCopyId}
                  title="Copy Family ID"
                  aria-label="Copy Family ID to clipboard"
                  className="no-print p-2 text-gov-navy hover:bg-slate-100 rounded border border-gov-border focus-visible:ring-2 focus-visible:ring-gov-navy"
                >
                  {copied ? (
                    <Check size={16} className="text-gov-green" />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 text-xs">
              <div className="flex items-start gap-2.5">
                <User size={16} className="text-gov-navy shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-gov-text-muted">{t('dashboard.headOfFamily')}</div>
                  <div className="font-bold text-gov-text text-sm">{head?.name || 'Assigned Head'}</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <IndianRupee size={16} className="text-gov-green shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-gov-text-muted">{t('dashboard.annualIncome')}</div>
                  <div className="font-bold text-gov-green text-sm">
                    ₹{Number(family.annual_income || 0).toLocaleString('en-IN')} / year
                  </div>
                </div>
              </div>

              <div className="sm:col-span-2 flex items-start gap-2.5 pt-1">
                <MapPin size={16} className="text-gov-saffron shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-gov-text-muted">{t('dashboard.locality')}</div>
                  <div className="font-medium text-gov-text">
                    {family.address ? `${family.address}, ` : ''}
                    {family.village}, {family.taluka}, {family.district}, Gujarat
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* QR Code & Verification Block (4 cols) */}
          <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-slate-50 border border-gov-border rounded-md text-center">
            {/* SVG QR Code Simulation with Center Emblem */}
            <div className="bg-white p-2.5 rounded border border-slate-300 shadow-sm relative mb-2">
              <svg className="w-28 h-28" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* QR Pattern */}
                <rect width="100" height="100" fill="white" />
                {/* Corner Finder 1 */}
                <rect x="5" y="5" width="25" height="25" stroke="#1a3a6b" strokeWidth="4" fill="none" />
                <rect x="11" y="11" width="13" height="13" fill="#1a3a6b" />
                {/* Corner Finder 2 */}
                <rect x="70" y="5" width="25" height="25" stroke="#1a3a6b" strokeWidth="4" fill="none" />
                <rect x="76" y="11" width="13" height="13" fill="#1a3a6b" />
                {/* Corner Finder 3 */}
                <rect x="5" y="70" width="25" height="25" stroke="#1a3a6b" strokeWidth="4" fill="none" />
                <rect x="11" y="76" width="13" height="13" fill="#1a3a6b" />
                {/* Data Matrix Dots */}
                <rect x="36" y="8" width="6" height="6" fill="#1a3a6b" />
                <rect x="48" y="14" width="6" height="6" fill="#1a3a6b" />
                <rect x="58" y="8" width="6" height="6" fill="#1a3a6b" />
                <rect x="8" y="36" width="6" height="6" fill="#1a3a6b" />
                <rect x="18" y="44" width="6" height="6" fill="#1a3a6b" />
                <rect x="36" y="36" width="28" height="28" fill="#ff9933" rx="4" />
                <text x="50" y="54" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold">GJ</text>
                <rect x="74" y="38" width="6" height="6" fill="#1a3a6b" />
                <rect x="84" y="46" width="6" height="6" fill="#1a3a6b" />
                <rect x="38" y="74" width="6" height="6" fill="#1a3a6b" />
                <rect x="48" y="82" width="6" height="6" fill="#1a3a6b" />
                <rect x="62" y="74" width="6" height="6" fill="#1a3a6b" />
                <rect x="74" y="80" width="6" height="6" fill="#1a3a6b" />
                <rect x="84" y="74" width="6" height="6" fill="#1a3a6b" />
              </svg>
            </div>
            <span className="text-[11px] font-bold text-gov-navy uppercase tracking-wider">
              Scan to Verify Household
            </span>
            <span className="text-[10px] text-gov-text-muted mt-0.5">
              Secure e-Pramaan Token Active
            </span>
          </div>
        </div>

        {/* Action Buttons (Hidden when Printing) */}
        <div className="no-print mt-6 pt-4 border-t border-gov-border flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={Printer}
              onClick={handlePrint}
            >
              {t('dashboard.printCard')}
            </Button>

            {onEditFamily && (
              <Button
                variant="secondary"
                size="sm"
                icon={Edit3}
                onClick={onEditFamily}
              >
                {t('dashboard.editFamily')}
              </Button>
            )}
          </div>

          {onFindBenefits && (
            <Button
              variant="saffron"
              size="sm"
              icon={Sparkles}
              onClick={onFindBenefits}
            >
              {t('dashboard.findBenefits')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FamilyIdCard;
