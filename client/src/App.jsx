import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import CitizenDashboard from './pages/CitizenDashboard';
import FindSchemes from './pages/FindSchemes';
import CitizenApplications from './pages/CitizenApplications';
import OfficerDashboard from './pages/OfficerDashboard';
import OfficerApplications from './pages/OfficerApplications';
import OfficerSchemes from './pages/OfficerSchemes';
import FAQPage from './pages/FAQPage';
import GrievancePage from './pages/GrievancePage';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gov-navy text-sm font-semibold">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-gov-navy border-t-gov-saffron rounded-full animate-spin"></div>
          <span>Verifying credentials...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'OFFICER' ? '/officer/dashboard' : '/dashboard'} replace />;
  }

  return children;
};

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public Citizen & Portal Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/find-schemes" element={<FindSchemes />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/grievance" element={<GrievancePage />} />

              {/* Citizen Authenticated Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['CITIZEN']}>
                    <CitizenDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/applications"
                element={
                  <ProtectedRoute allowedRoles={['CITIZEN']}>
                    <CitizenApplications />
                  </ProtectedRoute>
                }
              />

              {/* Officer Authenticated Routes */}
              <Route
                path="/officer/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['OFFICER']}>
                    <OfficerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/officer/applications"
                element={
                  <ProtectedRoute allowedRoles={['OFFICER']}>
                    <OfficerApplications />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/officer/schemes"
                element={
                  <ProtectedRoute allowedRoles={['OFFICER']}>
                    <OfficerSchemes />
                  </ProtectedRoute>
                }
              />

              {/* Default Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
