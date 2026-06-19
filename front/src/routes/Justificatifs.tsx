import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import MobileShell from '../components/MobileShell';
import {
  justificatifsApi,
  justificatifTypes,
  clientStatusHint,
  type JustificatifResponse,
  docStatusLabel,
} from '../api/justificatifs';
import { useAuth } from '../contexts/AuthContext';
import { allRequiredDocumentsReady, buildRequiredDocumentSlots } from '../domain/justificatif-slots';
import { contractsApi } from '../api/contracts';
import styles from './Justificatifs.module.css';

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

function statusBadgeClass(status: string): string {
  if (status === 'accepte' || status === 'pre_qualifie') return styles.badgeOk;
  if (status === 'en_cours_de_verification' || status === 'recu') return styles.badgePending;
  if (status === 'a_revoir' || status === 'refuse') return styles.badgeFail;
  return styles.badgeNeutral;
}

export default function Justificatifs() {
  const { token } = useAuth();
  const { t } = useTranslation('subscription');
  const types = justificatifTypes();
  const [searchParams] = useSearchParams();
  const contractId = searchParams.get('contractId') ?? '';

  const [items, setItems] = useState<JustificatifResponse[]>([]);
  const [productCode, setProductCode] = useState('');
  const [loading, setLoading] = useState(!!contractId);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<JustificatifResponse | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [selectedType, setSelectedType] = useState<string>(types[0].value);
  const fileRef = useRef<HTMLInputElement>(null);
  const listSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!token || !contractId) return;
    let cancelled = false;
    Promise.all([
      justificatifsApi.list(token, contractId),
      contractsApi.get(token, contractId),
    ])
      .then(([data, contract]) => {
        if (!cancelled) {
          setItems(data);
          setProductCode(contract.productCode);
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [token, contractId]);

  const documentSlots = productCode
    ? buildRequiredDocumentSlots(productCode, items)
    : [];
  const documentsReady = allRequiredDocumentsReady(documentSlots);

  useEffect(() => {
    if (!uploadSuccess) return;
    const timer = setTimeout(() => setUploadSuccess(null), 8000);
    return () => clearTimeout(timer);
  }, [uploadSuccess]);

  useEffect(() => {
    if (!highlightId) return;
    const timer = setTimeout(() => setHighlightId(null), 4000);
    return () => clearTimeout(timer);
  }, [highlightId]);

  const hasPendingVerification = items.some(
    (j) => j.status === 'en_cours_de_verification',
  );

  useEffect(() => {
    if (!token || !contractId || !hasPendingVerification) return;
    const interval = setInterval(() => {
      justificatifsApi.list(token, contractId).then(setItems).catch(() => {});
    }, 3000);
    return () => clearInterval(interval);
  }, [token, contractId, hasPendingVerification]);

  function handleFileSelect(file: File | null) {
    setSelectedFile(file);
    setUploadError(null);
    setUploadSuccess(null);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    handleFileSelect(e.target.files?.[0] ?? null);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowed.includes(file.type)) {
      setUploadError(t('justificatifs.unsupportedFormat'));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError(t('justificatifs.fileTooLarge'));
      return;
    }
    handleFileSelect(file);
    if (fileRef.current) {
      const dt = new DataTransfer();
      dt.items.add(file);
      fileRef.current.files = dt.files;
    }
  }

  function clearSelectedFile() {
    handleFileSelect(null);
    if (fileRef.current) fileRef.current.value = '';
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    const file = selectedFile ?? fileRef.current?.files?.[0];
    if (!file || !token || !contractId) return;

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);
    try {
      const uploaded = await justificatifsApi.upload(token, {
        contractId,
        type: selectedType,
        file,
      });
      const refreshed = await justificatifsApi.list(token, contractId);
      setItems(refreshed);
      setUploadSuccess(uploaded);
      setHighlightId(uploaded.id);
      clearSelectedFile();
      listSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : t('justificatifs.uploadFailed'));
    } finally {
      setUploading(false);
    }
  }

  const selectedTypeLabel =
    types.find((jt) => jt.value === selectedType)?.label ?? selectedType;

  if (!contractId) {
    return (
      <MobileShell title={t('justificatifs.title')} activeTab="titres">
        <div className={styles.screenBody}>
          <div className={styles.empty}>
            <p>{t('justificatifs.noContract')}</p>
            <Link to="/" className={styles.btnPrimary}>{t('justificatifs.backDashboard')}</Link>
          </div>
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell
      title={t('justificatifs.title')}
      subtitle={t('justificatifs.step')}
      step={3}
      totalSteps={4}
      activeTab="titres"
      tabHrefs={{ titres: `/justificatifs?contractId=${contractId}` }}
    >
      <div className={styles.screenBody}>
        <div className={styles.layoutGrid}>
          {/* ── Upload ── */}
          <form onSubmit={handleUpload} className={styles.uploadPanel}>
            <p className={styles.sectionLabel}>{t('justificatifs.docType')}</p>
            <div className={styles.field}>
              <select
                className={styles.select}
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                {types.map((jt) => (
                  <option key={jt.value} value={jt.value}>{jt.label}</option>
                ))}
              </select>
            </div>

            <p className={styles.sectionLabel}>{selectedTypeLabel}</p>

            <div className={styles.iaCard}>
              <span className={styles.iaIcon} aria-hidden="true">✦</span>
              <div>
                <p>{t('justificatifs.iaText')}</p>
                <small>
                  <Trans
                    i18nKey="justificatifs.sandboxHint"
                    ns="subscription"
                    components={{ code: <code /> }}
                  />
                </small>
              </div>
            </div>

            <div
              className={`${styles.docUpload} ${isDragging ? styles.docUploadDrag : ''} ${selectedFile ? styles.docUploadFilled : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className={styles.fileInput}
                onChange={handleInputChange}
                disabled={uploading}
              />

              {uploading ? (
                <div className={styles.uploadingState} aria-live="polite">
                  <span className={styles.spinner} />
                  <p>{t('justificatifs.uploading')}</p>
                  <small>{selectedFile?.name}</small>
                </div>
              ) : selectedFile ? (
                <div className={styles.fileSelected}>
                  <span className={styles.uploadIcon} aria-hidden="true">📄</span>
                  <p className={styles.fileName}>{selectedFile.name}</p>
                  <small>{t('justificatifs.fileSelectedHint', { size: formatFileSize(selectedFile.size) })}</small>
                  <button
                    type="button"
                    className={styles.fileRemove}
                    onClick={(e) => { e.stopPropagation(); clearSelectedFile(); }}
                  >
                    {t('justificatifs.changeFile')}
                  </button>
                </div>
              ) : (
                <>
                  <span className={styles.uploadIcon} aria-hidden="true">↑</span>
                  <p>{t('justificatifs.dropOrPhoto')}</p>
                  <small>{t('justificatifs.fileConstraints')}</small>
                </>
              )}
            </div>

            {uploadError && (
              <div className={styles.warningCard} role="alert">
                <span aria-hidden="true">⚠</span>
                <p>{uploadError}</p>
              </div>
            )}

            {uploadSuccess && (
              <div className={styles.iaCardOk} role="status">
                <span className={styles.iaIcon} aria-hidden="true">✓</span>
                <div>
                  <p>
                    <strong>{t('justificatifs.uploadedTitle')}</strong> — {uploadSuccess.originalFilename}
                  </p>
                  <small>
                    {docStatusLabel(uploadSuccess.status)}
                  </small>
                </div>
              </div>
            )}

            <button
              type="submit"
              className={styles.btnPrimary}
              disabled={uploading || !selectedFile}
            >
              {uploading ? t('justificatifs.uploading') : t('justificatifs.submit')}
            </button>

            <Link to="/" className={styles.humanLink}>
              ← {t('justificatifs.backDashboard')}
            </Link>
          </form>

          {/* ── Liste ── */}
          <div className={styles.listPanel} ref={listSectionRef}>
            <p className={styles.sectionLabel}>
              {t('justificatifs.uploadedDocs')}
              {!loading && items.length > 0 && (
                <span className={styles.countPill}>{items.length}</span>
              )}
            </p>

            {loading && <p className={styles.hint}>{t('common:loading')}</p>}

            {!loading && items.length === 0 && (
              <div className={styles.docUpload} style={{ cursor: 'default' }}>
                <span className={styles.uploadIcon} aria-hidden="true">📋</span>
                <p>{t('justificatifs.noneForContract')}</p>
                <small>{t('justificatifs.dropFirst')}</small>
              </div>
            )}

            <ul className={styles.docList}>
              {items.map((j) => {
                const hint = clientStatusHint(j);
                const typeLabel =
                  types.find((jt) => jt.value === j.type)?.label ?? j.type;
                return (
                  <li
                    key={j.id}
                    className={`${styles.profileCard} ${highlightId === j.id ? styles.profileCardHighlight : ''}`}
                  >
                    <div className={styles.docCardTop}>
                      <span className={styles.docCardName}>{typeLabel}</span>
                      <span className={`${styles.statusPill} ${statusBadgeClass(j.status)}`}>
                        {docStatusLabel(j.status)}
                      </span>
                    </div>
                    <p className={styles.docCardFile}>{j.originalFilename}</p>
                    {hint && <p className={styles.docCardHint}>{hint}</p>}
                    {j.agentMotif && j.status !== 'a_revoir' && (
                      <p className={styles.docCardMotif}>{t('justificatifs.motif', { motif: j.agentMotif })}</p>
                    )}
                  </li>
                );
              })}
            </ul>

            {hasPendingVerification && (
              <div className={styles.warningCard}>
                <span aria-hidden="true">⏳</span>
                <p>{t('justificatifs.analysisInProgress')}</p>
              </div>
            )}

            {documentsReady ? (
              <Link
                to={`/contrat/${contractId}`}
                className={styles.btnSecondary}
              >
                {t('justificatifs.toSignature')}
              </Link>
            ) : (
              <p className={styles.docCardHint}>
                Déposez et validez tous les justificatifs requis avant de signer.
              </p>
            )}
          </div>
        </div>
      </div>
    </MobileShell>
  );
}
