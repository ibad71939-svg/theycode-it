import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Wraps pages like /login and /register: if the user is already
// authenticated, send them straight to their portal instead of showing the
// login/signup form again.
export default function PublicOnlyRoute({ children }) {
  const { user, token } = useAuth();
  if (token && user) {
    const isAdmin = user.role === 'SUPER_ADMIN' || user.role === 'REGISTRAR';
    return <Navigate to={isAdmin ? '/admin/dashboard' : '/student/dashboard'} replace />;
  }
  return children;
}
