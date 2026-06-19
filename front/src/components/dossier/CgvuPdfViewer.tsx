import { useCallback, useEffect, useState } from 'react'
import { contractsApi } from '../../api/contracts'
import styles from './CgvuPdfViewer.module.css'

interface CgvuPdfViewerProps {
  token: string
  contractId: string
  title: string
  subtitle: string
}

function ChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {direction === 'left' ? (
        <path
          d="M15 18l-6-6 6-6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M9 18l6-6-6-6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  )
}

export function CgvuPdfViewer({
  token,
  contractId,
  title,
  subtitle,
}: CgvuPdfViewerProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pageNum, setPageNum] = useState(1)

  const goToPrevious = useCallback(() => {
    setPageNum((current) => Math.max(1, current - 1))
  }, [])

  const goToNext = useCallback(() => {
    setPageNum((current) => current + 1)
  }, [])

  useEffect(() => {
    let cancelled = false
    let objectUrl: string | null = null

    async function loadPdf() {
      setLoading(true)
      setError(null)
      setPageNum(1)

      try {
        const blob = await contractsApi.getCgvuPreview(token, contractId)
        if (cancelled) return

        objectUrl = URL.createObjectURL(blob)
        setPdfUrl(objectUrl)
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Impossible de charger le PDF CGVU',
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadPdf()

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
      setPdfUrl((current) => {
        if (current && current !== objectUrl) URL.revokeObjectURL(current)
        return null
      })
    }
  }, [token, contractId])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement
      ) {
        return
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        goToPrevious()
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        goToNext()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [goToNext, goToPrevious])

  const iframeSrc = pdfUrl
    ? `${pdfUrl}#page=${pageNum}&view=Fit&toolbar=0&navpanes=0`
    : undefined

  return (
    <section
      className={styles.viewer}
      aria-label="Visionneuse CGVU"
      tabIndex={0}
    >
      <div className={styles.header}>
        <div>
          <p className={styles.title}>{title}</p>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>
        <p className={styles.hint}>← → pour naviguer · défilez pour lire</p>
      </div>

      <div className={styles.toolbar}>
        <button
          type="button"
          className={styles.navBtn}
          onClick={goToPrevious}
          disabled={pageNum <= 1 || loading}
          aria-label="Page précédente"
        >
          <ChevronIcon direction="left" />
        </button>

        <span className={styles.pageIndicator} aria-live="polite">
          {loading ? 'Chargement…' : `Page ${pageNum}`}
        </span>

        <button
          type="button"
          className={styles.navBtn}
          onClick={goToNext}
          disabled={loading || !pdfUrl}
          aria-label="Page suivante"
        >
          <ChevronIcon direction="right" />
        </button>
      </div>

      <div className={styles.viewport} aria-busy={loading}>
        {loading ? (
          <p className={styles.status}>Chargement du document…</p>
        ) : error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : iframeSrc ? (
          <div className={styles.frameWrap}>
            <iframe
              key={pageNum}
              title={title}
              src={iframeSrc}
              className={styles.frame}
            />
          </div>
        ) : null}
      </div>
    </section>
  )
}
