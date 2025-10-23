import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function ProtectedRoute({
	minSecurity = 0,
	redirectTo = '/login',
	children,
}) {
	const { user, loading } = useAuth();
	if (loading) return null;
	if (!user) return <Navigate to={redirectTo} replace />;
	const sec = Number(user.security || 0);
	if (sec < minSecurity) return <Navigate to="/403" replace />;
	return children;
}
