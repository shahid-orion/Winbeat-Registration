import { createContext, useContext, useEffect, useState } from 'react';
import api from '@/lib/api';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
	const [profile, setProfile] = useState(null);
	const [loading, setLoading] = useState(true);

	async function loadMe() {
		try {
			const { data } = await api.get('/auth/me');
			setProfile(data);
		} catch {
			setProfile(null);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		const token = localStorage.getItem('auth_token');
		if (!token) {
			setLoading(false);
			return;
		}
		loadMe();
	}, []);

	async function login(userCode, password) {
		const { data } = await api.post('/auth/login', { userCode, password });

		const token = data?.token ?? data?.Token ?? data?.data?.token;
		localStorage.setItem('auth_token', token);
		await loadMe();
	}

	function logout() {
		localStorage.removeItem('auth_token');
		setProfile(null);
		window.location.href = '/login';
	}

	return (
		<AuthCtx.Provider value={{ user: profile, loading, login, logout }}>
			{children}
		</AuthCtx.Provider>
	);
}
console.log('AuthCtx' + AuthCtx);

export function useAuth() {
	return useContext(AuthCtx);
}
