import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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
                setError("Could not find the file. The link might be expired or invalid.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            getDetails();
        }
    }, [token]);

    if (loading) {
        return <div style={styles.container}><h3>Loading file details...</h3></div>;
    }

    if (error) {
        return <div style={styles.container}><h3 style={{ color: 'red' }}>{error}</h3></div>;
    }

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>File Ready for Download</h1>
            
            <div style={styles.card}>
                <p><strong>File Name:</strong> {metadata?.filename || 'Unknown'}</p>
                <p><strong>Size:</strong> {(metadata?.size / 1024).toFixed(2)} KB</p>
                
                <a 
                    href={getDownloadUrl(token)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={styles.downloadBtn}
                >
                    Download File
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
        fontFamily: 'Arial, sans-serif'
    },
    title: {
        color: '#333',
        marginBottom: '20px'
    },
    card: {
        padding: '30px',
        border: '1px solid #ddd',
        borderRadius: '12px',
        backgroundColor: '#fff',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        textAlign: 'center',
        minWidth: '300px'
    },
    downloadBtn: {
        display: 'inline-block',
        marginTop: '20px',
        padding: '10px 20px',
        backgroundColor: '#007bff',
        color: '#white',
        textDecoration: 'none',
        borderRadius: '5px',
        fontWeight: 'bold'
    }
};

export default DownloadPage;