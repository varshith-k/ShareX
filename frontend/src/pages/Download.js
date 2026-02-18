import { useState } from "react";
import axios from "axios";

function Download() {
  const [code, setCode] = useState("");
  const [fileInfo, setFileInfo] = useState(null);
  const [status, setStatus] = useState("");

  const handleFetch = async () => {
    if (!code.trim()) {
      setStatus("Enter a file code.");
      return;
    }

    try {
      setStatus("Fetching file info...");

      const res = await axios.get(`http://localhost:8080/file/${code}`);

      setFileInfo(res.data);
      setStatus("File found!");
    } catch (err) {
      setFileInfo(null);
      setStatus("File not found or backend not ready.");
    }
  };

  return (
    <div style={styles.container}>
      <h2>Download File</h2>

      <div style={styles.card}>
        <input
          type="text"
          placeholder="Enter file code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          style={styles.input}
        />

        <button onClick={handleFetch} style={styles.button}>
          Fetch File Info
        </button>

        {status && <p style={styles.status}>{status}</p>}

        {fileInfo && (
          <div style={styles.meta}>
            <p><b>Name:</b> {fileInfo.name}</p>
            <p><b>Size:</b> {fileInfo.size} KB</p>
            <p><b>Uploaded:</b> {fileInfo.createdAt}</p>
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
  meta: {
    marginTop: "16px",
    background: "#f9fafb",
    padding: "12px",
    borderRadius: "6px"
  },
  status: { marginTop: "14px", fontWeight: "500" }
};

export default Download;
