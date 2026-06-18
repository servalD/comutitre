import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation, useParams } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { AppShell } from './components/layout/AppShell'
import Login from './routes/Login'
import Register from './routes/Register'
import AuthCallback from './routes/AuthCallback'
import Dashboard from './routes/Dashboard'
import { AddIdentityPage } from './pages/mobility/AddIdentityPage'
import { IdentityDetailPage } from './pages/mobility/IdentityDetailPage'
import { MobilityHubPage } from './pages/mobility/MobilityHubPage'
import { SubscribePage } from './pages/mobility/SubscribePage'

function ProtectedRoute() {
  const { token, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <p style={{ padding: '2rem', textAlign: 'center' }}>Chargement…</p>
  }
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { token, isLoading } = useAuth()

  if (isLoading) {
    return <p style={{ padding: '2rem', textAlign: 'center' }}>Chargement…</p>
  }
  if (token) {
    return <Navigate to="/mobility" replace />
  }

  return <>{children}</>
}

function IdentityDetailRoute() {
  const { id } = useParams()
  return <IdentityDetailPage key={id} />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/auth/callback" element={<AuthCallback />} />

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

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route element={<AppShell />}>
              <Route path="/" element={<Navigate to="/mobility" replace />} />
              <Route path="/mobility" element={<MobilityHubPage />} />
              <Route path="/mobility/new" element={<AddIdentityPage />} />
              <Route path="/mobility/:id/subscribe" element={<SubscribePage />} />
              <Route path="/mobility/:id" element={<IdentityDetailRoute />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/mobility" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}