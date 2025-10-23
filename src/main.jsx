import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/auth/AuthContext';
import ProtectedRoute from '@/auth/ProtectedRoute';

import Registration from '@/pages/Registration.jsx';
import Manage from '@/pages/Manage.jsx';
import Clients from '@/pages/Clients.jsx';
import Login from '@/pages/Login.jsx';
import CreateUser from '@/pages/CreateUser.jsx';
import UserDetails from '@/pages/UserDetails.jsx';
import Welcome from '@/pages/Welcome.jsx';
import Header from '@/components/Header.jsx';
import AIAssistant from '@/components/AIAssistant.jsx';
import Home from '@/pages/Home.jsx';

import './index.css';

function Frame({ children }) {
	return (
		<>
			<Header />
			<div>{children}</div>
			<AIAssistant />
		</>
	);
}

ReactDOM.createRoot(document.getElementById('root')).render(
	<React.StrictMode>
		<AuthProvider>
			<BrowserRouter>
				<Routes>
					{/* Welcome page for unauthenticated users (root) */}
					<Route path="/" element={<Welcome />} />

					{/* Login page */}
					<Route path="/login" element={<Login />} />

					{/* Home page - protected route */}
					<Route
						path="/home"
						element={
							<ProtectedRoute minSecurity={1}>
								<Frame>
									<Home />
								</Frame>
							</ProtectedRoute>
						}
					/>

					<Route
						path="/registration"
						element={
							<ProtectedRoute minSecurity={1}>
								<Frame>
									<Registration />
								</Frame>
							</ProtectedRoute>
						}
					/>

					<Route
						path="/manage"
						element={
							<ProtectedRoute minSecurity={1}>
								<Frame>
									<Manage />
								</Frame>
							</ProtectedRoute>
						}
					/>

					<Route
						path="/clients"
						element={
							<ProtectedRoute minSecurity={1}>
								<Frame>
									<Clients />
								</Frame>
							</ProtectedRoute>
						}
					/>

					<Route
						path="/users"
						element={
							<ProtectedRoute minSecurity={2}>
								<Frame>
									<UserDetails />
								</Frame>
							</ProtectedRoute>
						}
					/>

					{/* <Route
						path="/users/new"
						element={
							<ProtectedRoute minSecurity={2}>
								<Frame>
									<CreateUser />
								</Frame>
							</ProtectedRoute>
						}
					/> */}

					<Route
						path="/403"
						element={<div className="p-6">Access denied</div>}
					/>
					<Route path="*" element={<div className="p-6">Not found</div>} />
				</Routes>
			</BrowserRouter>
		</AuthProvider>
	</React.StrictMode>
);
