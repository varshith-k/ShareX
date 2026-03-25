import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function Download() {
  const { token } = useParams(); // dynamic route support

  const [code, setCode] = useState(token || "");
  const [fileInfo, setFileInfo] = useState(null);
  const [status, setStatus] = useState("");

  const fetchFile = async (fileCode) => {
    if (!fileCode.trim()) {
      setStatus("Enter a file code.");
      return;
    }

    try {
      setStatus("Fetching file info...");

      const res = await axios.get(
        `http://localhost:8080/file/${fileCode}`
      );

      setFileInfo(res.data);
      setStatus("File found!");
    } catch (err) {
      setFileInfo(null);
      setStatus("File not found or backend not ready.");
    }
  };

  // Auto fetch if token exists in URL
  useEffect(() => {
    if (token) {
      fetchFile(token);
    }
  }, [token]);

  const handleDownload = () => {
    if (!code) return;
    window.location.href = `http://localhost:8080/file/${code}/download`;
  };

  return (
    <div style={styles.container}>
      <h2>Download File</h2>

      <div style={styles.card}>
        {!token && (
          <>
            <input
              type="text"
              placeholder="Enter file code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              style={styles.input}
            />

            <button
              onClick={() => fetchFile(code)}
              style={styles.button}
            >
              Fetch File Info
            </button>
          </>
        )}

        {status && <p style={styles.status}>{status}</p>}

        {fileInfo && (
          <div style={styles.meta}>
            <p>
              <b>Name:</b> {fileInfo.name}
            </p>
            <p>
              <b>Size:</b> {fileInfo.size} KB
            </p>
            <p>
              <b>Uploaded:</b> {fileInfo.createdAt}
            </p>

            <button
              onClick={handleDownload}
              style={styles.downloadButton}
            >
              Download File
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: "600px", margin: "40px auto" },
  card: {
    marginTop: "20px",
    padding: "28px",
    borderRadius: "10px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    background: "#ffffff",
  },
  input: {
    padding: "10px",
    width: "100%",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  button: {
    marginTop: "16px",
    padding: "10px 18px",
    background: "#16a34a",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  downloadButton: {
    marginTop: "16px",
    padding: "10px 18px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  meta: {
    marginTop: "16px",
    background: "#f9fafb",
    padding: "12px",
    borderRadius: "6px",
  },
  status: { marginTop: "14px", fontWeight: "500" },
};

export default Download;
