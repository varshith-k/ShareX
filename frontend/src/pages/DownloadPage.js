import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchFileMetadata, getDownloadUrl } from '../services/api';

const DownloadPage = () => {
    const { token } = useParams();
    const [metadata, setMetadata] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getDetails = async () => {
            try {
                setLoading(true);
                const data = await fetchFileMetadata(token);
                setMetadata(data);
                setError(null);
            } catch (err) {
                setError("The file link is invalid or has expired.");
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            getDetails();
        }
    }, [token]);

    // Function to handle the download click explicitly if needed
    const handleDownload = () => {
        window.location.href = getDownloadUrl(token);
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.spinner}></div>
                <p>Loading file details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.container}>
                <div style={{ ...styles.card, borderColor: '#ffcccc' }}>
                    <h2 style={{ color: '#d9534f' }}>File Not Found</h2>
                    <p>{error}</p>
                    <Link to="/" style={styles.backBtn}>Back to Home</Link>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.icon} aria-hidden="true">File</div>
                <h2>{metadata?.filename}</h2>
                <p style={{ color: '#666' }}>Size: {(metadata?.size / 1024).toFixed(2)} KB</p>
                <button 
                    onClick={handleDownload}
                    style={styles.downloadBtn}
                >
                    Download Now
                </button>
                
                <p style={styles.footerText}>Securely hosted by ShareX</p>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '80vh',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#f8f9fa'
    },
    card: {
        padding: '40px',
        borderRadius: '12px',
        backgroundColor: '#fff',
        boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
        textAlign: 'center',
        width: '350px'
    },
    icon: {
        backgroundColor: '#dbeafe',
        borderRadius: '999px',
        color: '#1d4ed8',
        display: 'inline-flex',
        fontSize: '14px',
        fontWeight: 'bold',
        justifyContent: 'center',
        margin: '0 auto 10px',
        padding: '16px 18px',
        textTransform: 'uppercase',
    },
    spinner: {
        width: '40px',
        height: '40px',
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #007bff',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    },
    downloadBtn: {
        width: '100%',
        padding: '12px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        marginTop: '20px'
    },
    backBtn: { color: '#007bff', textDecoration: 'none', marginTop: '10px', display: 'block' },
    footerText: { fontSize: '12px', color: '#aaa', marginTop: '20px' }
};

export default DownloadPage;
