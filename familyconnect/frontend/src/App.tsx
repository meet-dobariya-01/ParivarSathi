import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import { CitizenLayout } from "./layouts/CitizenLayout";
import { ApplicationDetailPage } from "./pages/ApplicationDetailPage";
import { CitizenDashboardPage } from "./pages/CitizenDashboardPage";
import { CitizenFamilyMembersPage } from "./pages/CitizenFamilyMembersPage";
import { CitizenFamilyPage } from "./pages/CitizenFamilyPage";
import { CreateFamilyPage } from "./pages/CreateFamilyPage";
import { FindBenefitsPage } from "./pages/FindBenefitsPage";
import { LoginPage } from "./pages/LoginPage";
import { MyApplicationsPage } from "./pages/MyApplicationsPage";
import { OfficerDashboardPage } from "./pages/OfficerDashboardPage";
import { RegisterPage } from "./pages/RegisterPage";
import { SchemeDetailPage } from "./pages/SchemeDetailPage";
import { SchemesListPage } from "./pages/SchemesListPage";

const App = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Public Scheme Directory Routes */}
      <Route path="/schemes" element={<SchemesListPage />} />
      <Route path="/schemes/:id" element={<SchemeDetailPage />} />

      {/* Citizen Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["CITIZEN"]}>
            <CitizenLayout>
              <CitizenDashboardPage />
            </CitizenLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/family"
        element={
          <ProtectedRoute allowedRoles={["CITIZEN"]}>
            <CitizenLayout>
              <CitizenFamilyPage />
            </CitizenLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/family/new"
        element={
          <ProtectedRoute allowedRoles={["CITIZEN"]}>
            <CitizenLayout>
              <CreateFamilyPage />
            </CitizenLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/family/edit"
        element={
          <ProtectedRoute allowedRoles={["CITIZEN"]}>
            <CitizenLayout>
              <CreateFamilyPage />
            </CitizenLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/family/members"
        element={
          <ProtectedRoute allowedRoles={["CITIZEN"]}>
            <CitizenLayout>
              <CitizenFamilyMembersPage />
            </CitizenLayout>
          </ProtectedRoute>
        }
      />

      {/* Flagship Find Benefits Routes */}
      <Route
        path="/find-benefits"
        element={
          <ProtectedRoute allowedRoles={["CITIZEN"]}>
            <CitizenLayout>
              <FindBenefitsPage />
            </CitizenLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/schemes/eligible"
        element={
          <ProtectedRoute allowedRoles={["CITIZEN"]}>
            <CitizenLayout>
              <FindBenefitsPage />
            </CitizenLayout>
          </ProtectedRoute>
        }
      />

      {/* Application Tracking Routes */}
      <Route
        path="/applications"
        element={
          <ProtectedRoute allowedRoles={["CITIZEN"]}>
            <CitizenLayout>
              <MyApplicationsPage />
            </CitizenLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/applications/:id"
        element={
          <ProtectedRoute allowedRoles={["CITIZEN"]}>
            <CitizenLayout>
              <ApplicationDetailPage />
            </CitizenLayout>
          </ProtectedRoute>
        }
      />

      {/* Officer Protected Routes */}
      <Route
        path="/officer/dashboard"
        element={
          <ProtectedRoute allowedRoles={["OFFICER"]}>
            <OfficerDashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Root & Fallback Redirects */}
      <Route
        path="/"
        element={
          <Navigate
            to={
              user?.role === "OFFICER"
                ? "/officer/dashboard"
                : user?.role === "CITIZEN"
                ? "/dashboard"
                : "/schemes"
            }
            replace
          />
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default App;
