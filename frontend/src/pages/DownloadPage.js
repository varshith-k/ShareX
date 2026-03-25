import React from 'react';
import { useParams } from 'react-router-dom';

const DownloadPage = () => {
    // useParams retrieves the :token from the URL path
    const { token } = useParams();

    return (
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '80vh',
            fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' 
        }}>
            <h1 style={{ color: '#333' }}>File Ready for Download</h1>
            <p style={{ fontSize: '1.1rem', color: '#666' }}>
                Accessing file with Token: <span style={{ color: '#007bff', fontWeight: 'bold' }}>{token}</span>
            </p>
            
            <div style={{ 
                marginTop: '30px', 
                padding: '20px', 
                border: '1px dashed #ccc', 
                borderRadius: '12px', 
                backgroundColor: '#fafafa',
                maxWidth: '400px',
                textAlign: 'center'
            }}>
                <p style={{ fontStyle: 'italic', color: '#888' }}>
                    (Metadata for this file will be loaded here in your next task: FE2-13)
                </p>
            </div>
        </div>
    );
};

export default DownloadPage;