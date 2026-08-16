import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { LangProvider } from "./context/LangContext";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import OnboardingPage from "./pages/OnboardingPage";
import MapPage from "./pages/MapPage";
import MainMenuPage from "./pages/MainMenuPage";
import CookieConsent from "./components/ui/CookieConsent";
import SiteVerifyGate from "./components/ui/SiteVerifyGate";

function ProtectedRoute({ children }) {
  const { session, hasProfile, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (!session) return <Navigate to="/login" replace />;
  if (hasProfile === false) return <Navigate to="/onboarding" replace />;
  return children;
}

function OnboardingRoute({ children }) {
  const { session, hasProfile, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (!session) return <Navigate to="/login" replace />;
  if (hasProfile === true) return <Navigate to="/map" replace />;
  return children;
}

function PublicOnlyRoute({ children }) {
  const { session, hasProfile, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (session && hasProfile === false) return <Navigate to="/onboarding" replace />;
  if (session) return <Navigate to="/map" replace />;
  return children;
}

function FullScreenLoader() {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-cream-100">
      <div className="w-9 h-9 border-4 border-leaf-100 border-t-leaf-500 rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LangProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route
                path="/login"
                element={
                  <PublicOnlyRoute>
                    <LoginPage />
                  </PublicOnlyRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicOnlyRoute>
                    <RegisterPage />
                  </PublicOnlyRoute>
                }
              />
              <Route
                path="/onboarding"
                element={
                  <OnboardingRoute>
                    <OnboardingPage />
                  </OnboardingRoute>
                }
              />
              <Route
                path="/map"
                element={
                  <ProtectedRoute>
                    <MapPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/menu"
                element={
                  <ProtectedRoute>
                    <MainMenuPage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
            <CookieConsent />
            <SiteVerifyGate />
          </BrowserRouter>
        </AuthProvider>
      </LangProvider>
    </ThemeProvider>
  );
}
