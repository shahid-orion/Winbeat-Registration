import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/auth/AuthContext';
import ProtectedRoute from '@/auth/ProtectedRoute';
import Login from '@/pages/Login';
import Registration from '@/pages/Registration';
import Manage from '@/pages/Manage';
import CreateUser from '@/pages/CreateUser';
import Header from '@/components/Header';

function Frame({ children }) {
	return (
		<>
			<Header />
			<div>{children}</div>
		</>
	);
}

export default function App() {
	return (
		<AuthProvider>
			<BrowserRouter>
				<Routes>
					<Route path="/login" element={<Login />} />

					<Route
						path="/"
						element={
							<ProtectedRoute minSecurity={1}>
								<Frame>
									<Manage />
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
	);
}
