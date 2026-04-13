import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function ProtectedRoute({ children }) {
  const { loading, user } = useAuth();

  if (loading) {
    return (
      <main style={{ padding: '48px 24px', textAlign: 'center' }}>
        <p>Checking your session...</p>
      </main>
    );
  }

  if (!user) {
    return <Navigate replace to="/login" />;
  }

  return children;
}

export default ProtectedRoute;
