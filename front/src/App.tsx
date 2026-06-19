import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { RagChatbot } from './components/RagChatbot'
import Landing from './routes/Landing'
import Login from './routes/Login'
import Register from './routes/Register'
import AuthCallback from './routes/AuthCallback'
import { MonDossierPage } from './pages/MonDossierPage'
import { MonEspacePage } from './pages/MonEspacePage'
import { MonFoyerPage } from './pages/MonFoyerPage'
import { NouvelleSouscriptionPage } from './pages/NouvelleSouscriptionPage'
import { AidePage } from './pages/AidePage'
import { FichePersonnePage } from './pages/FichePersonnePage'
import { AjouterPersonnePage } from './pages/AjouterPersonnePage'
import { DossierSignaturePage } from './pages/dossier/DossierSignaturePage'
import { DossierPaiementPage } from './pages/dossier/DossierPaiementPage'
import { DossierValidationPage } from './pages/dossier/DossierValidationPage'
import { DossierConfirmationPage } from './pages/dossier/DossierConfirmationPage'
import {
  homeForZone,
  loginForZone,
  MOBILITY_HOME,
  MOBILITY_LOGIN,
  type AuthZone,
} from './auth/auth-zones'

function LoadingScreen() {
  const { t } = useTranslation('common')
  return <p style={{ padding: '2rem', textAlign: 'center' }}>{t('loading')}</p>
}

function ProtectedRoute({ zone }: { zone: AuthZone }) {
  const { token, isLoading } = useAuth()
  const location = useLocation()
  const loginTo = loginForZone(zone)

  if (isLoading) {
    return <LoadingScreen />
  }
  if (!token) {
    return <Navigate to={loginTo} replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}

function PublicRoute({
  zone,
  children,
}: {
  zone: AuthZone
  children: ReactNode
}) {
  const { token, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingScreen />
  }
  if (token) {
    return <Navigate to={homeForZone(zone)} replace />
  }

  return <>{children}</>
}

function AppFallback() {
  const { token, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <LoadingScreen />
  }
  if (!token) {
    return <Navigate to={MOBILITY_LOGIN} replace state={{ from: location.pathname }} />
  }
  return <Navigate to={MOBILITY_HOME} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ── Accueil public ── */}
          <Route
            path="/"
            element={
              <PublicRoute zone="mobility">
                <Landing />
              </PublicRoute>
            }
          />

            {/* ── Auth ── */}
          <Route path="/auth/callback" element={<AuthCallback zone="mobility" />} />
          <Route
            path="/login"
            element={
              <PublicRoute zone="mobility">
                <Login zone="mobility" />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute zone="mobility">
                <Register zone="mobility" />
              </PublicRoute>
            }
          />

          {/* ── Pages protégées ── */}
          <Route element={<ProtectedRoute zone="mobility" />}>
            <Route path="/espace" element={<MonEspacePage />} />
            <Route path="/dossier" element={<MonDossierPage />} />
            <Route path="/dossier/signature" element={<DossierSignaturePage />} />
            <Route path="/dossier/paiement" element={<DossierPaiementPage />} />
            <Route path="/dossier/validation" element={<DossierValidationPage />} />
            <Route path="/dossier/confirmation" element={<DossierConfirmationPage />} />
            <Route path="/foyer" element={<MonFoyerPage />} />
            <Route path="/foyer/ajouter" element={<AjouterPersonnePage />} />
            <Route path="/foyer/:id" element={<FichePersonnePage />} />
            <Route path="/aide" element={<AidePage />} />
            <Route path="/souscription/nouvelle" element={<NouvelleSouscriptionPage />} />
          </Route>

          <Route path="*" element={<AppFallback />} />
        </Routes>
        <RagChatbot />
      </AuthProvider>
    </BrowserRouter>
  )
}
