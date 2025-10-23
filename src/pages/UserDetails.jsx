import { useState, useEffect, useMemo } from 'react';
import { FaEdit, FaTrashAlt, FaUserPlus, FaSearch } from 'react-icons/fa';
import { useAuth } from '@/auth/AuthContext';
import api from '@/lib/api';
import DataTable from '@/components/DataTable';

// FormFields component - defined outside to prevent re-creation on every render
function FormFields({ form, setForm, selectedId }) {
	return (
		<div className="grid gap-4">
			{/* User Code & Password */}
			<div className="grid gap-4 md:grid-cols-2">
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
						autoComplete="off"
						disabled={selectedId ? true : false}
					/>
				</label>
				<label className="grid gap-2">
					<span className="text-sm font-semibold text-brand-dark">
						Password {selectedId ? '(leave empty to keep current)' : '*'}
					</span>
					<input
						type="password"
						className="px-4 py-3 rounded-lg border-2 border-brand-silver focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent transition"
						value={form.password}
						onChange={(e) =>
							setForm((f) => ({ ...f, password: e.target.value }))
						}
						placeholder={
							selectedId ? 'Enter new password to change' : 'Enter password'
						}
						autoComplete="new-password"
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
						<option value={1}>✏️ Editor - Can manage registrations</option>
						<option value={2}>👑 Admin - Full system access</option>
					</select>
					<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-brand-blue">
						<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
							<path
								fillRule="evenodd"
								d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
								clipRule="evenodd"
							/>
						</svg>
					</div>
				</div>
			</label>

			{/* Branch & Country */}
			<div className="grid gap-4 md:grid-cols-2">
				<label className="grid gap-2">
					<span className="text-sm font-semibold text-brand-dark">Branch</span>
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
							<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
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
					<span className="text-sm font-semibold text-brand-dark">Country</span>
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
					<label className="flex items-center gap-3 p-3 rounded-lg bg-white border border-brand-silver hover:border-brand-light transition cursor-pointer">
						<input
							type="checkbox"
							className="w-5 h-5 text-brand-blue border-2 border-brand-silver rounded focus:ring-2 focus:ring-brand-light transition"
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
					<label className="flex items-center gap-3 p-3 rounded-lg bg-white border border-brand-silver hover:border-brand-light transition cursor-pointer">
						<input
							type="checkbox"
							className="w-5 h-5 text-brand-blue border-2 border-brand-silver rounded focus:ring-2 focus:ring-brand-light transition"
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
					<label className="flex items-center gap-3 p-3 rounded-lg bg-white border border-brand-silver hover:border-brand-light transition cursor-pointer">
						<input
							type="checkbox"
							className="w-5 h-5 text-brand-blue border-2 border-brand-silver rounded focus:ring-2 focus:ring-brand-light transition"
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
		</div>
	);
}

