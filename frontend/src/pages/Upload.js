import { useState } from "react";
import { api } from "../api/api";

function Upload() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    try {
      setError("");
      setStatus("Uploading...");
      setResult(null);
      setProgress(0);

      // simulate progress
      let fakeProgress = 0;
      const interval = setInterval(() => {
        fakeProgress += 10;
        if (fakeProgress <= 90) setProgress(fakeProgress);
      }, 200);

      const data = await api.uploadFile(file);

      clearInterval(interval);
      setProgress(100);

      setResult(data);
      setStatus("");
    } catch (err) {
      setError(err.message || "Upload failed");
      setStatus("");
      setProgress(0);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Upload File</h2>

      <div style={styles.card}>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />

        <button
  onClick={handleUpload}
  style={styles.button}
  disabled={!file}
>
  Upload
</button>

        {progress > 0 && (
          <div style={styles.progressBar}>
            <div
              style={{ ...styles.progressFill, width: `${progress}%` }}
            />
          </div>
        )}

        {status && <p style={styles.status}>{status}</p>}

        {error && (
          <p style={{ color: "red", marginTop: "16px" }}>{error}</p>
        )}

        {result && (
          <div style={{ marginTop: "16px" }}>
            <p style={{ color: "green", fontWeight: "600" }}>
              Upload successful!
            </p>

            <p>Token: {result.token}</p>

            <a
              href={result.downloadUrl}
              target="_blank"
              rel="noreferrer"
              style={{ color: "#2563eb", textDecoration: "underline" }}
            >
              Download File
            </a>
          </div>
        )}
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
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
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