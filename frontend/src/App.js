import React from 'react';
import { BrowserRouter as Router, Link, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import sharexLogo from './assets/brand/sharex-logo.png';
import Dashboard from './pages/Dashboard';
import Download from './pages/Download';
import DownloadPage from './pages/DownloadPage';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Upload from './pages/Upload';

function AppShell() {
  const { user } = useAuth();

  return (
    <div className="app-shell">
      <header style={styles.header}>
        <div style={styles.brandBlock}>
          <img src={sharexLogo} alt="ShareX logo" style={styles.logo} />
          <div>
            <p style={styles.eyebrow}>Secure file sharing</p>
            <h1 style={styles.title}>ShareX</h1>
          </div>
        </div>

        <nav style={styles.nav}>
          <Link to="/" style={styles.primaryLink}>Home</Link>
          {user ? <Link to="/dashboard" style={styles.link}>Dashboard</Link> : <Link to="/login" style={styles.link}>Login</Link>}
          {!user && <Link to="/register" style={styles.link}>Register</Link>}
          <Link to="/download" style={styles.link}>Find a file</Link>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={(
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/upload"
          element={(
            <ProtectedRoute>
              <Upload />
            </ProtectedRoute>
          )}
        />
        <Route path="/download" element={<Download />} />
        <Route path="/download/:token" element={<DownloadPage />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppShell />
      </Router>
    </AuthProvider>
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
  brandBlock: {
    alignItems: 'center',
    display: 'flex',
    gap: '16px',
  },
  logo: {
    background: 'rgba(255,255,255,0.08)',
    borderRadius: '18px',
    boxShadow: '0 10px 30px rgba(15, 23, 42, 0.22)',
    height: '64px',
    objectFit: 'contain',
    padding: '8px',
    width: '64px',
  },
  eyebrow: {
    fontSize: '0.8rem',
    letterSpacing: '0.08em',
    margin: 0,
    opacity: 0.85,
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
