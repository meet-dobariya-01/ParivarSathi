import React from 'react';
import UtilityBar from './UtilityBar';
import Header from './Header';
import MainNav from './MainNav';
import Footer from './Footer';
import Breadcrumb from '../common/Breadcrumb';

const PortalLayout = ({ children, breadcrumbs = [] }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gov-surface text-gov-text font-sans selection:bg-gov-saffron selection:text-gov-navy-900">
      {/* 1. Utility bar */}
      <UtilityBar />

      {/* 2. Header */}
      <Header />

      {/* 3. Sticky Main Navigation */}
      <MainNav />

      {/* 4. Main Content Area */}
      <main id="main-content" tabIndex="-1" className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 outline-none">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumb items={breadcrumbs} />
        )}
        {children}
      </main>

      {/* 5. Footer */}
      <Footer />
    </div>
  );
};

export default PortalLayout;
