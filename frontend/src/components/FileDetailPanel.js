import React from 'react';

const formatFileSize = (size) => {
  if (size === null || size === undefined || Number.isNaN(Number(size))) {
    return 'Unknown size';
  }

  const bytes = Number(size);

  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;

  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

const formatDate = (value) => {
  if (!value) return 'Unavailable';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString();
};

const getExpiryText = (expiresAt, isExpired) => {
  if (isExpired) return 'Expired';
  if (!expiresAt) return 'No expiration';
  return formatDate(expiresAt);
};

function FileDetailPanel({
  filename,
  size,
  token,
  createdAt,
  expiresAt,
  isExpired,
}) {
  const details = [
    {
      label: 'File name',
      value: filename || 'Unavailable',
    },
    {
      label: 'Size',
      value: formatFileSize(size),
    },
    {
      label: 'Token',
      value: token || 'Unavailable',
      mono: true,
    },
    {
      label: 'Uploaded',
      value: formatDate(createdAt),
    },
    {
      label: 'Expiration',
      value: getExpiryText(expiresAt, isExpired),
    },
  ];

  return (
    <section style={styles.panel} aria-label="File details">
      <div style={styles.header}>
        <h2 style={styles.title}>File details</h2>
        <p style={styles.description}>
          Key information about the shared file before download.
        </p>
      </div>

      <div style={styles.grid}>
        {details.map((item) => (
          <div key={item.label} style={styles.item}>
            <span style={styles.label}>{item.label}</span>
            <span style={item.mono ? styles.monoValue : styles.value}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

const styles = {
  panel: {
    marginBottom: '28px',
  },
  header: {
    marginBottom: '14px',
  },
  title: {
    color: '#0f172a',
    fontSize: '1.2rem',
    margin: '0 0 6px',
  },
  description: {
    color: '#64748b',
    lineHeight: 1.5,
    margin: 0,
  },
  grid: {
    display: 'grid',
    gap: '16px',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  },
  item: {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    minWidth: 0,
    padding: '18px',
  },
  label: {
    color: '#64748b',
    fontSize: '0.85rem',
    fontWeight: 700,
    textTransform: 'uppercase',
  },
  value: {
    color: '#0f172a',
    fontSize: '1rem',
    fontWeight: 600,
    overflowWrap: 'anywhere',
  },
  monoValue: {
    color: '#0f172a',
    fontFamily: 'monospace',
    fontSize: '0.95rem',
    fontWeight: 600,
    overflowWrap: 'anywhere',
  },
};

export default FileDetailPanel;