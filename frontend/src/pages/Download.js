import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fetchFileMetadata } from '../services/api';

function Download() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [code, setCode] = useState(token || '');
  const [fileInfo, setFileInfo] = useState(null);
  const [status, setStatus] = useState('');

  const fetchFile = async (fileCode) => {
    if (!fileCode.trim()) {
      setStatus('Enter a file code.');
      setFileInfo(null);
      return;
    }

    try {
      setStatus('Fetching file info...');
      const data = await fetchFileMetadata(fileCode);
      setFileInfo(data);
      setStatus('File found. Open the detail page to download it.');
    } catch (error) {
      setFileInfo(null);
      setStatus(error.message || 'File not found or backend not ready.');
    }
  };

  useEffect(() => {
    if (token) {
      fetchFile(token);
    }
  }, [token]);

  const handleOpenDownload = () => {
    if (!code.trim()) {
      setStatus('Enter a file code.');
      return;
    }

    navigate(`/download/${code.trim()}`);
  };

  return (
    <main style={styles.container}>
      <section style={styles.card}>
        <div>
          <p style={styles.kicker}>Download lookup</p>
          <h2>Find a shared file</h2>
        </div>

        {!token && (
          <>
            <input
              type="text"
              placeholder="Enter file code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              style={styles.input}
            />

            <button onClick={() => fetchFile(code)} style={styles.button}>
              Fetch File Info
            </button>
          </>
        )}

        {status && <p style={styles.status}>{status}</p>}

        {fileInfo && (
          <div style={styles.meta}>
            <p>
              <b>Name:</b> {fileInfo.filename}
            </p>
            <p>
              <b>Size:</b> {fileInfo.size} bytes
            </p>
            <p>
              <b>Uploaded:</b> {fileInfo.createdAt}
            </p>

            <button onClick={handleOpenDownload} style={styles.downloadButton}>
              Open Download Page
            </button>
            <p style={styles.inlineLinkRow}>
              <Link to={`/download/${fileInfo.token}`}>Go directly to /download/{fileInfo.token}</Link>
            </p>
          </div>
        )}
      </section>
    </main>
  );
}

const styles = {
  container: { margin: '40px auto', maxWidth: '680px', padding: '0 24px 56px' },
  card: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '18px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    display: 'grid',
    gap: '16px',
    marginTop: '20px',
    padding: '28px',
  },
  kicker: {
    color: '#16a34a',
    fontSize: '0.8rem',
    fontWeight: 700,
    letterSpacing: '0.08em',
    margin: 0,
    textTransform: 'uppercase',
  },
  input: {
    border: '1px solid #ccc',
    borderRadius: '6px',
    padding: '10px',
    width: '100%',
  },
  button: {
    background: '#16a34a',
    border: 'none',
    borderRadius: '6px',
    color: 'white',
    cursor: 'pointer',
    marginTop: '16px',
    padding: '10px 18px',
  },
  downloadButton: {
    background: '#2563eb',
    border: 'none',
    borderRadius: '6px',
    color: 'white',
    cursor: 'pointer',
    marginTop: '16px',
    padding: '10px 18px',
  },
  meta: {
    background: '#f9fafb',
    borderRadius: '6px',
    marginTop: '16px',
    padding: '12px',
  },
  inlineLinkRow: {
    marginBottom: 0,
    marginTop: '12px',
  },
  status: { fontWeight: '500', marginTop: '14px' },
};

export default Download;
