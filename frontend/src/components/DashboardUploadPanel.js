import React from 'react';

function DashboardUploadPanel() {
  return (
    <section style={styles.card}>
      <h3 style={styles.title}>Upload Panel</h3>
      <p style={styles.text}>
        Select a file and upload it directly from your dashboard workspace.
      </p>

      <div style={styles.fieldGroup}>
        <input type="file" style={styles.input} />
      </div>

      <button type="button" style={styles.button}>
        Upload File
      </button>
    </section>
  );
}

const styles = {
  card: {
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    boxShadow: '0 10px 30px rgba(15, 23, 42, 0.05)',
    padding: '24px',
  },
  title: {
    margin: '0 0 12px',
  },
  text: {
    color: '#475569',
    lineHeight: 1.6,
    margin: '0 0 16px',
  },
  fieldGroup: {
    marginBottom: '16px',
  },
  input: {
    width: '100%',
  },
  button: {
    background: '#1d4ed8',
    border: 'none',
    borderRadius: '10px',
    color: '#fff',
    cursor: 'pointer',
    padding: '10px 16px',
  },
};

export default DashboardUploadPanel;