import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './routes/Login';
import Register from './routes/Register';
import AuthCallback from './routes/AuthCallback';
import Dashboard from './routes/Dashboard';
import Justificatifs from './routes/Justificatifs';
import ContratSignature from './routes/ContratSignature';
import SignatureCallback from './routes/SignatureCallback';
import AdminDossiers from './routes/AdminDossiers';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, isLoading } = useAuth();
  if (isLoading) return null;
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { token, isLoading } = useAuth();
  if (isLoading) return null;
  return !token ? <>{children}</> : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/justificatifs"
            element={
              <ProtectedRoute>
                <Justificatifs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/contrat/:id"
            element={
              <ProtectedRoute>
                <ContratSignature />
              </ProtectedRoute>
            }
          />
          <Route
            path="/signature/callback"
            element={
              <ProtectedRoute>
                <SignatureCallback />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dossiers"
            element={
              <ProtectedRoute>
                <AdminDossiers />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
