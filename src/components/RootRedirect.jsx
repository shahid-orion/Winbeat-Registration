import { Navigate } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';

export default function RootRedirect() {
	const { user, loading } = useAuth();

	if (loading) return null;

	// If user is logged in, go to home
	if (user) {
		return <Navigate to="/home" replace />;
	}

	// If not logged in, go to welcome page
	return <Navigate to="/welcome" replace />;
}
