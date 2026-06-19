import { createRoot } from 'react-dom/client'
import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core'
import './styles/comutitres-tokens.css'
import './styles/global.css'
import './index.css'
import './i18n'
import App from './App.tsx'

const dynamicEnvironmentId =
  import.meta.env.VITE_DYNAMIC_ENVIRONMENT_ID ??
  '0ac8438d-93b8-41dc-baba-e830a96687bc'

// NOTE: StrictMode is intentionally omitted. In dev it double-invokes mounts,
// and react-chatbotify persists its message store across that remount, which
// duplicated the assistant's greeting. This is a dev-only behavior change.
createRoot(document.getElementById('root')!).render(
  <DynamicContextProvider settings={{ environmentId: dynamicEnvironmentId }}>
    <App />
  </DynamicContextProvider>,
)
