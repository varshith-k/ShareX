import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const redirectTo = location.state?.from?.pathname || '/dashboard';

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.email.trim() || !form.password.trim()) {
      setStatus('Email and password are required.');
      return;
    }

    try {
      setSubmitting(true);
      setStatus('Signing you in...');
      await login(form);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setStatus(error.message || 'Unable to sign in.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <p style={styles.kicker}>Welcome back</p>
        <h2>Sign in to your ShareX workspace</h2>
        <p style={styles.copy}>Access your private dashboard, upload owned files, and manage active links.</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label} htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            style={styles.input}
          />

          <label style={styles.label} htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            style={styles.input}
          />

          <button disabled={submitting} style={styles.button} type="submit">
            {submitting ? 'Signing in...' : 'Login'}
          </button>
        </form>

        {status && <p style={styles.status}>{status}</p>}

        <p style={styles.helper}>
          New here? <Link to="/register">Create an account</Link>
        </p>
      </section>
    </main>
  );
}

const styles = {
  page: { padding: '48px 24px 64px' },
  card: {
    background: '#fff',
    border: '1px solid #dbeafe',
    borderRadius: '20px',
    boxShadow: '0 20px 50px rgba(15, 23, 42, 0.08)',
    margin: '0 auto',
    maxWidth: '520px',
    padding: '32px',
  },
  kicker: {
    color: '#1d4ed8',
    fontSize: '0.8rem',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  copy: { color: '#475569', lineHeight: 1.6 },
  form: { display: 'grid', gap: '14px', marginTop: '20px' },
  label: { fontWeight: 600 },
  input: {
    border: '1px solid #cbd5e1',
    borderRadius: '10px',
    padding: '12px 14px',
  },
  button: {
    background: '#0f172a',
    border: 'none',
    borderRadius: '10px',
    color: '#fff',
    cursor: 'pointer',
    marginTop: '8px',
    padding: '12px 16px',
  },
  status: { color: '#0f172a', fontWeight: 500, marginTop: '18px' },
  helper: { color: '#475569', marginTop: '18px' },
};

export default Login;
