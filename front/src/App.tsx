import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation, useParams } from 'react-router-dom'
import type { ReactNode } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { AppShell } from './components/layout/AppShell'
import { RagChatbot } from './components/RagChatbot'
import Landing from './routes/Landing'
import Login from './routes/Login'
import Register from './routes/Register'
import AuthCallback from './routes/AuthCallback'
import Dashboard from './routes/Dashboard'
import SubscriptionsHub from './routes/SubscriptionsHub'
import Justificatifs from './routes/Justificatifs'
import ContratSignature from './routes/ContratSignature'
import SignatureCallback from './routes/SignatureCallback'
import AdminDossiers from './routes/AdminDossiers'
import { AddIdentityPage } from './pages/mobility/AddIdentityPage'
import { IdentityDetailPage } from './pages/mobility/IdentityDetailPage'
import { MobilityHubPage } from './pages/mobility/MobilityHubPage'
import { SubscribePage } from './pages/mobility/SubscribePage'
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
  loginPathForReturnTo,
  MOBILITY_HOME,
  MOBILITY_LOGIN,
  TITRES_HOME,
  type AuthZone,
} from './auth/auth-zones'

function ProtectedRoute({ zone }: { zone: AuthZone }) {
  const { token, isLoading } = useAuth()
  const location = useLocation()
  const loginTo = loginForZone(zone)

  if (isLoading) {
    return <p style={{ padding: '2rem', textAlign: 'center' }}>Chargement…</p>
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
    return <p style={{ padding: '2rem', textAlign: 'center' }}>Chargement…</p>
  }
  if (token) {
    return <Navigate to={homeForZone(zone)} replace />
  }

  return <>{children}</>
}

function IdentityDetailRoute() {
  const { id } = useParams()
  return <IdentityDetailPage key={id} />
}

function MobilityFallback() {
  const { token, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <p style={{ padding: '2rem', textAlign: 'center' }}>Chargement…</p>
  }
  if (!token) {
    const loginTo = loginPathForReturnTo(location.pathname)
    if (loginTo !== MOBILITY_LOGIN) {
      return <Navigate to={loginTo} replace state={{ from: location.pathname }} />
    }
    return <Navigate to="/" replace />
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

          {/* ── Écrans maquette (features/design/views) — protégés ── */}
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

          {/* ── Mobilité : auth ── */}
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

          {/* ── Titres / YouSign : auth ── */}
          <Route path="/titres/auth/callback" element={<AuthCallback zone="titres" />} />
          <Route
            path="/titres/login"
            element={
              <PublicRoute zone="titres">
                <Login zone="titres" />
              </PublicRoute>
            }
          />
          <Route
            path="/titres/register"
            element={
              <PublicRoute zone="titres">
                <Register zone="titres" />
              </PublicRoute>
            }
          />

          {/* ── Mobilité : pages ── */}
          <Route element={<ProtectedRoute zone="mobility" />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route element={<AppShell />}>
              <Route path="/mobility" element={<MobilityHubPage />} />
              <Route path="/mobility/new" element={<AddIdentityPage />} />
              <Route path="/mobility/:id/subscribe" element={<SubscribePage />} />
              <Route path="/mobility/:id" element={<IdentityDetailRoute />} />
            </Route>
          </Route>

          {/* ── Titres / YouSign : pages ── */}
          <Route element={<ProtectedRoute zone="titres" />}>
            <Route path="/abonnements" element={<SubscriptionsHub />} />
            <Route path="/justificatifs" element={<Justificatifs />} />
            <Route path="/contrat/:id" element={<ContratSignature />} />
            <Route path="/signature/callback" element={<SignatureCallback />} />
            <Route path="/admin/dossiers" element={<AdminDossiers />} />
            <Route path="/titres" element={<Navigate to={TITRES_HOME} replace />} />
          </Route>

          <Route path="*" element={<MobilityFallback />} />
        </Routes>
        <RagChatbot />
      </AuthProvider>
    </BrowserRouter>
  )
}
