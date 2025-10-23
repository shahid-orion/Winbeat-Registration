import { useState } from 'react';
import { useAuth } from '@/auth/AuthContext';
import { Navigate } from 'react-router-dom';
import { FaUserLock } from 'react-icons/fa';

export default function Login() {
	const { login, user } = useAuth();
	const [userCode, setUserCode] = useState('');
	const [password, setPassword] = useState('');
	const [msg, setMsg] = useState('');

	// If user is already logged in, redirect to home
	if (user) {
		return <Navigate to="/home" replace />;
	}

	async function submit(e) {
		e.preventDefault();
		setMsg('');
		try {
			await login(userCode, password);
			window.location.href = '/home';
		} catch (err) {
			setMsg(err?.response?.data ?? 'Login failed');
		}
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-blue-gradient p-6">
			<form
				onSubmit={submit}
				className="w-full max-w-sm bg-white-shiny rounded-2xl shadow-xl p-8 flex flex-col gap-5 border border-brand-silver/60"
			>
				{/* Icon + title */}
				<div className="flex flex-col items-center mb-2">
					<div className="w-12 h-12 flex items-center justify-center rounded-full bg-brand-blue text-white shadow-md mb-2">
						<FaUserLock className="text-xl" />
					</div>
					<h1 className="text-2xl font-semibold text-brand-dark">Sign In</h1>
					<p className="text-sm text-gray-500">Signin to access your account</p>
				</div>

				{/* Input fields */}
				<label className="grid gap-1 text-sm text-brand-dark">
					<span>User Code</span>
					<input
						className="px-3 py-2 rounded-md border border-brand-silver focus:ring-2 focus:ring-brand-aqua focus:outline-none transition"
						value={userCode}
						onChange={(e) => setUserCode(e.target.value)}
						placeholder="Enter your user code"
					/>
				</label>

				<label className="grid gap-1 text-sm text-brand-dark">
					<span>Password</span>
					<input
						type="password"
						className="px-3 py-2 rounded-md border border-brand-silver focus:ring-2 focus:ring-brand-aqua focus:outline-none transition"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						placeholder="••••••••"
					/>
				</label>

				{/* Error message */}
				{msg && (
					<div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-md px-3 py-2">
						{msg}
					</div>
				)}

				{/* Submit button */}
				<button
					type="submit"
					className="mt-2 w-full px-4 py-2.5 rounded-full font-semibold text-white bg-brand-blue hover:bg-brand-light active:bg-brand-dark transition-all shadow-md"
				>
					Login
				</button>

				{/* Footer note */}
				<div className="text-xs text-center text-gray-500 mt-2">
					© {new Date().getFullYear()} Winbeat Solutions
				</div>
			</form>
		</div>
	);
}
