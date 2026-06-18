/// <reference types="vite/client" />

declare module '@rcb-plugins/markdown-renderer' {
  import type { Plugin } from 'react-chatbotify'
  export type MarkdownRendererBlock = unknown
  /** Factory: returns a Plugin function compatible with react-chatbotify. */
  const MarkdownRenderer: (options?: Record<string, unknown>) => Plugin
  export default MarkdownRenderer
}
