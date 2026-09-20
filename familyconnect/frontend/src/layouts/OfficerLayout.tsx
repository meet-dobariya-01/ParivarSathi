import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type OfficerLayoutProps = {
  children: React.ReactNode;
};

const officerNavItems = [
  { to: "/officer/dashboard", label: "Dashboard", icon: "📊" },
  { to: "/officer/schemes", label: "Schemes", icon: "📜" },
  { to: "/officer/applications", label: "Applications", icon: "📑" },
];

export const OfficerLayout = ({ children }: OfficerLayoutProps) => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const displayName = user?.name || (user?.email ? user.email.split("@")[0] : "Verification Officer");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Government Officer Header */}
      <header className="sticky top-0 z-40 border-b border-blue-900/40 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white shadow-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            {/* Mobile toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-lg p-2 text-blue-200 hover:bg-white/10 hover:text-white lg:hidden"
              aria-label="Toggle navigation menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-400 font-black text-slate-950 shadow-inner ring-2 ring-white/20 text-xs tracking-tighter">
                GUJ
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-amber-300">
                  Government of Gujarat
                </p>
                <h1 className="text-base font-bold text-white sm:text-lg">
                  FamilyConnect Gujarat — Officer Portal
                </h1>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 backdrop-blur-sm">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 text-sm font-bold text-slate-950">
                {String(displayName).charAt(0).toUpperCase()}
              </span>
              <div className="text-left text-xs leading-tight">
                <p className="font-semibold text-white">{displayName}</p>
                <span className="inline-block rounded bg-amber-400/20 px-1.5 py-0.2 text-[10px] font-bold text-amber-300">
                  VERIFYING OFFICER
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-600/80 hover:border-red-400"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Mobile dropdown nav */}
        {mobileMenuOpen && (
          <div className="border-t border-blue-900/60 bg-slate-950 px-4 py-3 lg:hidden">
            <nav className="space-y-1">
              {officerNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                      isActive
                        ? "bg-blue-600 text-white shadow-sm font-semibold"
                        : "text-blue-100 hover:bg-white/10 hover:text-white"
                    }`
                  }
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Main Body with Sidebar */}
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:px-8">
        <aside className="hidden lg:block lg:w-64 shrink-0">
          <nav className="sticky top-20 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="mb-2 px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              Officer Administration
            </div>
            <div className="space-y-1">
              {officerNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition ${
                      isActive
                        ? "bg-blue-600 text-white shadow-sm font-semibold"
                        : "text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                    }`
                  }
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>

            <div className="mt-6 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={logout}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-red-50 hover:text-red-700 hover:border-red-200"
              >
                <span>🚪</span>
                Sign Out
              </button>
            </div>
          </nav>
        </aside>

        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
};