export default function UserDetails() {
	const { user } = useAuth();

	// Check admin access
	if (!user || Number(user.security) < 2) {
		return (
			<div className="min-h-screen bg-brand-pearl flex items-center justify-center">
				<div className="bg-white rounded-xl shadow-lg border border-brand-silver p-8 text-center border-l-4 border-l-red-500">
					<div className="text-6xl mb-4">🚫</div>
					<h1 className="text-2xl font-bold text-brand-dark mb-2">
						Access Denied
					</h1>
					<p className="text-brand-blue/70">
						Admin access required to manage users
					</p>
				</div>
			</div>
		);
	}

	const [tab, setTab] = useState('browse');
	const [searchTerm, setSearchTerm] = useState('');
	const [items, setItems] = useState([]);
	const [total, setTotal] = useState(0);

	const [selectedId, setSelectedId] = useState(null);
	const [isLoadingUser, setIsLoadingUser] = useState(false);
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

	const [okMsg, setOkMsg] = useState('');
	const [errMsg, setErrMsg] = useState('');

	// Define columns for the DataTable
	const tableColumns = useMemo(
		() => [
			{
				key: 'userCode',
				label: 'User Code',
				render: (value) => <span className="font-medium">{value}</span>,
			},
			{
				key: 'security',
				label: 'Security',
				render: (value) => {
					if (value === 0) return '👀 Viewer';
					if (value === 1) return '✏️ Editor';
					if (value === 2) return '👑 Admin';
					return '-';
				},
			},
			{
				key: 'branchID',
				label: 'Branch',
				render: (value) => {
					if (value === 1) return 'Sydney';
					if (value === 2) return 'Melbourne';
					return '-';
				},
			},
			{
				key: 'country',
				label: 'Country',
				render: (value) => value || '-',
			},
			{
				key: 'actions',
				label: 'Actions',
				className: 'text-center',
				render: (_, row) => (
					<button
						className="px-4 py-2 rounded-lg bg-brand-light text-white hover:bg-brand-aqua transition text-sm font-semibold"
						onClick={(e) => {
							e.stopPropagation(); // Prevent row click
							pick(row.userCode);
						}}
					>
						<FaEdit className="inline mr-1" />
						Edit
					</button>
				),
			},
		],
		[]
	);

	function resetForm() {
		setSelectedId(null);
		setForm({
			userCode: '',
			password: '',
			security: 1,
			branchID: '',
			country: '',
			passwordNeverExpires: false,
			canChangePassword: true,
			changePasswordNextLogon: false,
		});
		setOkMsg('');
		setErrMsg('');
	}

	useEffect(() => {
		resetForm();
		load();
	}, []);

	async function load(userCode = '') {
		try {
			const res = await api.get('/users', {
				params: { userCode: userCode || undefined },
			});
			setItems(res.data || []);
			setTotal(res.data?.length || 0);
		} catch (e) {
			console.error('Failed to load users:', e);
			setItems([]);
			setTotal(0);
		}
	}

	function handleSearch() {
		load(searchTerm);
	}

	async function pick(userCode) {
		setIsLoadingUser(true);
		try {
			// Use GetAll endpoint with userCode query parameter
			const res = await api.get('/users', { params: { userCode } });
			const users = res.data;

			// Since we're searching by exact userCode, should get one result
			if (!users || users.length === 0) {
				throw new Error('User not found');
			}

			const u = users[0];
			setForm({
				userCode: u.userCode || '',
				password: '', // Don't populate password for security
				security: u.security ?? 1,
				branchID: u.branchID || '',
				country: u.country || '',
				passwordNeverExpires: !!u.passwordNeverExpires,
				canChangePassword: !!u.canChangePassword,
				changePasswordNextLogon: !!u.changePasswordNextLogon,
			});
			setSelectedId(u.userID);
			setTab('browse');
			setOkMsg('');
			setErrMsg('');
		} catch (e) {
			setSelectedId(null);
			setErrMsg(e?.response?.data || e?.message || 'Failed to load user');
			setTimeout(() => setErrMsg(''), 4000);
		} finally {
			setIsLoadingUser(false);
		}
	}

	function ensureRequired() {
		if (!form?.userCode) {
			setErrMsg('User Code is required');
			return false;
		}
		// Password required for new users, optional for updates
		if (!selectedId && !form.password) {
			setErrMsg('Password is required for new users');
			return false;
		}
		return true;
	}

	async function create() {
		if (!ensureRequired()) return;
		try {
			console.log('Current user:', user);
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
			console.log('Creating user with payload:', payload);
			const res = await api.post('/users', payload);
			console.log('Create response:', res.data);
			setSelectedId(res.data.userID);
			setOkMsg('User created successfully.');
			setErrMsg('');
			setTab('browse');
			load();
			setTimeout(() => setOkMsg(''), 3000);
		} catch (e) {
			console.error('Create error:', e);
			setErrMsg(e?.response?.data || e?.message || 'Create failed.');
			setTimeout(() => setErrMsg(''), 4000);
		}
	}

	async function update() {
		if (!selectedId) {
			setErrMsg('Please select a user first');
			return;
		}
		if (!ensureRequired()) return;

		try {
			const payload = {
				UserCode: form.userCode,
				Security: Number(form.security),
				BranchID: form.branchID ? Number(form.branchID) : null,
				Country: form.country || null,
				PasswordNeverExpires: !!form.passwordNeverExpires,
				CanChangePassword: !!form.canChangePassword,
				ChangePasswordNextLogon: !!form.changePasswordNextLogon,
			};
			// Only include password if it's been changed
			if (form.password) {
				payload.Password = form.password;
			}

			// Use userCode as query parameter, same as GetAll endpoint
			await api.put('/users', payload, { params: { userCode: form.userCode } });
			setOkMsg('User updated successfully.');
			setErrMsg('');
			load();
			setTimeout(() => setOkMsg(''), 3000);
		} catch (e) {
			setErrMsg(e?.response?.data || e?.message || 'Update failed.');
			setTimeout(() => setErrMsg(''), 4000);
		}
	}

	async function del() {
		if (!selectedId) {
			setErrMsg('Please select a user first');
			return;
		}
		if (!confirm('Delete this user? This action cannot be undone.')) return;

		try {
			await api.delete(`/users/${selectedId}`);
			resetForm();
			load();
			setOkMsg('User deleted.');
			setTimeout(() => setOkMsg(''), 2500);
		} catch (e) {
			setErrMsg(e?.response?.data || e?.message || 'Delete failed.');
			setTimeout(() => setErrMsg(''), 4000);
		}
	}

	return (
		<div className="min-h-screen bg-brand-pearl p-6">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-4xl font-bold text-brand-dark mb-2">
						Manage Users
					</h1>
					<p className="text-lg text-brand-blue/80">
						Search, browse, and update system users
					</p>
				</div>

				{/* Messages */}
				{okMsg && (
					<div className="mb-4 p-4 rounded-xl bg-green-50 border-2 border-green-200 text-green-700 font-semibold text-center">
						{okMsg}
					</div>
				)}

				{/* Tabs */}
				<div className="flex gap-3 mb-6">
					<button
						onClick={() => setTab('browse')}
						className={`px-6 py-3 rounded-lg font-semibold transition-all ${
							tab === 'browse'
								? 'bg-blue-gradient text-white shadow-lg'
								: 'bg-white text-brand-blue border border-brand-silver hover:bg-brand-ice'
						}`}
					>
						<FaSearch className="inline mr-2" />
						Browse & Edit
					</button>
					<button
						onClick={() => {
							resetForm();
							setTab('new');
						}}
						className={`px-6 py-3 rounded-lg font-semibold transition-all ${
							tab === 'new'
								? 'bg-blue-gradient text-white shadow-lg'
								: 'bg-white text-brand-blue border border-brand-silver hover:bg-brand-ice'
						}`}
					>
						<FaUserPlus className="inline mr-2" />
						Create New User
					</button>
				</div>

				{/* Browse Tab */}
				{tab === 'browse' ? (
					<>
						{/* Search Section */}
						<section className="border-l-4 border-l-brand-light bg-white rounded-xl shadow-md p-6 mb-6">
							<h3 className="text-lg font-semibold text-brand-dark border-b border-brand-silver/50 pb-2 mb-3">
								Search Users
							</h3>
							<div className="flex gap-3">
								<input
									className="flex-1 px-4 py-3 rounded-lg border-2 border-brand-silver focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent transition"
									placeholder="Search by user code (leave empty for all users)..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === 'Enter') {
											handleSearch();
										}
									}}
								/>
								<button
									onClick={handleSearch}
									className="px-6 py-3 rounded-lg bg-blue-gradient text-white font-semibold hover:shadow-lg transition-all"
								>
									<FaSearch className="inline mr-2" />
									Search
								</button>
							</div>
						</section>

						{/* DataTable Section */}
						<section className="border-l-4 border-l-brand-aqua bg-white rounded-xl shadow-md p-6 mb-6">
							<h3 className="text-lg font-semibold text-brand-dark border-b border-brand-silver/50 pb-2 mb-3">
								User Results ({total} total)
							</h3>
							<DataTable
								data={items}
								columns={tableColumns}
								initialPageSize={5}
								onRowClick={(row) => pick(row.userCode)}
								emptyMessage="No users found. Try searching or click Search to load all users."
								pageSizeOptions={[5, 10, 25, 50]}
							/>
						</section>

						{/* Loading Indicator */}
						{isLoadingUser && (
							<section className="border-l-4 border-l-brand-blue bg-white rounded-xl shadow-md p-6">
								<div className="text-center py-8">
									<div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-brand-blue border-t-transparent"></div>
									<p className="mt-4 text-brand-blue font-medium">
										Loading user data...
									</p>
								</div>
							</section>
						)}

						{/* Edit Form - Only shows when user data is loaded */}
						{selectedId && !isLoadingUser && (
							<section className="border-l-4 border-l-brand-blue bg-white rounded-xl shadow-md p-6">
								<h3 className="text-lg font-semibold text-brand-dark border-b border-brand-silver/50 pb-2 mb-3 flex items-center gap-2">
									<FaEdit className="text-brand-blue" />
									Edit User: {form.userCode}
								</h3>
								<FormFields
									form={form}
									setForm={setForm}
									selectedId={selectedId}
								/>
								<div className="flex gap-3 mt-6">
									<button
										className="px-6 py-3 rounded-lg bg-blue-gradient text-white font-semibold hover:shadow-lg transition-all"
										onClick={update}
									>
										<FaEdit className="inline mr-2" />
										Update
									</button>
									<button
										className="px-6 py-3 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold hover:shadow-lg transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
										onClick={del}
										disabled={!selectedId}
									>
										<FaTrashAlt className="inline mr-2" /> Delete
									</button>
									<button
										className="px-6 py-3 rounded-lg border border-brand-silver bg-white hover:bg-brand-ice transition-all"
										onClick={resetForm}
									>
										Cancel
									</button>
									{errMsg && (
										<span className="text-red-600 text-sm ml-3 self-center">
											{errMsg}
										</span>
									)}
								</div>
							</section>
						)}
					</>
				) : (
					// Create form
					<section className="border-l-4 border-l-brand-blue bg-white rounded-xl shadow-md p-6">
						<h3 className="text-lg font-semibold text-brand-dark border-b border-brand-silver/50 pb-2 mb-3">
							New User
						</h3>
						<FormFields form={form} setForm={setForm} selectedId={selectedId} />
						<div className="flex gap-3 mt-6">
							<button
								className="px-6 py-3 rounded-lg bg-blue-gradient text-white font-semibold hover:shadow-lg transition-all"
								onClick={create}
							>
								Create
							</button>
							<button
								className="px-6 py-3 rounded-lg border border-brand-silver bg-white hover:bg-brand-ice transition-all"
								onClick={resetForm}
							>
								Reset
							</button>
							{errMsg && (
								<span className="text-red-600 text-sm ml-3 self-center">
									{errMsg}
								</span>
							)}
						</div>
					</section>
				)}
			</div>
		</div>
	);
}
