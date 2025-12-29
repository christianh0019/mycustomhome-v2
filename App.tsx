
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NavigationProvider } from './contexts/NavigationContext';
import { UIProvider } from './contexts/UIContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Marketing Pages
import { PublicLayout } from './components/marketing/PublicLayout';
import { HomePage } from './components/marketing/HomePage';
import { VendorPage } from './components/marketing/VendorPage';

// Vendor
import { VendorConnectPage } from './components/vendor/VendorConnectPage';

// App Components
import { MainApp } from './components/MainApp';
import { LoginScreen } from './components/LoginScreen';
import { ErrorBoundary } from './components/ErrorBoundary';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div className="h-screen bg-black flex items-center justify-center text-white/20">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;

  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* PUBLIC MARKETING SITE */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/vendors" element={<VendorPage />} />
      </Route>

      {/* AUTH */}
      <Route path="/login" element={<LoginScreen />} />

      {/* VENDOR CONNECTION (Token Access - No Auth Required) */}
      <Route path="/connect/:token" element={<VendorConnectPage />} />

      {/* PROTECTED APP - The Dashboard */}
      <Route path="/app/*" element={
        <ProtectedRoute>
          <UIProvider>
            <NavigationProvider>
              <ThemeProvider>
                <ErrorBoundary>
                  <MainApp />
                </ErrorBoundary>
              </ThemeProvider>
            </NavigationProvider>
          </UIProvider>
        </ProtectedRoute>
      } />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
