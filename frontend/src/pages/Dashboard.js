import React, { useEffect, useState } from 'react';
import { getMyFiles } from '../services/files';

function Dashboard() {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadFiles() {
      const token = localStorage.getItem('authToken') || '';

      if (!token) {
        setFiles([]);
        setError('');
        setIsLoading(false);
        return;
      }

      try {
        const data = await getMyFiles(token);
        const fileList = Array.isArray(data) ? data : data.files || [];
        setFiles(fileList);
        setError('');
      } catch (err) {
        setFiles([]);
        setError(err.message || 'Unable to load files');
      } finally {
        setIsLoading(false);
      }
    }

    loadFiles();
  }, []);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <p style={styles.eyebrow}>Authenticated Workspace</p>
            <h2 style={styles.heading}>My Files</h2>
            <p style={styles.subtext}>
              Manage your uploaded files and access owner-only actions from one place.
            </p>
          </div>
        </div>

        <div style={styles.grid}>
          <section style={styles.card}>
            <h3 style={styles.cardTitle}>File List</h3>

            {isLoading && <p style={styles.cardText}>Loading your files...</p>}

            {!isLoading && error && <p style={styles.errorText}>{error}</p>}

            {!isLoading && !error && files.length > 0 && (
              <ul style={styles.list}>
                {files.map((file, index) => (
                  <li key={file.token || file.id || index} style={styles.listItem}>
                    <p style={styles.fileName}>{file.filename || file.name || 'Untitled file'}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section style={styles.card}>
            <h3 style={styles.cardTitle}>Quick Actions</h3>
            <p style={styles.cardText}>
              Upload, manage, and organize your shared files from this panel.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: '32px 16px',
  },
  container: {
    margin: '0 auto',
    maxWidth: '1000px',
  },
  header: {
    marginBottom: '24px',
  },
  eyebrow: {
    color: '#1d4ed8',
    fontSize: '0.85rem',
    fontWeight: 600,
    letterSpacing: '0.06em',
    margin: '0 0 8px',
    textTransform: 'uppercase',
  },
  heading: {
    margin: '0 0 8px',
  },
  subtext: {
    color: '#475569',
    margin: 0,
    maxWidth: '700px',
  },
  grid: {
    display: 'grid',
    gap: '20px',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  },
  card: {
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    boxShadow: '0 10px 30px rgba(15, 23, 42, 0.05)',
    padding: '24px',
  },
  cardTitle: {
    margin: '0 0 12px',
  },
  cardText: {
    color: '#475569',
    lineHeight: 1.6,
    margin: 0,
  },
  errorText: {
    color: '#b91c1c',
    margin: 0,
  },
  list: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
  },
  listItem: {
    borderTop: '1px solid #e2e8f0',
    padding: '12px 0',
  },
  fileName: {
    margin: 0,
    fontWeight: 600,
  },
};

export default Dashboard;