import { useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/auth/AuthContext';

export default function CreateUser() {
	const { user } = useAuth();
	if (!user || Number(user.security) < 2)
		return (
			<div className="min-h-screen bg-brand-pearl flex items-center justify-center">
				<div className="bg-white rounded-xl shadow-lg border border-brand-silver p-8 text-center border-l-4 border-l-red-500">
					<div className="text-6xl mb-4">🚫</div>
					<h1 className="text-2xl font-bold text-brand-dark mb-2">
						Access Denied
					</h1>
					<p className="text-brand-blue/70">
						Admin access required to create users
					</p>
				</div>
			</div>
		);

	const [form, setForm] = useState({
		userCode: '',
		password: '',
		security: 1,
		branchID: '',
		country: '',
		passwordNeverExpires: false,
		canChangePassword: true,
		changePasswordNextLogon: false,
	});
	const [msg, setMsg] = useState('');

	async function submit(e) {
		e.preventDefault();
		setMsg('');
		try {
			const payload = {
				UserCode: form.userCode,
				Password: form.password,
				Security: Number(form.security),
				BranchID: form.branchID ? Number(form.branchID) : null,
				Country: form.country || null,
				PasswordNeverExpires: !!form.passwordNeverExpires,
				CanChangePassword: !!form.canChangePassword,
				ChangePasswordNextLogon: !!form.changePasswordNextLogon,
			};
			await api.post('/users', payload);
			setMsg('User created successfully!');
		} catch (err) {
			setMsg(err?.response?.data ?? 'Failed to create user');
		}
	}

	return (
		<div className="min-h-screen bg-brand-pearl p-6">
			<div className="max-w-2xl mx-auto">
				{/* Header */}
				<div className="text-center mb-8">
					<div className="inline-flex items-center justify-center w-20 h-20 bg-blue-gradient rounded-2xl shadow-lg mb-6">
						<svg
							className="w-10 h-10 text-white"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
							/>
						</svg>
					</div>
					<h1 className="text-4xl font-bold text-brand-dark mb-3">
						Create New User
					</h1>
					<p className="text-lg text-brand-blue/80">
						Add new admin users to the system
					</p>
				</div>

				{/* Form Card */}
				<div className="bg-white rounded-xl shadow-lg border border-brand-silver p-8 border-l-4 border-l-brand-blue">
					<form onSubmit={submit} className="space-y-6">
						{/* User Code & Password */}
						<div className="grid gap-6 md:grid-cols-2">
							<label className="grid gap-2">
								<span className="text-sm font-semibold text-brand-dark">
									User Code *
								</span>
								<input
									className="px-4 py-3 rounded-lg border-2 border-brand-silver focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent transition"
									value={form.userCode}
									onChange={(e) =>
										setForm((f) => ({ ...f, userCode: e.target.value }))
									}
									placeholder="Enter user code"
								/>
							</label>
							<label className="grid gap-2">
								<span className="text-sm font-semibold text-brand-dark">
									Password *
								</span>
								<input
									type="password"
									className="px-4 py-3 rounded-lg border-2 border-brand-silver focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent transition"
									value={form.password}
									onChange={(e) =>
										setForm((f) => ({ ...f, password: e.target.value }))
									}
									placeholder="Enter password"
								/>
							</label>
						</div>

						{/* Security Level */}
						<label className="grid gap-2">
							<span className="text-sm font-semibold text-brand-dark">
								Security Level
							</span>
							<div className="relative">
								<select
									className="w-full px-4 py-3 rounded-lg border-2 border-brand-silver focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent transition appearance-none bg-white"
									value={form.security}
									onChange={(e) =>
										setForm((f) => ({ ...f, security: e.target.value }))
									}
								>
									<option value={0}>👀 Viewer - Read only access</option>
									<option value={1}>
										✏️ Editor - Can manage registrations
									</option>
									<option value={2}>👑 Admin - Full system access</option>
								</select>
								<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-brand-blue">
									<svg
										className="w-5 h-5"
										fill="currentColor"
										viewBox="0 0 20 20"
									>
										<path
											fillRule="evenodd"
											d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
											clipRule="evenodd"
										/>
									</svg>
								</div>
							</div>
							<p className="text-xs text-brand-blue/60 mt-1">
								0: Viewer, 1: Editor, 2: Admin
							</p>
						</label>

						{/* Branch & Country */}
						<div className="grid gap-6 md:grid-cols-2">
							<label className="grid gap-2">
								<span className="text-sm font-semibold text-brand-dark">
									Branch
								</span>
								<div className="relative">
									<select
										className="w-full px-4 py-3 rounded-lg border-2 border-brand-silver focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent transition appearance-none bg-white"
										value={form.branchID}
										onChange={(e) =>
											setForm((f) => ({
												...f,
												branchID: Number(e.target.value),
											}))
										}
									>
										<option value="">-- Select Branch --</option>
										<option value={1}>🏢 Sydney</option>
										<option value={2}>🏢 Melbourne</option>
									</select>
									<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-brand-blue">
										<svg
											className="w-5 h-5"
											fill="currentColor"
											viewBox="0 0 20 20"
										>
											<path
												fillRule="evenodd"
												d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
												clipRule="evenodd"
											/>
										</svg>
									</div>
								</div>
							</label>
							<label className="grid gap-2">
								<span className="text-sm font-semibold text-brand-dark">
									Country
								</span>
								<input
									className="px-4 py-3 rounded-lg border-2 border-brand-silver focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent transition"
									value={form.country}
									onChange={(e) =>
										setForm((f) => ({ ...f, country: e.target.value }))
									}
									placeholder="e.g., AUS"
								/>
							</label>
						</div>

						{/* Password Options */}
						<div className="bg-brand-ice rounded-xl p-6 border border-brand-silver">
							<h3 className="font-semibold text-brand-dark mb-4 flex items-center gap-2">
								<svg
									className="w-5 h-5 text-brand-blue"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fillRule="evenodd"
										d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
										clipRule="evenodd"
									/>
								</svg>
								Password Options
							</h3>
							<div className="grid gap-4 md:grid-cols-3">
								<label className="flex items-center gap-3 p-3 rounded-lg bg-white border border-brand-silver hover:bg-white hover:border-brand-light transition-all duration-200 cursor-pointer">
									<input
										type="checkbox"
										className="w-5 h-5 text-brand-blue border-2 border-brand-silver rounded focus:ring-2 focus:ring-brand-light focus:ring-offset-2 transition"
										checked={form.passwordNeverExpires}
										onChange={(e) =>
											setForm((f) => ({
												...f,
												passwordNeverExpires: e.target.checked,
											}))
										}
									/>
									<span className="text-sm font-medium text-brand-dark">
										Password never expires
									</span>
								</label>
								<label className="flex items-center gap-3 p-3 rounded-lg bg-white border border-brand-silver hover:bg-white hover:border-brand-light transition-all duration-200 cursor-pointer">
									<input
										type="checkbox"
										className="w-5 h-5 text-brand-blue border-2 border-brand-silver rounded focus:ring-2 focus:ring-brand-light focus:ring-offset-2 transition"
										checked={form.canChangePassword}
										onChange={(e) =>
											setForm((f) => ({
												...f,
												canChangePassword: e.target.checked,
											}))
										}
									/>
									<span className="text-sm font-medium text-brand-dark">
										Can change password
									</span>
								</label>
								<label className="flex items-center gap-3 p-3 rounded-lg bg-white border border-brand-silver hover:bg-white hover:border-brand-light transition-all duration-200 cursor-pointer">
									<input
										type="checkbox"
										className="w-5 h-5 text-brand-blue border-2 border-brand-silver rounded focus:ring-2 focus:ring-brand-light focus:ring-offset-2 transition"
										checked={form.changePasswordNextLogon}
										onChange={(e) =>
											setForm((f) => ({
												...f,
												changePasswordNextLogon: e.target.checked,
											}))
										}
									/>
									<span className="text-sm font-medium text-brand-dark">
										Change password next logon
									</span>
								</label>
							</div>
						</div>

						{/* Message & Submit */}
						<div className="space-y-4">
							{msg && (
								<div
									className={`p-4 rounded-xl border-2 text-center font-semibold ${
										msg.includes('successfully')
											? 'bg-green-50 border-green-200 text-green-700'
											: 'bg-red-50 border-red-200 text-red-700'
									}`}
								>
									{msg}
								</div>
							)}
							<button
								type="submit"
								className="w-full px-6 py-4 rounded-xl bg-blue-gradient text-white font-bold text-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
							>
								👤 Create User
							</button>
						</div>
					</form>
				</div>

				{/* Info Card */}
				<div className="mt-6 bg-gradient-to-r from-brand-ice to-brand-pearl rounded-xl border border-brand-silver p-6">
					<h4 className="font-semibold text-brand-dark mb-4 text-center">
						💡 Security Level Guide
					</h4>
					<div className="flex flex-wrap justify-center gap-3">
						<div className="bg-white rounded-lg px-3 py-2 border border-brand-silver text-center min-w-[120px]">
							<div className="font-bold text-brand-blue text-lg">0</div>
							<div className="text-xs text-brand-dark font-medium">Viewer</div>
							<div className="text-xs text-brand-blue/60 mt-1">Read Only</div>
						</div>
						<div className="bg-white rounded-lg px-3 py-2 border border-brand-silver text-center min-w-[120px]">
							<div className="font-bold text-brand-light text-lg">1</div>
							<div className="text-xs text-brand-dark font-medium">Editor</div>
							<div className="text-xs text-brand-blue/60 mt-1">Manage Data</div>
						</div>
						<div className="bg-white rounded-lg px-3 py-2 border border-brand-silver text-center min-w-[120px]">
							<div className="font-bold text-brand-aqua text-lg">2</div>
							<div className="text-xs text-brand-dark font-medium">Admin</div>
							<div className="text-xs text-brand-blue/60 mt-1">Full Access</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
