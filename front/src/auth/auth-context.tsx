import {
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { AuthContext } from './auth-context-value'
import { tokenStorage } from './token-storage'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => tokenStorage.get())

  const setToken = useCallback((value: string) => {
    tokenStorage.set(value)
    setTokenState(value)
  }, [])

  const clearToken = useCallback(() => {
    tokenStorage.clear()
    setTokenState(null)
  }, [])

  const value = useMemo(
    () => ({
      token,
      isAuthenticated: Boolean(token),
      setToken,
      clearToken,
    }),
    [token, setToken, clearToken],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
