import React from 'react';

function Dashboard() {
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
            <p style={styles.cardText}>
              Uploaded files will appear here once dashboard integration is connected.
            </p>
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
};

export default Dashboard;