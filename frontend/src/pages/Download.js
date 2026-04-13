import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Download() {
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();

    const normalizedToken = token.trim();
    if (!normalizedToken) {
      setStatus('Enter a file token to continue.');
      return;
    }

    setStatus('');
    navigate(`/download/${normalizedToken}`);
  };

  return (
    <main style={styles.page}>
      <section style={styles.wrapper}>
        <div style={styles.card}>
          <p style={styles.kicker}>Public file lookup</p>
          <h1 style={styles.heading}>Find a shared file</h1>
          <p style={styles.description}>
            Paste a shared file token to open the public download page and view its details.
          </p>

          <form onSubmit={handleSubmit} style={styles.form}>
            <label htmlFor="download-token" style={styles.label}>
              File token
            </label>
            <input
              id="download-token"
              type="text"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              placeholder="Enter file token"
              style={styles.input}
            />

            <button type="submit" style={styles.button}>
              Open Download Page
            </button>
          </form>

          {status && <p style={styles.status}>{status}</p>}
        </div>
      </section>
    </main>
  );
}

const styles = {
  page: {
    background: 'linear-gradient(180deg, #eff6ff 0%, #f8fafc 45%, #ffffff 100%)',
    minHeight: 'calc(100vh - 110px)',
    padding: '32px 20px 56px',
  },
  wrapper: {
    margin: '0 auto',
    maxWidth: '760px',
  },
  card: {
    background: '#ffffff',
    border: '1px solid #dbeafe',
    borderRadius: '24px',
    boxShadow: '0 20px 45px rgba(15, 23, 42, 0.10)',
    display: 'grid',
    gap: '18px',
    padding: '32px',
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
    margin: 0,
  },
  description: {
    color: '#475569',
    lineHeight: 1.6,
    margin: 0,
  },
  form: {
    display: 'grid',
    gap: '12px',
  },
  label: {
    fontWeight: 600,
  },
  input: {
    border: '1px solid #cbd5e1',
    borderRadius: '12px',
    fontSize: '1rem',
    padding: '14px 16px',
  },
  button: {
    background: '#2563eb',
    border: 'none',
    borderRadius: '12px',
    color: '#ffffff',
    cursor: 'pointer',
    fontWeight: 700,
    padding: '14px 18px',
  },
  status: {
    color: '#b91c1c',
    margin: 0,
  },
};

export default Download;
