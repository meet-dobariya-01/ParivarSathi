import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchPublicPortalStats, fetchPublicSchemes } from '../api/client';
import PortalLayout from '../components/layout/PortalLayout';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import {
  Search, Shield, Users, Layers, Award, Bell,
  Sparkles, FileText, ArrowRight, UserPlus, CheckCircle2,
  ExternalLink, ChevronRight, HelpCircle
} from 'lucide-react';

const LandingPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    familiesRegistered: 124890,
    schemesLinked: 46,
    benefitsDisbursed: '₹342.8 Cr',
    missedBenefitsFound: 84320
  });

  const [schemes, setSchemes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadPortalData = async () => {
      const statsData = await fetchPublicPortalStats();
      setStats(statsData);

      const schemesData = await fetchPublicSchemes();
      setSchemes(schemesData);
    };
    loadPortalData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    // Navigate to schemes or dashboard if logged in
    navigate(`/find-schemes?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const categories = ['All', 'Agriculture', 'Education', 'Health', 'Women & Child', 'Social Welfare', 'Housing'];

  const filteredSchemes = schemes.filter((s) => {
    if (selectedCategory !== 'All' && s.category !== selectedCategory) return false;
    if (searchQuery) {
      return (
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.name_gu && s.name_gu.includes(searchQuery))
      );
    }
    return true;
  });

  return (
    <PortalLayout>
      <div className="space-y-8">
        {/* 1. Official "What's New" Notice Ticker */}
        <section aria-label="Portal Announcements" className="bg-white border border-gov-border rounded-md shadow-gov-sm overflow-hidden flex items-center">
          <div className="bg-gov-navy text-white px-3.5 py-2 flex items-center gap-1.5 shrink-0 text-xs font-bold uppercase tracking-wider">
            <Bell size={14} className="text-gov-saffron animate-bounce" aria-hidden="true" />
            <span className="hidden sm:inline">{t('home.whatsNew')}</span>
            <span className="sm:hidden">Alerts</span>
          </div>

          <div className="ticker-wrap flex-1 px-4 py-2 text-xs text-gov-navy font-medium overflow-hidden">
            <div className="ticker-content space-x-12">
              <span>• {t('home.ticker1')}</span>
              <span>• {t('home.ticker2')}</span>
              <span>• {t('home.ticker3')}</span>
            </div>
          </div>
        </section>

        {/* 2. Hero Section with Family ID Search */}
        <section
          aria-labelledby="hero-title"
          className="bg-gradient-to-br from-gov-navy-900 via-gov-navy-800 to-gov-navy text-white rounded-lg p-6 sm:p-10 border-2 border-gov-saffron shadow-lg relative overflow-hidden"
        >
          {/* Subtle watermark background emblem */}
          <div className="absolute right-4 -bottom-10 opacity-5 pointer-events-none select-none">
            <Shield size={360} />
          </div>

          <div className="max-w-3xl relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-3 py-1 rounded-full text-xs font-semibold text-gov-saffron">
              <Shield size={13} aria-hidden="true" />
              <span>Gujarat Unified Household Registry • એક કુટુંબ, એક ઓળખ</span>
            </div>

            <h1 id="hero-title" className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              {t('home.heroTitle')}
            </h1>

            <p className="text-sm sm:text-base text-white/90 leading-relaxed max-w-2xl">
              {t('home.heroSubtitle')}
            </p>

            {/* Family ID Search Form */}
            <form onSubmit={handleSearch} className="pt-2 max-w-xl">
              <div className="flex flex-col sm:flex-row gap-2 bg-white p-1.5 rounded-md shadow-lg border border-white/30">
                <div className="flex-1 flex items-center px-3 gap-2">
                  <Search size={18} className="text-slate-400 shrink-0" aria-hidden="true" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('home.searchPlaceholder')}
                    className="w-full text-sm text-gov-text outline-none bg-transparent placeholder:text-slate-400 py-2"
                    aria-label="Search Family ID or Scheme"
                  />
                </div>
                <Button
                  type="submit"
                  variant="saffron"
                  size="md"
                  className="shrink-0"
                >
                  {t('home.searchBtn')}
                </Button>
              </div>
            </form>
          </div>
        </section>

        {/* 3. 3 Animated-Free Government Stat Counters */}
        <section aria-label="Portal Live Statistics">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border-l-4 border-gov-navy p-5 rounded-md border border-gov-border shadow-gov-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-gov-text-muted">
                    {t('home.statFamilies')}
                  </div>
                  <div className="text-2xl sm:text-3xl font-mono font-extrabold text-gov-navy mt-1">
                    {Number(stats.familiesRegistered).toLocaleString('en-IN')}
                  </div>
                  <div className="text-[11px] text-gov-green font-medium mt-1">
                    ✓ Verified across 33 Districts
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-50 text-gov-navy flex items-center justify-center">
                  <Users size={24} aria-hidden="true" />
                </div>
              </div>
            </div>

            <div className="bg-white border-l-4 border-gov-saffron p-5 rounded-md border border-gov-border shadow-gov-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-gov-text-muted">
                    {t('home.statSchemes')}
                  </div>
                  <div className="text-2xl sm:text-3xl font-mono font-extrabold text-gov-navy mt-1">
                    {stats.schemesLinked}
                  </div>
                  <div className="text-[11px] text-gov-text-muted mt-1">
                    Direct Financial & Welfare Assistance
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-orange-50 text-gov-saffron flex items-center justify-center">
                  <Layers size={24} aria-hidden="true" />
                </div>
              </div>
            </div>

            <div className="bg-white border-l-4 border-gov-green p-5 rounded-md border border-gov-border shadow-gov-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-gov-text-muted">
                    {t('home.statBenefits')}
                  </div>
                  <div className="text-2xl sm:text-3xl font-mono font-extrabold text-gov-green mt-1">
                    {stats.benefitsDisbursed}
                  </div>
                  <div className="text-[11px] text-gov-text-muted mt-1">
                    Transferred via Aadhaar DBT
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-50 text-gov-green flex items-center justify-center">
                  <Award size={24} aria-hidden="true" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Quick-Access Citizen Tiles */}
        <section aria-labelledby="quick-services-title">
          <div className="flex items-center justify-between mb-4">
            <h2 id="quick-services-title" className="text-lg font-bold text-gov-navy">
              {t('home.quickTiles')}
            </h2>
            <span className="text-xs text-gov-text-muted">
              Direct access to essential household welfare workflows
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/find-schemes"
              className="bg-white p-5 rounded-md border border-gov-border shadow-gov-sm hover:border-gov-navy hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <h3 className="font-bold text-sm text-gov-navy mb-1">{t('home.tile1Title')}</h3>
                <p className="text-xs text-gov-text-muted leading-relaxed">{t('home.tile1Desc')}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-semibold text-gov-navy group-hover:text-gov-saffron">
                <span>Evaluate Now</span>
                <ChevronRight size={14} className="ml-1" />
              </div>
            </Link>

            <Link
              to="/applications"
              className="bg-white p-5 rounded-md border border-gov-border shadow-gov-sm hover:border-gov-navy hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <h3 className="font-bold text-sm text-gov-navy mb-1">{t('home.tile2Title')}</h3>
                <p className="text-xs text-gov-text-muted leading-relaxed">{t('home.tile2Desc')}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-semibold text-gov-navy group-hover:text-gov-saffron">
                <span>View Status</span>
                <ChevronRight size={14} className="ml-1" />
              </div>
            </Link>

            <Link
              to="/dashboard"
              className="bg-white p-5 rounded-md border border-gov-border shadow-gov-sm hover:border-gov-navy hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <h3 className="font-bold text-sm text-gov-navy mb-1">{t('home.tile3Title')}</h3>
                <p className="text-xs text-gov-text-muted leading-relaxed">{t('home.tile3Desc')}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-semibold text-gov-navy group-hover:text-gov-saffron">
                <span>Manage Family</span>
                <ChevronRight size={14} className="ml-1" />
              </div>
            </Link>

            <Link
              to="/grievance"
              className="bg-white p-5 rounded-md border border-gov-border shadow-gov-sm hover:border-gov-navy hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <h3 className="font-bold text-sm text-gov-navy mb-1">{t('home.tile4Title')}</h3>
                <p className="text-xs text-gov-text-muted leading-relaxed">{t('home.tile4Desc')}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-semibold text-gov-navy group-hover:text-gov-saffron">
                <span>Lodge Ticket</span>
                <ChevronRight size={14} className="ml-1" />
              </div>
            </Link>
          </div>
        </section>

        {/* 5. Scheme Category Chips + Scheme Cards Grid */}
        <section aria-labelledby="browse-schemes-title">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 id="browse-schemes-title" className="text-lg font-bold text-gov-navy">
                {t('home.categories')}
              </h2>
              <p className="text-xs text-gov-text-muted">
                Explore government assistance schemes by department and sector
              </p>
            </div>

            <Link to="/find-schemes">
              <Button variant="secondary" size="sm">
                <span>View All Schemes</span>
                <ArrowRight size={14} />
              </Button>
            </Link>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-gov-navy ${
                  selectedCategory === cat
                    ? 'bg-gov-navy text-white shadow-sm'
                    : 'bg-white text-gov-text border border-gov-border hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Scheme Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-4">
            {filteredSchemes.slice(0, 6).map((scheme) => (
              <Card
                key={scheme.scheme_id}
                className="flex flex-col justify-between hover:border-gov-navy transition-all"
                bodyClassName="flex-1 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <span className="text-[11px] font-bold text-gov-teal uppercase tracking-wider">
                      {scheme.category || 'Welfare'}
                    </span>
                    <Badge variant="approved" size="sm">Active</Badge>
                  </div>

                  <h3 className="font-bold text-sm text-gov-navy leading-snug mb-1">
                    {scheme.name}
                  </h3>
                  {scheme.name_gu && (
                    <div className="font-gujarati text-xs text-gov-text-muted mb-2">
                      {scheme.name_gu}
                    </div>
                  )}

                  <p className="text-xs text-gov-text-muted leading-relaxed mb-4">
                    {scheme.benefit_summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-gov-text-muted font-mono font-bold">
                    {scheme.scheme_id}
                  </span>
                  <Link to="/find-schemes">
                    <span className="font-bold text-gov-navy hover:text-gov-saffron inline-flex items-center gap-1">
                      Check Eligibility <ChevronRight size={14} />
                    </span>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </PortalLayout>
  );
};

export default LandingPage;
