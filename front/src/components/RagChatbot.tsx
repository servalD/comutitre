import { useEffect, useMemo, useRef, useState } from 'react'
import ChatBot, { Button, type Settings, type Styles } from 'react-chatbotify'

const CHAT_ICON =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -1 24 27" fill="white">' +
    '<path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/>' +
    '</svg>',
  )
import MarkdownRenderer from '@rcb-plugins/markdown-renderer'
import { useTranslation } from 'react-i18next'
import { streamRagChat } from '../rag/chat-client'
import './RagChatbot.css'

const BCP47: Record<string, string> = { fr: 'fr-FR', en: 'en-US' }

/** Rough markdown → plain text so the spoken version isn't full of `**`, `#`… */
function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/^\s*>\s?/gm, '')
    .replace(/\n{2,}/g, '. ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Speak text via the browser SpeechSynthesis API. Avoids the Chrome bug where
 *  cancel() immediately followed by speak() drops the utterance. */
function speak(text: string, lang = 'fr-FR') {
  const synth = window.speechSynthesis
  if (!synth || !text) return

  const prefix = lang.slice(0, 2).toLowerCase()
  const utter = () => {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang
    const voice = synth
      .getVoices()
      .find((v) => v.lang?.toLowerCase().startsWith(prefix))
    if (voice) utterance.voice = voice
    synth.resume()
    synth.speak(utterance)
  }

  if (synth.speaking || synth.pending) {
    synth.cancel()
    setTimeout(utter, 80) // let the cancel settle before speaking
  } else {
    utter()
  }
}

/** Our own audio toggle in the chat header — RCB's built-in audio doesn't read
 *  streamed messages, so we own the feature. */
function AudioToggleButton({ onChange }: { onChange: (on: boolean) => void }) {
  const { t } = useTranslation('common')
  const [on, setOn] = useState(false)
  const label = on ? t('chatbot.audioOff') : t('chatbot.audioOn')
  return (
    <button
      type="button"
      onClick={() => {
        const next = !on
        setOn(next)
        onChange(next)
      }}
      title={label}
      aria-label={label}
      style={{
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1.25rem',
        lineHeight: 1,
        color: '#fff',
        padding: '0 6px',
      }}
    >
      {on ? '🔊' : '🔇'}
    </button>
  )
}

/**
 * Floating assistant using react-chatbotify's native popup window. Thin client:
 * retrieval + Mistral generation run on the backend; this streams the NDJSON
 * answer into chat and optionally reads it aloud.
 */
export function RagChatbot() {
  const { t, i18n } = useTranslation('common')
  const lang = BCP47[i18n.language] ?? 'fr-FR'
  const audioOnRef = useRef(false)

  // Stop any speech when the widget unmounts.
  useEffect(() => () => window.speechSynthesis?.cancel(), [])

  // Typed with MarkdownRendererBlock so each block can opt into markdown
  // rendering via `renderMarkdown` (the plugin parses BOT messages as markdown).
  const flow = useMemo(
    () => ({
      start: {
        message: t('chatbot.greeting'),
        renderMarkdown: ['BOT'],
        path: 'loop',
      },
      loop: {
        renderMarkdown: ['BOT'],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        message: async (params: any) => {
          const question = (params.userInput ?? '').trim()
          if (!question) return

          // Stop any answer currently being read aloud before the next one.
          window.speechSynthesis?.cancel()

          let accumulated = ''
          let streamed = false
          try {
            for await (const event of streamRagChat(question, i18n.language)) {
              if (event.type === 'token') {
                accumulated += event.delta
                streamed = true
                await params.streamMessage(accumulated)
              } else if (event.type === 'error') {
                await params.injectMessage(
                  t('chatbot.errorPrefix', { message: event.message }),
                )
                return
              }
            }
            if (streamed) {
              await params.endStreamMessage('BOT')
              if (audioOnRef.current) speak(stripMarkdown(accumulated), lang)
            } else {
              await params.injectMessage(t('chatbot.noAnswer'))
            }
          } catch (err) {
            await params.injectMessage(
              t('chatbot.errorPrefix', {
                message: err instanceof Error ? err.message : String(err),
              }),
            )
          }
        },
        path: 'loop',
      },
    }),
    [t, lang],
  )

  // Stable settings: changing this prop re-initializes the flow.
  const settings: Settings = useMemo(
    () => ({
      general: { showFooter: false },
      tooltip: { mode: 'NEVER' },
      chatButton: { icon: CHAT_ICON },
      header: {
        title: t('chatbot.title'),
        // Custom speaker toggle + the default close button.
        buttons: [
          <AudioToggleButton
            key="rag-audio"
            onChange={(active) => {
              audioOnRef.current = active
              // Speaking here (inside the click gesture) both unlocks the
              // SpeechSynthesis API and gives an immediate audible confirmation.
              if (active) speak(t('chatbot.audioEnabled'), lang)
              else window.speechSynthesis?.cancel()
            }}
          />,
          Button.CLOSE_CHAT_BUTTON,
        ],
      },
      notification: { disabled: true },
      // RCB's own audio is disabled — we drive TTS ourselves (see AudioToggleButton).
      audio: { disabled: true },
      // Speech-to-text: a mic icon lets the user dictate (Web Speech API,
      // Chrome/Edge + mic permission). Auto-sends after a short silence.
      voice: {
        disabled: false,
        defaultToggledOn: false,
        language: lang,
        autoSendDisabled: false,
        autoSendPeriod: 1500,
      },
      emoji: { disabled: true },
      fileAttachment: { disabled: true },
      chatHistory: { disabled: true },
      botBubble: { simulateStream: false },
      chatInput: {
        enabledPlaceholderText: t('chatbot.placeholder'),
      },
    }),
    [t, lang],
  )

  // Explicit, high-contrast colors so nothing relies on the app's global text
  // colors bleeding onto RCB's colored bubbles. Bot = light bg + dark text
  // (readable for long markdown answers); user/header = brand blue + white text.
  const styles: Styles = useMemo(
    () => ({
      // Clamp to the viewport so it never overflows on small laptops; phones get
      // a full-screen window via the media query in RagChatbot.css.
      chatWindowStyle: {
        width: 'min(400px, calc(100vw - 32px))',
        height: 'min(600px, calc(100dvh - 110px))',
      },
      headerStyle: { background: '#1972d2', color: '#ffffff' },
      botBubbleStyle: { backgroundColor: '#f0f4f8', color: '#25303b' },
      userBubbleStyle: { backgroundColor: '#1972d2', color: '#ffffff' },
      chatButtonStyle: { backgroundColor: '#1972d2' },
      chatIconStyle: { backgroundSize: '28px 28px', backgroundPosition: 'center 38%', backgroundRepeat: 'no-repeat' },
      sendButtonStyle: { backgroundColor: '#1972d2' },
      sendButtonHoveredStyle: { backgroundColor: '#0050aa' },
    }),
    [],
  )

  // Markdown renderer plugin (stable instance). autoConfig wires the required
  // events; blocks opt in via `renderMarkdown`.
  const plugins = useMemo(() => [MarkdownRenderer()], [])

  return (
    <ChatBot flow={flow} settings={settings} styles={styles} plugins={plugins} />
  )
}
