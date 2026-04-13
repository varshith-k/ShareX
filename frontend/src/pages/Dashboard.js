import { useCallback, useEffect, useState } from 'react';
import Upload from './Upload';
import { deleteMyFile, fetchMyFiles, revokeMyFile } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function Dashboard() {
  const { token, user, logout } = useAuth();
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const loadFiles = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchMyFiles(token);
      setFiles(response.files || []);
      setStatus('');
    } catch (error) {
      setStatus(error.message || 'Unable to load your files.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  async function handleRevoke(fileToken) {
    try {
      setStatus('Revoking file link...');
      await revokeMyFile(fileToken, token);
      await loadFiles();
      setStatus('File link revoked.');
    } catch (error) {
      setStatus(error.message || 'Unable to revoke file.');
    }
  }

  async function handleDelete(fileToken) {
    try {
      setStatus('Deleting file...');
      await deleteMyFile(fileToken, token);
      await loadFiles();
      setStatus('File deleted successfully.');
    } catch (error) {
      setStatus(error.message || 'Unable to delete file.');
    }
  }

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <div>
          <p style={styles.badge}>Authenticated workspace</p>
          <h2 style={styles.heading}>Welcome back, {user?.name || 'ShareX user'}.</h2>
          <p style={styles.copy}>
            Sprint 3 adds account-based ownership. Upload new files here, review your active links,
            and revoke or delete any share you own.
          </p>
        </div>

        <button onClick={logout} style={styles.logoutButton} type="button">Log out</button>
      </section>

      <section style={styles.grid}>
        <div style={styles.column}>
          <Upload token={token} onUploaded={loadFiles} />
        </div>

        <div style={styles.column}>
          <section style={styles.filesCard}>
            <div style={styles.filesHeader}>
              <div>
                <p style={styles.badge}>Owner dashboard</p>
                <h3 style={{ margin: '8px 0 0' }}>My Files</h3>
              </div>
            </div>

            {loading && <p>Loading your uploaded files...</p>}
            {!loading && status && <p style={styles.status}>{status}</p>}
            {!loading && files.length === 0 && <p>No owned files yet. Upload one from the panel on the left.</p>}

            {!loading && files.length > 0 && (
              <div style={styles.fileList}>
                {files.map((file) => (
                  <article key={file.token} style={styles.fileItem}>
                    <div>
                      <h4 style={styles.fileName}>{file.filename}</h4>
                      <p style={styles.meta}>Token: {file.token}</p>
                      <p style={styles.meta}>Size: {file.size} bytes</p>
                      <p style={styles.meta}>Status: {file.isActive ? 'Active' : 'Revoked'}</p>
                    </div>

                    <div style={styles.actions}>
                      <button
                        disabled={!file.isActive}
                        onClick={() => handleRevoke(file.token)}
                        style={styles.secondaryButton}
                        type="button"
                      >
                        Revoke
                      </button>
                      <button
                        onClick={() => handleDelete(file.token)}
                        style={styles.dangerButton}
                        type="button"
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}

const styles = {
  page: { padding: '40px 24px 56px' },
  hero: {
    alignItems: 'center',
    display: 'flex',
    gap: '20px',
    justifyContent: 'space-between',
    margin: '0 auto 24px',
    maxWidth: '1100px',
  },
  badge: {
    color: '#2563eb',
    fontSize: '0.8rem',
    fontWeight: 700,
    letterSpacing: '0.08em',
    margin: 0,
    textTransform: 'uppercase',
  },
  heading: { marginBottom: '10px' },
  copy: { color: '#475569', lineHeight: 1.7, maxWidth: '720px' },
  logoutButton: {
    background: '#e2e8f0',
    border: 'none',
    borderRadius: '999px',
    color: '#0f172a',
    cursor: 'pointer',
    padding: '12px 16px',
  },
  grid: {
    display: 'grid',
    gap: '24px',
    gridTemplateColumns: 'minmax(320px, 1fr) minmax(320px, 1.2fr)',
    margin: '0 auto',
    maxWidth: '1100px',
  },
  column: { minWidth: 0 },
  filesCard: {
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '18px',
    boxShadow: '0 18px 40px rgba(15, 23, 42, 0.08)',
    padding: '28px',
  },
  filesHeader: { marginBottom: '18px' },
  fileList: { display: 'grid', gap: '14px' },
  fileItem: {
    alignItems: 'center',
    background: '#f8fafc',
    borderRadius: '14px',
    display: 'flex',
    gap: '16px',
    justifyContent: 'space-between',
    padding: '16px',
  },
  fileName: { margin: '0 0 8px' },
  meta: { color: '#64748b', margin: '4px 0' },
  actions: { display: 'flex', gap: '10px' },
  secondaryButton: {
    background: '#dbeafe',
    border: 'none',
    borderRadius: '10px',
    color: '#1d4ed8',
    cursor: 'pointer',
    padding: '10px 14px',
  },
  dangerButton: {
    background: '#fee2e2',
    border: 'none',
    borderRadius: '10px',
    color: '#b91c1c',
    cursor: 'pointer',
    padding: '10px 14px',
  },
  status: { color: '#0f172a', fontWeight: 500 },
};

export default Dashboard;
