import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav style={styles.nav}>
      <h2 style={styles.logo}>ShareX</h2>
      <div>
        <Link to="/" style={styles.link}>
          Home
        </Link>
        <Link to="/upload" style={styles.link}>
          Upload
        </Link>
        <Link to="/download" style={styles.link}>
          Download
        </Link>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 24px',
    background: '#1f2937',
    color: 'white',
  },
  logo: {
    margin: 0,
  },
  link: {
    color: 'white',
    marginLeft: '16px',
    textDecoration: 'none',
    fontWeight: '500',
  },
};

export default Navbar;
