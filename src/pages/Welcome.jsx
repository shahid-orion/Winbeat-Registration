import { Link } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';
import { Navigate } from 'react-router-dom';

export default function Welcome() {
	const { user } = useAuth();

	// If user is already logged in, redirect to home
	if (user) {
		return <Navigate to="/home" replace />;
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-brand-pearl via-brand-ice to-brand-light flex items-center justify-center p-6">
			<div className="max-w-7xl mx-auto">
				{/* Main Welcome Card */}
				<div className="bg-white rounded-2xl shadow-2xl border border-brand-silver overflow-hidden">
					{/* Header */}
					<div className="bg-gradient-to-r from-brand-blue to-brand-dark text-white p-8 text-center">
						<img
							src="/winbeat-logo.png"
							alt="In-House Registration"
							className="mx-auto mb-6 h-20 w-auto rounded-lg shadow-lg"
						/>
						<h1 className="text-4xl md:text-5xl font-bold mb-4">
							Welcome to WinBEAT In-House Registration
						</h1>
						<p className="text-xl text-blue-100 max-w-2xl mx-auto">
							Your comprehensive solution for managing registrations, clients,
							and user accounts
						</p>
					</div>

					{/* Content */}
					<div className="p-8 md:p-12">
						{/* Features Grid */}
						<div className="grid md:grid-cols-3 gap-8 mb-12">
							<div className="text-center">
								<div className="w-16 h-16 bg-blue-gradient rounded-full flex items-center justify-center mx-auto mb-4">
									<span className="text-2xl text-white">📋</span>
								</div>
								<h3 className="text-xl font-semibold text-brand-dark mb-2">
									Registration Management
								</h3>
								<p className="text-brand-blue/80">
									Create and manage WinBeat registrations with comprehensive
									tracking
								</p>
							</div>

							<div className="text-center">
								<div className="w-16 h-16 bg-gradient-to-r from-brand-light to-brand-aqua rounded-full flex items-center justify-center mx-auto mb-4">
									<span className="text-2xl text-white">👥</span>
								</div>
								<h3 className="text-xl font-semibold text-brand-dark mb-2">
									Client Management
								</h3>
								<p className="text-brand-blue/80">
									Organize and maintain detailed client information and accounts
								</p>
							</div>

							<div className="text-center">
								<div className="w-16 h-16 bg-gradient-to-r from-brand-aqua to-brand-dark rounded-full flex items-center justify-center mx-auto mb-4">
									<span className="text-2xl text-white">🔐</span>
								</div>
								<h3 className="text-xl font-semibold text-brand-dark mb-2">
									User Administration
								</h3>
								<p className="text-brand-blue/80">
									Secure user management with role-based access control
								</p>
							</div>
						</div>

						{/* Call to Action */}
						<div className="text-center">
							<div className="bg-gradient-to-r from-brand-ice to-brand-pearl rounded-xl p-8 mb-8">
								<h2 className="text-2xl font-bold text-brand-dark mb-4">
									Ready to Get Started?
								</h2>
								<p className="text-brand-blue/80 mb-6 max-w-2xl mx-auto">
									Access your account to begin managing registrations, clients,
									and users with our powerful platform.
								</p>

								<Link
									to="/login"
									className="inline-flex items-center gap-3 px-8 py-4 bg-blue-gradient text-white font-bold text-lg rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
								>
									<span className="text-xl">🚀</span>
									Login to Continue
								</Link>
							</div>

							{/* Additional Info */}
							<div className="text-sm text-brand-blue/60">
								<p>
									Secure access required • Contact your administrator for
									account setup
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Footer */}
				<div className="text-center mt-8 text-brand-blue/60">
					<p>&copy; 2025 In-House Registration System. All rights reserved.</p>
				</div>
			</div>
		</div>
	);
}
