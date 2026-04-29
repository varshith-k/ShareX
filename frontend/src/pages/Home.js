import { Link } from 'react-router-dom';

function Home() {
  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <div>
          <p style={styles.badge}>Fast, secure sharing</p>
          <h2 style={styles.heading}>Upload, share, and retrieve files from one place.</h2>
          <p style={styles.copy}>
            ShareX combines secure uploads, public download links, and account-based file
            management in one streamlined workflow.
          </p>
        </div>

        <div style={styles.actions}>
          <Link to="/register" style={styles.primaryAction}>Create account</Link>
          <Link to="/login" style={styles.secondaryAction}>Open dashboard</Link>
          <Link to="/download" style={styles.secondaryAction}>Public download</Link>
        </div>
      </section>
    </main>
  );
}

const styles = {
  page: {
    padding: '40px 32px 56px',
  },
  hero: {
    background: 'linear-gradient(180deg, #eff6ff 0%, #ffffff 100%)',
    border: '1px solid #dbeafe',
    borderRadius: '24px',
    margin: '0 auto',
    maxWidth: '960px',
    padding: '40px',
  },
  badge: {
    color: '#1d4ed8',
    fontSize: '0.8rem',
    fontWeight: 700,
    letterSpacing: '0.06em',
    margin: 0,
    textTransform: 'uppercase',
  },
  heading: {
    color: '#0f172a',
    fontSize: '2.4rem',
    lineHeight: 1.1,
    marginBottom: '16px',
  },
  copy: {
    color: '#334155',
    fontSize: '1rem',
    lineHeight: 1.7,
    maxWidth: '640px',
  },
  actions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '14px',
    marginTop: '28px',
  },
  primaryAction: {
    background: '#0f172a',
    borderRadius: '999px',
    color: '#fff',
    padding: '12px 18px',
    textDecoration: 'none',
  },
  secondaryAction: {
    background: '#dbeafe',
    borderRadius: '999px',
    color: '#1e3a8a',
    padding: '12px 18px',
    textDecoration: 'none',
  },
};

export default Home;
