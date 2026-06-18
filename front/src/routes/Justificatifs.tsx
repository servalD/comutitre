import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  justificatifsApi,
  JUSTIFICATIF_TYPES,
  clientStatusHint,
  type JustificatifResponse,
  STATUS_COLORS,
  STATUS_LABELS,
} from '../api/justificatifs';
import { useAuth } from '../contexts/AuthContext';
import styles from './Justificatifs.module.css';

export default function Justificatifs() {
  const { token } = useAuth();
  const [searchParams] = useSearchParams();
  const contractId = searchParams.get('contractId') ?? '';

  const [items, setItems] = useState<JustificatifResponse[]>([]);
  const [loading, setLoading] = useState(!!contractId);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [selectedType, setSelectedType] = useState<string>(JUSTIFICATIF_TYPES[0].value);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!token || !contractId) return;
    let cancelled = false;
    justificatifsApi
      .list(token, contractId)
      .then((data) => { if (!cancelled) setItems(data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [token, contractId]);

  // Rafraîchir tant qu'un document est en cours de vérification YouSign
  const hasPendingVerification = items.some(
    (j) => j.status === 'en_cours_de_verification',
  );

  useEffect(() => {
    if (!token || !contractId || !hasPendingVerification) return;

    const interval = setInterval(() => {
      justificatifsApi
        .list(token, contractId)
        .then(setItems)
        .catch(() => {});
    }, 3000);

    return () => clearInterval(interval);
  }, [token, contractId, hasPendingVerification]);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file || !token || !contractId) return;

    setUploading(true);
    setUploadError(null);
    try {
      await justificatifsApi.upload(token, {
        contractId,
        type: selectedType,
        file,
      });
      const refreshed = await justificatifsApi.list(token, contractId);
      setItems(refreshed);
      if (fileRef.current) fileRef.current.value = '';
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Erreur lors du dépôt');
    } finally {
      setUploading(false);
    }
  }

  if (!contractId) {
    return (
      <div className={styles.page}>
        <div className={styles.empty}>
          <p>Aucun contrat sélectionné.</p>
          <Link to="/" className={styles.btnBack}>← Tableau de bord</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/" className={styles.back}>← Tableau de bord</Link>
        <h1 className={styles.title}>Mes justificatifs</h1>
        <p className={styles.sub}>Contrat {contractId.slice(0, 8)}…</p>
      </header>

      {/* Upload form */}
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Déposer un document</h2>
        <form onSubmit={handleUpload} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Type de document</label>
            <select
              className={styles.select}
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              {JUSTIFICATIF_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Fichier (PDF, JPEG ou PNG, 10 Mo max)</label>
            <p className={styles.sandboxHint}>
              La vérification automatique YouSign analyse l&apos;authenticité du document.
              En environnement de test, seuls les fichiers nommés selon la convention YouSign
              (ex. <code>verified_id_document_verification.pdf</code>) simulent un succès.
            </p>
            <div className={styles.dropzone}>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className={styles.fileInput}
                required
              />
              <span className={styles.dropzoneHint}>
                Glissez-déposez ou cliquez pour choisir
              </span>
            </div>
          </div>

          {uploadError && <p className={styles.error}>{uploadError}</p>}

          <button
            type="submit"
            className={styles.btnPrimary}
            disabled={uploading}
          >
            {uploading ? 'Envoi en cours…' : 'Déposer le document'}
          </button>
        </form>
      </section>

      {/* List */}
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Documents déposés</h2>
        {loading && <p className={styles.hint}>Chargement…</p>}
        {!loading && items.length === 0 && (
          <p className={styles.hint}>Aucun justificatif déposé pour ce contrat.</p>
        )}
        <ul className={styles.list}>
          {items.map((j) => {
            const hint = clientStatusHint(j);
            return (
            <li key={j.id} className={styles.item}>
              <div className={styles.itemLeft}>
                <span className={styles.itemType}>
                  {JUSTIFICATIF_TYPES.find((t) => t.value === j.type)?.label ?? j.type}
                </span>
                <span className={styles.itemFile}>{j.originalFilename}</span>
                {hint && (
                  <span className={styles.itemHint}>{hint}</span>
                )}
                {j.agentMotif && j.status !== 'a_revoir' && (
                  <span className={styles.itemMotif}>Motif : {j.agentMotif}</span>
                )}
              </div>
              <span
                className={styles.badge}
                style={{ background: STATUS_COLORS[j.status] ?? '#1972D2' }}
              >
                {STATUS_LABELS[j.status] ?? j.status}
              </span>
            </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
