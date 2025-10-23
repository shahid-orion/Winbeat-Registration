import { Link } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';
import { FaPlus, FaSearch, FaUserPlus, FaUsers } from 'react-icons/fa';

export default function Home() {
	const { user } = useAuth();
	const security = Number(user?.security ?? 0);

	return (
		<div className="min-h-screen bg-brand-pearl p-8">
			{/* Welcome Section */}
			<div className="max-w-full mx-auto">
				<div className="text-center mb-12">
					<h1 className="text-4xl font-bold text-brand-dark mb-4">
						Welcome to Winbeat
					</h1>
					<p className="text-xl text-brand-blue/80 max-w-2xl mx-auto">
						Streamline your registration management with our powerful admin
						tools
					</p>
				</div>

				{/* Quick Actions - Flex Layout */}
				<div className="flex flex-wrap justify-center gap-6 mx-auto">
					{security >= 1 && (
						<>
							<Link
								to="/registration"
								className="group bg-white rounded-xl shadow-lg border-l-4 border-l-brand-blue border border-brand-silver p-6 hover:shadow-xl transition-all duration-300 hover:border-l-brand-aqua hover:scale-[1.02] flex-1 min-w-[280px] max-w-[320px] relative overflow-hidden"
							>
								<div className="absolute inset-0 bg-gradient-to-r from-brand-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
								<div className="flex items-center gap-4 relative z-10">
									<div className="flex items-center justify-center w-12 h-12 bg-blue-gradient rounded-lg text-white group-hover:scale-110 transition-transform">
										<FaPlus className="text-lg" />
									</div>
									<div className="text-left">
										<h3 className="font-semibold text-brand-dark text-lg mb-1">
											New Registration
										</h3>
										<p className="text-sm text-brand-blue/70">
											Create new WinBeat registrations
										</p>
									</div>
								</div>
							</Link>

							<Link
								to="/manage"
								className="group bg-white rounded-xl shadow-lg border-l-4 border-l-brand-light border border-brand-silver p-6 hover:shadow-xl transition-all duration-300 hover:border-l-brand-aqua hover:scale-[1.02] flex-1 min-w-[280px] max-w-[320px] relative overflow-hidden"
							>
								<div className="absolute inset-0 bg-gradient-to-r from-brand-light/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
								<div className="flex items-center gap-4 relative z-10">
									<div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-brand-light to-brand-aqua rounded-lg text-white group-hover:scale-110 transition-transform">
										<FaSearch className="text-lg" />
									</div>
									<div className="text-left">
										<h3 className="font-semibold text-brand-dark text-lg mb-1">
											Manage Registration
										</h3>
										<p className="text-sm text-brand-blue/70">
											View and manage existing registrations
										</p>
									</div>
								</div>
							</Link>

							<Link
								to="/clients"
								className="group bg-white rounded-xl shadow-lg border-l-4 border-l-brand-dark border border-brand-silver p-6 hover:shadow-xl transition-all duration-300 hover:border-l-brand-aqua hover:scale-[1.02] flex-1 min-w-[280px] max-w-[320px] relative overflow-hidden"
							>
								<div className="absolute inset-0 bg-gradient-to-r from-brand-dark/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
								<div className="flex items-center gap-4 relative z-10">
									<div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-brand-dark to-brand-blue rounded-lg text-white group-hover:scale-110 transition-transform">
										<FaUsers className="text-lg" />
									</div>
									<div className="text-left">
										<h3 className="font-semibold text-brand-dark text-lg mb-1">
											Manage Clients
										</h3>
										<p className="text-sm text-brand-blue/70">
											Create and manage client accounts
										</p>
									</div>
								</div>
							</Link>
						</>
					)}

					{/* {security >= 2 && (
						<Link
							to="/users/new"
							className="group bg-white rounded-xl shadow-lg border-l-4 border-l-brand-blue border border-brand-silver p-6 hover:shadow-xl transition-all duration-300 hover:border-l-brand-aqua hover:scale-[1.02] flex-1 min-w-[280px] max-w-[320px] relative overflow-hidden"
						>
							<div className="absolute inset-0 bg-gradient-to-r from-brand-aqua/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
							<div className="flex items-center gap-4 relative z-10">
								<div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-brand-blue to-brand-aqua rounded-lg text-white group-hover:scale-110 transition-transform">
									<FaUserPlus className="text-lg" />
								</div>
								<div className="text-left">
									<h3 className="font-semibold text-brand-dark text-lg mb-1">
										Create User
									</h3>
									<p className="text-sm text-brand-blue/70">
										Add new admin users to the system
									</p>
								</div>
							</div>
						</Link>
					)} */}
				</div>

				{/* User Info Card */}
				{/* <div className="group bg-white rounded-xl shadow-lg border-l-4 border-l-brand-blue border border-brand-silver p-6 hover:shadow-xl transition-all duration-300 hover:border-l-brand-aqua hover:scale-[1.02] flex-1 min-w-[280px] max-w-[320px] relative overflow-hidden">
					<div className="flex items-center gap-4">
						<div className="w-16 h-16 flex items-center justify-center rounded-full bg-blue-gradient text-white font-bold text-xl">
							{user?.userCode?.[0]?.toUpperCase() || 'U'}
						</div>
						<div>
							<h3 className="font-semibold text-brand-dark text-lg">
								{user?.userCode || 'Guest'}
							</h3>
							<p className="text-sm text-brand-blue/70">
								Security Level {security}
							</p>
							<p className="text-xs text-brand-blue/50 mt-1">
								Ready to manage your registrations
							</p>
						</div>
					</div>
				</div> */}
			</div>
		</div>
	);
}
