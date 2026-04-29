import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setStatus('Name, email, and password are required.');
      return;
    }

    try {
      setSubmitting(true);
      setStatus('Creating your account...');
      await register(form);
      setStatus('Registration successful. You can now sign in.');
      navigate('/login');
    } catch (error) {
      setStatus(error.message || 'Unable to register.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <p style={styles.kicker}>Create your account</p>
        <h2>Create your ShareX account</h2>
        <p style={styles.copy}>Register to upload files as an owner and manage your links from the dashboard.</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label} htmlFor="register-name">Full name</label>
          <input
            id="register-name"
            type="text"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            style={styles.input}
          />

          <label style={styles.label} htmlFor="register-email">Email</label>
          <input
            id="register-email"
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            style={styles.input}
          />

          <label style={styles.label} htmlFor="register-password">Password</label>
          <input
            id="register-password"
            type="password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            style={styles.input}
          />

          <button disabled={submitting} style={styles.button} type="submit">
            {submitting ? 'Creating account...' : 'Register'}
          </button>
        </form>

        {status && <p style={styles.status}>{status}</p>}

        <p style={styles.helper}>
          Already have an account? <Link to="/login">Sign in</Link>
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
    color: '#2563eb',
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
    background: '#2563eb',
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

export default Register;
