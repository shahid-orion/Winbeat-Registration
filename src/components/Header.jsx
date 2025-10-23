import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';
import {
	FaHome,
	FaClipboardList,
	FaUserPlus,
	FaUsers,
	FaClipboardCheck,
} from 'react-icons/fa';

export default function Header() {
	const { user, logout } = useAuth();
	const security = Number(user?.security ?? 0);
	const location = useLocation();

	return (
		<header className="bg-blue-gradient text-white shadow-sm">
			<div className="flex items-center px-6 py-2">
				{/* Left section - Logo */}
				<div className="flex items-center gap-2">
					<Link
						to="/home"
						className={`flex items-center gap-1 px-3 py-1.5 rounded-md hover:bg-white/20 transition ${
							location.pathname === '/home' ? 'bg-white/30 font-medium' : ''
						}`}
					>
						<FaUsers className="text-sm" />
						Winbeat Home
					</Link>
				</div>

				{/* Navigation */}
				<nav className="flex items-center gap-3 ml-8">
					<Link
						to="/registration"
						className={`flex items-center gap-1 px-3 py-1.5 rounded-md hover:bg-white/20 transition ${
							location.pathname === '/registration'
								? 'bg-white/30 font-medium'
								: ''
						}`}
					>
						<FaClipboardCheck className="text-sm" />
						WinBeat Registration
					</Link>

					{security >= 1 && (
						<>
							<Link
								to="/manage"
								className={`flex items-center gap-1 px-3 py-1.5 rounded-md hover:bg-white/20 transition ${
									location.pathname === '/manage'
										? 'bg-white/30 font-medium'
										: ''
								}`}
							>
								<FaClipboardList className="text-sm" />
								Manage Registration
							</Link>

							<Link
								to="/clients"
								className={`flex items-center gap-1 px-3 py-1.5 rounded-md hover:bg-white/20 transition ${
									location.pathname === '/clients'
										? 'bg-white/30 font-medium'
										: ''
								}`}
							>
								<FaUserPlus className="text-sm" />
								Manage Client
							</Link>
						</>
					)}

					{security >= 2 && (
						<>
							<Link
								to="/users"
								className={`flex items-center gap-1 px-3 py-1.5 rounded-md hover:bg-white/20 transition ${
									location.pathname === '/users'
										? 'bg-white/30 font-medium'
										: ''
								}`}
							>
								<FaUsers className="text-sm" />
								Manage Users
							</Link>

							{/* <Link
								to="/users/new"
								className={`flex items-center gap-1 px-3 py-1.5 rounded-md hover:bg-white/20 transition ${
									location.pathname === '/users/new'
										? 'bg-white/30 font-medium'
										: ''
								}`}
							>
								<FaUserPlus className="text-sm" />
								Create User
							</Link> */}
						</>
					)}
				</nav>

				{/* Right section - User info */}
				<div className="ml-auto flex items-center gap-3 bg-white/20 px-4 py-1.5 rounded-full">
					<div className="flex items-center gap-2">
						<div className="w-8 h-8 flex items-center justify-center rounded-full bg-white/70 text-brand-blue font-bold">
							{user?.userCode?.[0]?.toUpperCase() || 'U'}
						</div>
						<div className="text-sm">
							<div className="font-medium">{user?.userCode || 'Guest'}</div>
							<div className="text-xs opacity-80">
								Security Level {security}
							</div>
						</div>
					</div>
					{user ? (
						<button
							onClick={logout}
							className="text-xs font-medium bg-white text-brand-blue rounded-full px-3 py-1 hover:bg-brand-ice transition"
						>
							Logout
						</button>
					) : (
						<Link
							to="/login"
							className="text-xs font-medium bg-white text-brand-blue rounded-full px-3 py-1 hover:bg-brand-ice transition"
						>
							Login
						</Link>
					)}
				</div>
			</div>
		</header>
	);
}
