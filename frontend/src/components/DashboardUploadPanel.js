import React, { useState } from 'react';

function DashboardUploadPanel({ onUploadSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  function handleFileChange(event) {
    const file = event.target.files && event.target.files[0] ? event.target.files[0] : null;
    setSelectedFile(file);
    setMessage('');
  }

  async function handleUpload() {
    if (!selectedFile) {
      setMessage('Please choose a file before uploading.');
      return;
    }

    setIsUploading(true);

    try {
      setMessage('Upload integration will be connected in the next step.');

      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error) {
      setMessage('Unable to upload file right now.');
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <section style={styles.card}>
      <h3 style={styles.title}>Upload Panel</h3>
      <p style={styles.text}>
        Select a file and upload it directly from your dashboard workspace.
      </p>

      <div style={styles.fieldGroup}>
        <input type="file" onChange={handleFileChange} style={styles.input} />
      </div>

      {selectedFile && (
        <p style={styles.fileInfo}>Selected: {selectedFile.name}</p>
      )}

      {message && <p style={styles.message}>{message}</p>}

      <button
        type="button"
        onClick={handleUpload}
        style={styles.button}
        disabled={isUploading}
      >
        {isUploading ? 'Uploading...' : 'Upload File'}
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
  fileInfo: {
    color: '#334155',
    margin: '0 0 12px',
  },
  message: {
    color: '#475569',
    margin: '0 0 12px',
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