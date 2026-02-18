import { useState } from 'react';

function Upload() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setStatus('');
  };

  const handleUpload = () => {
    if (!file) {
      setStatus('Please select a file first.');
      return;
    }

    // Mock upload for now (backend later)
    setStatus(
      `File "${file.name}" ready to upload (backend coming in next sprint).`
    );
  };

  return (
    <div style={styles.container}>
      <h2>Upload File</h2>

      <div style={styles.card}>
        <input type="file" onChange={handleFileChange} />

        <button onClick={handleUpload} style={styles.button}>
          Upload
        </button>

        {status && <p style={styles.status}>{status}</p>}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
  },
  card: {
    marginTop: '20px',
    padding: '24px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    background: '#fff',
  },
  button: {
    marginTop: '16px',
    padding: '10px 18px',
    background: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  status: {
    marginTop: '16px',
    fontWeight: '500',
  },
};

export default Upload;
