import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { uploadFile } from '../services/api';

function Upload() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const [shareData, setShareData] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

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
      setStatus('Uploading file to the backend...');

      const response = await uploadFile(file);
      setProgress(100);
      setShareData(response);
      setStatus('Upload successful. Your share link is ready.');
    } catch (error) {
      setProgress(0);
      setStatus(error.message || 'Upload failed. Backend may not be ready yet.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <main style={styles.container}>
      <section style={styles.card}>
        <div>
          <p style={styles.kicker}>Share a file</p>
          <h2 style={styles.heading}>Upload to ShareX</h2>
          <p style={styles.description}>
            Choose a file, send it to the Go backend, and generate a reusable token for the download page.
          </p>
        </div>

        <label htmlFor="file-upload" style={styles.label}>Choose file</label>
        <input
          id="file-upload"
          type="file"
          onChange={(event) => setFile(event.target.files?.[0] || null)}
        />

        <button disabled={isUploading} onClick={handleUpload} style={styles.button}>
          {isUploading ? 'Uploading...' : 'Upload'}
        </button>

        {progress > 0 && (
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: `${progress}%` }} />
          </div>
        )}

        {status && <p style={styles.status}>{status}</p>}

        {shareData && (
          <div style={styles.resultBox}>
            <p><strong>Token:</strong> {shareData.token}</p>
            <p><strong>Backend download URL:</strong> {shareData.downloadUrl}</p>
            <p><strong>Share page:</strong> <Link to={`/download/${shareData.token}`}>{shareLink}</Link></p>
          </div>
        )}
      </section>
    </main>
  );
}

const styles = {
  container: { margin: '0 auto', maxWidth: '760px', padding: '40px 24px 56px' },
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
  label: {
    fontWeight: 600,
  },
  button: {
    background: '#2563eb',
    border: 'none',
    borderRadius: '10px',
    color: '#fff',
    cursor: 'pointer',
    padding: '12px 18px',
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
  status: {
    fontWeight: '500',
  },
  resultBox: {
    background: '#eff6ff',
    borderRadius: '14px',
    color: '#1e3a8a',
    padding: '18px',
  },
};

export default Upload;
