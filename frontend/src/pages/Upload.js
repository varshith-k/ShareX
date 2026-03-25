import { useState } from "react";
import axios from "axios";

function Upload() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);

  const handleUpload = async () => {
    if (!file) {
      setStatus("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setStatus("Uploading...");

      await axios.post("http://localhost:8080/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (event) => {
          const percent = Math.round((event.loaded * 100) / event.total);
          setProgress(percent);
        },
      });

      setStatus("Upload successful!");
    } catch (error) {
      setStatus("Upload failed. Backend may not be ready yet.");
    }
  };

  return (
    <div style={styles.container}>
      <h2>Upload File</h2>

      <div style={styles.card}>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />

        <button onClick={handleUpload} style={styles.button}>
          Upload
        </button>

        {progress > 0 && (
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: `${progress}%` }} />
          </div>
        )}

        {status && <p style={styles.status}>{status}</p>}
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: "600px", margin: "0 auto" },
  card: {
    marginTop: "20px",
    padding: "24px",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    background: "#fff",
  },
  button: {
    marginTop: "16px",
    padding: "10px 18px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  progressBar: {
    marginTop: "16px",
    height: "8px",
    background: "#e5e7eb",
    borderRadius: "4px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "#2563eb",
  },
  status: {
    marginTop: "16px",
    fontWeight: "500",
  },
};

export default Upload;
