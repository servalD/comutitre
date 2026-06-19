/**
 * Streaming client for the backend RAG endpoint (`POST /api/rag/chat`).
 * The backend responds in NDJSON — one JSON event per line — which we parse
 * incrementally so tokens can be rendered as they arrive.
 */
import i18n from '../i18n'

// The backend serves every route under the global `/api` prefix. VITE_API_URL
// may or may not already include it (host-only in dev, '/api' or same-origin in
// prod), so normalize to exactly one `/api`.
const RAW_BASE = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000').replace(
  /\/+$/,
  '',
)
const API_BASE = RAW_BASE.endsWith('/api') ? RAW_BASE : `${RAW_BASE}/api`

export type RagSource = {
  id: string
  source: string
  title?: string
  section?: string
  score: number
}

export type RagEvent =
  | { type: 'token'; delta: string }
  | { type: 'done'; sources: RagSource[] }
  | { type: 'error'; message: string }

export async function* streamRagChat(
  question: string,
  language: string,
  signal?: AbortSignal,
): AsyncGenerator<RagEvent> {
  const res = await fetch(`${API_BASE}/rag/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/x-ndjson',
    },
    body: JSON.stringify({ question, language }),
    signal,
  })

  if (!res.ok || !res.body) {
    throw new Error(i18n.t('chatbot.requestFailed', { ns: 'common', status: res.status }))
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  const flushLine = function* (line: string): Generator<RagEvent> {
    const trimmed = line.trim()
    if (trimmed) yield JSON.parse(trimmed) as RagEvent
  }

  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    let newlineIndex: number
    while ((newlineIndex = buffer.indexOf('\n')) >= 0) {
      const line = buffer.slice(0, newlineIndex)
      buffer = buffer.slice(newlineIndex + 1)
      yield* flushLine(line)
    }
  }

  buffer += decoder.decode()
  yield* flushLine(buffer)
}
