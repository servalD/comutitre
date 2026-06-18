import { useEffect, useMemo, useRef, useState } from 'react'
import ChatBot, { Button, type Settings, type Styles } from 'react-chatbotify'
import MarkdownRenderer from '@rcb-plugins/markdown-renderer'
import { streamRagChat } from '../rag/chat-client'
import './RagChatbot.css'

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
function speak(text: string) {
  const synth = window.speechSynthesis
  if (!synth || !text) return

  const utter = () => {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'fr-FR'
    const frVoice = synth
      .getVoices()
      .find((v) => v.lang?.toLowerCase().startsWith('fr'))
    if (frVoice) utterance.voice = frVoice
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
  const [on, setOn] = useState(false)
  const label = on ? 'Couper la lecture vocale' : 'Lire les réponses à voix haute'
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
  const audioOnRef = useRef(false)

  // Stop any speech when the widget unmounts.
  useEffect(() => () => window.speechSynthesis?.cancel(), [])

  // Typed with MarkdownRendererBlock so each block can opt into markdown
  // rendering via `renderMarkdown` (the plugin parses BOT messages as markdown).
  const flow = useMemo(
    () => ({
      start: {
        message:
          "Bonjour ! Je suis l'assistant Comutitres. Posez-moi une question sur les titres de transport Île-de-France (forfaits, Navigo, imagine R, Solidarité Transport, SAV…).",
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
            for await (const event of streamRagChat(question)) {
              if (event.type === 'token') {
                accumulated += event.delta
                streamed = true
                await params.streamMessage(accumulated)
              } else if (event.type === 'error') {
                await params.injectMessage(
                  `Désolé, une erreur est survenue : ${event.message}`,
                )
                return
              }
            }
            if (streamed) {
              await params.endStreamMessage('BOT')
              if (audioOnRef.current) speak(stripMarkdown(accumulated))
            } else {
              await params.injectMessage(
                "Désolé, je n'ai pas pu générer de réponse.",
              )
            }
          } catch (err) {
            await params.injectMessage(
              `Désolé, une erreur est survenue : ${
                err instanceof Error ? err.message : String(err)
              }`,
            )
          }
        },
        path: 'loop',
      },
    }),
    [],
  )

  // Stable settings: changing this prop re-initializes the flow.
  const settings: Settings = useMemo(
    () => ({
      general: { showFooter: false },
      tooltip: { mode: 'NEVER' },
      header: {
        title: 'Assistant Comutitres',
        // Custom speaker toggle + the default close button.
        buttons: [
          <AudioToggleButton
            key="rag-audio"
            onChange={(active) => {
              audioOnRef.current = active
              // Speaking here (inside the click gesture) both unlocks the
              // SpeechSynthesis API and gives an immediate audible confirmation.
              if (active) speak('Lecture vocale activée.')
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
        language: 'fr-FR',
        autoSendDisabled: false,
        autoSendPeriod: 1500,
      },
      emoji: { disabled: true },
      fileAttachment: { disabled: true },
      chatHistory: { disabled: true },
      botBubble: { simulateStream: false },
      chatInput: {
        enabledPlaceholderText:
          'Posez votre question sur les titres de transport…',
      },
    }),
    [],
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
