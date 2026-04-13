import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { uploadFile } from '../services/api';

function Upload({ onUploaded, token }) {
  const auth = useAuth();
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const [shareData, setShareData] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const activeToken = token || auth.token;
  const [copyStatus, setCopyStatus] = useState('');

  const shareLink = useMemo(() => {
    if (!shareData?.token) {
      return '';
    }
    return `${window.location.origin}/download/${shareData.token}`;
  }, [shareData]);

  const handleUpload = async () => {
    if (!file) {
      setStatus('Please select a file first.');
      return;
    }

    try {
      setIsUploading(true);
      setProgress(15);
      setShareData(null);
      setCopyStatus('');
      setStatus('Uploading file to the backend...');

      const response = await uploadFile(file, activeToken);
      setProgress(100);
      setShareData(response);
      setStatus('Upload successful. Your share link is ready.');
      if (onUploaded) {
        await onUploaded();
      }
    } catch (error) {
      setProgress(0);
      setStatus(error.message || 'Upload failed. Backend may not be ready yet.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareLink) return;

    try {
      await navigator.clipboard.writeText(shareLink);
      setCopyStatus('Share link copied successfully.');
    } catch (error) {
      setCopyStatus('Copy failed. Please copy the link manually.');
    }
  };

  return (
    <main style={styles.container}>
      <section style={styles.card}>
        <div>
          <p style={styles.kicker}>Share a file</p>
          <h1 style={styles.heading}>Upload to ShareX</h1>
          <p style={styles.description}>
            Choose a file, send it to the backend, and generate a shareable link
            for the public download page.
          </p>
        </div>

        <div style={styles.inputGroup}>
          <label htmlFor="file-upload" style={styles.label}>
            Choose file
          </label>
          <input
            id="file-upload"
            type="file"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
            style={styles.input}
          />
        </div>

        <div style={styles.actionRow}>
          <button
            type="button"
            onClick={handleUpload}
            disabled={isUploading}
            style={{
              ...styles.button,
              ...(isUploading ? styles.buttonDisabled : {}),
            }}
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>

        {progress > 0 && (
          <div style={styles.progressWrapper}>
            <div style={styles.progressBar}>
              <div style={{ ...styles.progressFill, width: `${progress}%` }} />
            </div>
            <p style={styles.progressText}>{progress}% complete</p>
          </div>
        )}

        {status && <p style={styles.status}>{status}</p>}

        {shareData && (
          <section style={styles.sharePanel}>
            <div style={styles.shareHeader}>
              <div>
                <p style={styles.shareKicker}>Share link ready</p>
                <h2 style={styles.shareTitle}>Send this file to others</h2>
              </div>

              <button type="button" onClick={handleCopyLink} style={styles.copyButton}>
                Copy Link
              </button>
            </div>

            <div style={styles.linkBox}>
              <span style={styles.linkLabel}>Share URL</span>
              <span style={styles.linkValue}>{shareLink}</span>
            </div>

            {copyStatus && <p style={styles.copyStatus}>{copyStatus}</p>}

            <div style={styles.metaGrid}>
              <div style={styles.metaItem}>
                <span style={styles.metaLabel}>Token</span>
                <span style={styles.metaValue}>{shareData.token}</span>
              </div>

              <div style={styles.metaItem}>
                <span style={styles.metaLabel}>Backend download URL</span>
                <span style={styles.metaValue}>{shareData.downloadUrl}</span>
              </div>
            </div>

            <div style={styles.linkActions}>
              <a href={shareLink} target="_blank" rel="noreferrer" style={styles.primaryLink}>
                Open Share Page
              </a>

              <Link to={`/download/${shareData.token}`} style={styles.secondaryLink}>
                View Download Route
              </Link>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}

const styles = {
  container: {
    margin: '0 auto',
    maxWidth: '760px',
    padding: '40px 24px 56px',
  },
  card: {
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '18px',
    boxShadow: '0 18px 40px rgba(15, 23, 42, 0.08)',
    display: 'grid',
    gap: '16px',
    padding: '28px',
  },
  kicker: {
    color: '#2563eb',
    fontSize: '0.8rem',
    fontWeight: 700,
    letterSpacing: '0.08em',
    margin: 0,
    textTransform: 'uppercase',
  },
  heading: {
    marginBottom: '10px',
  },
  description: {
    color: '#475569',
    lineHeight: 1.6,
  },
  inputGroup: {
    display: 'grid',
    gap: '10px',
  },
  label: {
    fontWeight: 600,
  },
  input: {
    border: '1px solid #cbd5e1',
    borderRadius: '10px',
    padding: '10px',
  },
  actionRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
  },
  button: {
    background: '#2563eb',
    border: 'none',
    borderRadius: '10px',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: 700,
    padding: '12px 18px',
  },
  buttonDisabled: {
    cursor: 'not-allowed',
    opacity: 0.7,
  },
  progressWrapper: {
    display: 'grid',
    gap: '8px',
  },
  progressBar: {
    background: '#e5e7eb',
    borderRadius: '999px',
    height: '10px',
    overflow: 'hidden',
  },
  progressFill: {
    background: '#2563eb',
    height: '100%',
  },
  progressText: {
    color: '#475569',
    fontSize: '0.9rem',
    margin: 0,
  },
  status: {
    fontWeight: '500',
    margin: 0,
  },
  sharePanel: {
    background: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: '16px',
    display: 'grid',
    gap: '16px',
    padding: '20px',
  },
  shareHeader: {
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    justifyContent: 'space-between',
  },
  shareKicker: {
    color: '#1d4ed8',
    fontSize: '0.8rem',
    fontWeight: 700,
    letterSpacing: '0.08em',
    margin: 0,
    textTransform: 'uppercase',
  },
  shareTitle: {
    color: '#1e3a8a',
    margin: '6px 0 0',
  },
  copyButton: {
    background: '#1d4ed8',
    border: 'none',
    borderRadius: '10px',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: 700,
    padding: '12px 18px',
  },
  linkBox: {
    background: '#ffffff',
    border: '1px solid #dbeafe',
    borderRadius: '14px',
    display: 'grid',
    gap: '8px',
    padding: '16px',
  },
  linkLabel: {
    color: '#64748b',
    fontSize: '0.85rem',
    fontWeight: 700,
    textTransform: 'uppercase',
  },
  linkValue: {
    color: '#0f172a',
    fontSize: '0.95rem',
    fontWeight: 600,
    overflowWrap: 'anywhere',
  },
  copyStatus: {
    color: '#166534',
    fontWeight: 600,
    margin: 0,
  },
  metaGrid: {
    display: 'grid',
    gap: '12px',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  },
  metaItem: {
    background: '#ffffff',
    border: '1px solid #dbeafe',
    borderRadius: '14px',
    display: 'grid',
    gap: '8px',
    padding: '16px',
  },
  metaLabel: {
    color: '#64748b',
    fontSize: '0.85rem',
    fontWeight: 700,
    textTransform: 'uppercase',
  },
  metaValue: {
    color: '#0f172a',
    fontWeight: 600,
    overflowWrap: 'anywhere',
  },
  linkActions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
  },
  primaryLink: {
    background: '#2563eb',
    borderRadius: '10px',
    color: '#ffffff',
    fontWeight: 700,
    padding: '12px 18px',
    textDecoration: 'none',
  },
  secondaryLink: {
    background: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '10px',
    color: '#0f172a',
    fontWeight: 600,
    padding: '12px 18px',
    textDecoration: 'none',
  },
};

export default Upload;
