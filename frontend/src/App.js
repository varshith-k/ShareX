import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import DownloadPage from './pages/DownloadPage';

function App() {
  return (
    <Router>
      <div className="App">
        {/* Navigation Bar for testing purposes */}
        <nav style={{ padding: '15px', background: '#282c34', color: 'white', display: 'flex', gap: '20px' }}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>ShareX Home</Link>
          <Link to="/download/sample-file-123" style={{ color: '#61dafb', textDecoration: 'none' }}>Test Download Link</Link>
        </nav>

        <Routes>
          {/* Home Page Route */}
          <Route path="/" element={
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
              <h1>ShareX Dashboard</h1>
              <p>Hello Harshini, your environment is ready. Click the "Test Download Link" above to verify the route.</p>
            </div>
          } />

          {/* FE2-11: Dynamic route for the download page using :token */}
          <Route path="/download/:token" element={<DownloadPage />} />

          {/* Catch-all for 404 - Not Found */}
          <Route path="*" element={
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
              <h2>404 - Page Not Found</h2>
              <Link to="/">Go back home</Link>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;