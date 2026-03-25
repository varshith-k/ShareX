import React from 'react';
import { BrowserRouter as Router, Link, Route, Routes } from 'react-router-dom';
import Download from './pages/Download';
import DownloadPage from './pages/DownloadPage';
import Home from './pages/Home';
import Upload from './pages/Upload';

function App() {
  return (
    <Router>
      <div className="app-shell">
        <header style={styles.header}>
          <div>
            <p style={styles.eyebrow}>Sprint 2 Working Model</p>
            <h1 style={styles.title}>ShareX File Sharing</h1>
          </div>

          <nav style={styles.nav}>
            <Link to="/" style={styles.primaryLink}>Home</Link>
            <Link to="/upload" style={styles.link}>Share a file</Link>
            <Link to="/download" style={styles.link}>Find a file</Link>
          </nav>
        </header>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/download" element={<Download />} />
          <Route path="/download/:token" element={<DownloadPage />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </div>
    </Router>
  );
}

const styles = {
  header: {
    alignItems: 'center',
    background: 'linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%)',
    color: '#fff',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
    justifyContent: 'space-between',
    padding: '24px 32px',
  },
  eyebrow: {
    fontSize: '0.8rem',
    letterSpacing: '0.08em',
    margin: 0,
    opacity: 0.8,
    textTransform: 'uppercase',
  },
  title: {
    margin: '6px 0 0',
  },
  nav: {
    display: 'flex',
    gap: '12px',
  },
  link: {
    background: 'rgba(255,255,255,0.12)',
    borderRadius: '999px',
    color: '#fff',
    padding: '10px 16px',
    textDecoration: 'none',
  },
  primaryLink: {
    background: '#fff',
    borderRadius: '999px',
    color: '#0f172a',
    padding: '10px 16px',
    textDecoration: 'none',
  },
};

export default App;
