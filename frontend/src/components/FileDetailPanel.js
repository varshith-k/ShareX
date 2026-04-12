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
  if (isExpired) {
    return 'Expired';
  }

  if (!expiresAt) {
    return 'No expiration';
  }

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
  return (
    <div style={styles.panel}>
      <div style={styles.grid}>
        <div style={styles.item}>
          <span style={styles.label}>File name</span>
          <span style={styles.value}>{filename || 'Unavailable'}</span>
        </div>

        <div style={styles.item}>
          <span style={styles.label}>Size</span>
          <span style={styles.value}>{formatFileSize(size)}</span>
        </div>

        <div style={styles.item}>
          <span style={styles.label}>Token</span>
          <span style={styles.monoValue}>{token || 'Unavailable'}</span>
        </div>

        <div style={styles.item}>
          <span style={styles.label}>Uploaded</span>
          <span style={styles.value}>{formatDate(createdAt)}</span>
        </div>

        <div style={styles.item}>
          <span style={styles.label}>Expiration</span>
          <span style={styles.value}>{getExpiryText(expiresAt, isExpired)}</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  panel: {
    marginBottom: '28px',
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