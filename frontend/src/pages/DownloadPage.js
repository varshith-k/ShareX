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
                // Specific error handling for 404 or network issues
                setError("The file link is invalid or has expired. Please check the URL and try again.");
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            getDetails();
        }
    }, [token]);

    // 1. LOADING STATE
    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.spinner}></div>
                <p style={{ marginTop: '10px', color: '#666' }}>Fetching file details...</p>
            </div>
        );
    }

    // 2. ERROR STATE (404 / Invalid Token)
    if (error) {
        return (
            <div style={styles.container}>
                <div style={{ ...styles.card, borderColor: '#ffcccc', backgroundColor: '#fff5f5' }}>
                    <h2 style={{ color: '#d9534f' }}>File Not Found</h2>
                    <p>{error}</p>
                    <Link to="/" style={styles.backBtn}>Back to Home</Link>
                </div>
            </div>
        );
    }

    // 3. SUCCESS STATE
    return (
        <div style={styles.container}>
            <h1 style={styles.title}>File Ready for Download</h1>
            <div style={styles.card}>
                <div style={styles.fileIcon}>📄</div>
                <h3 style={{ margin: '10px 0' }}>{metadata?.filename}</h3>
                <p style={{ color: '#666' }}>Size: {(metadata?.size / 1024).toFixed(2)} KB</p>
                
                <a 
                    href={getDownloadUrl(token)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={styles.downloadBtn}
                >
                    Download Now
                </a>
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
        fontFamily: 'Segoe UI, Tahoma, sans-serif',
        backgroundColor: '#f4f7f6'
    },
    card: {
        padding: '40px',
        border: '1px solid #ddd',
        borderRadius: '16px',
        backgroundColor: '#fff',
        boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
        textAlign: 'center',
        width: '100%',
        maxWidth: '400px'
    },
    spinner: {
        width: '40px',
        height: '40px',
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #3498db',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    },
    fileIcon: {
        fontSize: '50px',
        marginBottom: '10px'
    },
    downloadBtn: {
        display: 'block',
        marginTop: '25px',
        padding: '12px',
        backgroundColor: '#28a745',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '8px',
        fontWeight: 'bold',
        transition: 'background 0.3s'
    },
    backBtn: {
        display: 'inline-block',
        marginTop: '15px',
        color: '#007bff',
        textDecoration: 'none'
    }
};

export default DownloadPage;