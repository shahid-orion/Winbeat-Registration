import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { http } from '../lib/api';
import validateABN, {
	createNumericInputHandler,
	validateEmail,
	smoothScrollToElement,
} from '../lib/utils';
import {
	FaEdit,
	FaTrashAlt,
	FaUserPlus,
	FaSearch,
	FaEye,
} from 'react-icons/fa';
import DataTable from '@/components/DataTable';
import pageActions from '@/lib/pageActions';

function FormFields({ form, setForm, isViewMode = false }) {
	const handleNumericInput = useCallback(
		createNumericInputHandler(setForm),
		[]
	);
	const handleTextInput = useCallback((e) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
	}, []);

	const numericFields = [
		'businessCodeID',
		'marketing',
		'unallocatedCash',
		'imputedTaxCredit',
		'postCode',
		'abn',
		'telephone',
		'fax',
	];

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{Object.entries({
				Code: 'code',
				Name: 'name',
				ABN: 'abn',
				Email: 'email',
				Telephone: 'telephone',
				Fax: 'fax',
				Address1: 'address1',
				Address2: 'address2',
				City: 'city',
				State: 'state',
				PostCode: 'postCode',
				Country: 'country',
				RegisteredName: 'registeredName',
				BusinessCodeID: 'businessCodeID',
				Marketing: 'marketing',
				UnallocatedCash: 'unallocatedCash',
				ImputedTaxCredit: 'imputedTaxCredit',
				Username: 'username',
			}).map(([label, key]) => (
				<div key={key}>
					<label className="text-sm font-semibold text-brand-dark mb-2 block">
						{label}
					</label>
					<input
						name={key}
						type="text"
						className="w-full px-4 py-3 rounded-lg border-2 border-brand-silver focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent transition"
						value={form[key] ?? ''}
						onChange={
							numericFields.includes(key) ? handleNumericInput : handleTextInput
						}
						placeholder={label === 'ABN' ? '11 digits' : ''}
						readOnly={isViewMode}
					/>
				</div>
			))}
		</div>
	);
}

export default function Clients() {
	const location = useLocation();
	const [tab, setTab] = useState('browse');
	const [term, setTerm] = useState('');
	const [items, setItems] = useState([]);
	const [form, setForm] = useState({});
	const [selectedId, setSelectedId] = useState(null);
	const [isViewMode, setIsViewMode] = useState(false); // New: track view-only mode
	const [okMsg, setOkMsg] = useState('');
	const [errMsg, setErrMsg] = useState('');

	// Ref for scrolling to form section
	const formCardRef = useRef(null);
	const [scrollTrigger, setScrollTrigger] = useState(0);

	// Auto-scroll to form section when a record is loaded
	useEffect(() => {
		if (selectedId && formCardRef.current && scrollTrigger > 0) {
			smoothScrollToElement(formCardRef.current, 1000, 80);
		}
	}, [scrollTrigger]);

	// Handle AI navigation with search term
	useEffect(() => {
		if (location.state?.searchTerm) {
			const searchTerm = location.state.searchTerm;
			setTerm(searchTerm);
			// Auto-trigger search after a brief delay
			setTimeout(() => {
				loadWithTerm(searchTerm);
			}, 500);
		}
	}, [location.state]);

	// Register page actions for AI Assistant
	useEffect(() => {
		const pageActionsConfig = {
			search: async ({ term: searchTerm = '' }) => {
				setTerm(searchTerm);

				try {
					const res = await http(
						`/api/clients?term=${encodeURIComponent(searchTerm)}`
					);
					setItems(res.items || []);

					return {
						success: true,
						message: `Found ${res.items?.length || 0} client(s)`,
						resultCount: res.items?.length || 0,
						results: res.items || [],
					};
				} catch (e) {
					const errorMsg = e?.message || 'Failed to load clients';
					setErrMsg(errorMsg);
					setTimeout(() => setErrMsg(''), 4000);
					return {
						success: false,
						message: errorMsg,
					};
				}
			},

			edit: async ({ clientId, clientName, clientCode }) => {
				let targetClientId = clientId;

				// If name or code provided, find clientId from results
				if (!targetClientId && (clientName || clientCode)) {
					const match = items.find(
						(c) =>
							(clientName &&
								c.name?.toLowerCase() === clientName.toLowerCase()) ||
							(clientCode && c.code?.toLowerCase() === clientCode.toLowerCase())
					);

					if (!match) {
						return {
							success: false,
							message: `Could not find client "${clientName || clientCode}"`,
						};
					}

					targetClientId = match.clientID;
				}

				if (!targetClientId) {
					return {
						success: false,
						message: 'Please provide clientId, clientName, or clientCode',
					};
				}

				try {
					const c = await http(`/api/clients/${targetClientId}`);
					setSelectedId(c.clientID);
					setForm(c);
					setTab('browse');
					setOkMsg('');
					setErrMsg('');

					return {
						success: true,
						message: `Loaded client for editing: ${c.name || c.code}`,
						clientId: c.clientID,
						clientData: c,
					};
				} catch (e) {
					const errorMsg = e?.message || 'Failed to load client';
					setErrMsg(errorMsg);
					setTimeout(() => setErrMsg(''), 4000);
					return {
						success: false,
						message: errorMsg,
					};
				}
			},

			create: async () => {
				setTab('form');
				resetForm();
				return {
					success: true,
					message: 'Opening form to create new client',
				};
			},
		};

		const pageData = {
			searchTerm: term,
			results: items,
			resultCount: items.length,
			hasResults: items.length > 0,
			selectedClient: selectedId,
			currentTab: tab,
		};

		pageActions.registerPage('clients', pageActionsConfig, pageData);

		return () => {
			pageActions.unregisterPage('clients');
		};
	}, [term, items, selectedId, tab]);

	// Helper function to search with a specific term
	async function loadWithTerm(searchTerm) {
		try {
			const res = await http(
				`/api/clients?term=${encodeURIComponent(searchTerm)}`
			);
			setItems(res.items || []);
		} catch (e) {
			setErrMsg(e?.message || 'Failed to load clients');
			setTimeout(() => setErrMsg(''), 4000);
		}
	}

	// Define columns for the DataTable
	const tableColumns = useMemo(
		() => [
			{
				key: 'code',
				label: 'Code',
				render: (value) => <span className="font-medium">{value}</span>,
			},
			{
				key: 'name',
				label: 'Name',
			},
			{
				key: 'abn',
				label: 'ABN',
			},
			{
				key: 'email',
				label: 'Email',
			},
			{
				key: 'telephone',
				label: 'Phone',
			},
			{
				key: 'actions',
				label: 'Actions',
				className: 'text-center',
				render: (_, row) => (
					<div className="flex gap-2 justify-center">
						<button
							className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium hover:shadow-lg transition-all duration-200 hover:scale-[1.05]"
							onClick={(e) => {
								e.stopPropagation();
								pickView(row.clientID);
							}}
						>
							<FaEye className="inline mr-1" />
							View
						</button>
						<button
							className="px-4 py-2 rounded-lg bg-gradient-to-r from-brand-light to-brand-aqua text-white font-medium hover:shadow-lg transition-all duration-200 hover:scale-[1.05]"
							onClick={(e) => {
								e.stopPropagation();
								pick(row.clientID);
							}}
						>
							<FaEdit className="inline mr-1" />
							Edit
						</button>
					</div>
				),
			},
		],
		[]
	);

	function resetForm() {
		setSelectedId(null);
		setForm({
			code: '',
			name: '',
			abn: '',
			email: '',
			telephone: '',
			fax: '',
			address1: '',
			address2: '',
			city: '',
			state: '',
			postCode: '',
			country: '',
			registeredName: '',
			businessCodeID: 0,
			marketing: 0,
			unallocatedCash: 0,
			imputedTaxCredit: 0,
			username: '',
		});
		setOkMsg('');
		setErrMsg('');
	}

	useEffect(() => {
		resetForm();
		load();
	}, []);

	async function load() {
		try {
			const res = await http(`/api/clients?term=${encodeURIComponent(term)}`);
			setItems(res.items || []);
		} catch (e) {
			setErrMsg(e?.message || 'Failed to load clients');
			setTimeout(() => setErrMsg(''), 4000);
		}
	}

	async function handleSearch() {
		await load();
	}

	async function pick(id) {
		try {
			const c = await http(`/api/clients/${id}`);
			setSelectedId(c.clientID);
			setForm(c);
			setTab('browse');
			setIsViewMode(false); // Edit mode
			setOkMsg('');
			setErrMsg('');
			setScrollTrigger((prev) => prev + 1); // Trigger scroll
		} catch (e) {
			setErrMsg(e?.message || 'Failed to load client');
			setTimeout(() => setErrMsg(''), 4000);
		}
	}

	async function pickView(id) {
		try {
			const c = await http(`/api/clients/${id}`);
			setSelectedId(c.clientID);
			setForm(c);
			setTab('browse');
			setIsViewMode(true); // View mode
			setOkMsg('');
			setErrMsg('');
			setScrollTrigger((prev) => prev + 1); // Trigger scroll
		} catch (e) {
			setErrMsg(e?.message || 'Failed to load client');
			setTimeout(() => setErrMsg(''), 4000);
		}
	}

	function normalizeAbn(abn) {
		return (abn || '').replace(/\s+/g, '');
	}

	function ensureRequired() {
		if (!form?.name || !form?.code) {
			setErrMsg('Name and Code are required');
			return false;
		}
		if (!form?.abn) {
			setErrMsg('ABN is required');
			return false;
		}
		if (!validateABN(form.abn)) {
			setErrMsg('Please enter a valid Australian Business Number (ABN)');
			return false;
		}
		if (form?.email && !validateEmail(form.email)) {
			setErrMsg('Please enter a valid email address');
			return false;
		}
		return true;
	}

	async function create() {
		if (!ensureRequired()) return;
		try {
			const payload = { ...form, abn: normalizeAbn(form.abn) };
			const res = await http('/api/clients', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});
			setSelectedId(res.clientID);
			setOkMsg('Client created successfully.');
			setErrMsg('');
			setTab('browse');
			load();
			setTimeout(() => setOkMsg(''), 3000);
		} catch (e) {
			setErrMsg(e?.message || 'Create failed.');
			setTimeout(() => setErrMsg(''), 4000);
		}
	}

	async function update() {
		if (!selectedId) return alert('Pick a client first');
		if (!ensureRequired()) return;
		try {
			const payload = { ...form, abn: normalizeAbn(form.abn) };
			await http(`/api/clients/${selectedId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});
			setOkMsg('Client updated successfully.');
			setErrMsg('');
			load();
			setTimeout(() => setOkMsg(''), 3000);
		} catch (e) {
			setErrMsg(e?.message || 'Update failed.');
			setTimeout(() => setErrMsg(''), 4000);
		}
	}

	async function del() {
		if (!selectedId) return alert('Pick a client first');
		if (!confirm('Delete this client?')) return;
		try {
			await http(`/api/clients/${selectedId}`, { method: 'DELETE' });
			resetForm();
			load();
			setOkMsg('Client deleted.');
			setTimeout(() => setOkMsg(''), 2500);
		} catch (e) {
			setErrMsg(e?.message || 'Delete failed.');
			setTimeout(() => setErrMsg(''), 4000);
		}
	}

	return (
		<div className="min-h-screen bg-brand-pearl p-6">
			<div className="max-w-7xl mx-auto space-y-6">
				{/* Header */}
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold text-brand-dark mb-3">
						Client Management
					</h1>
					<p className="text-lg text-brand-blue/80">
						Manage your client accounts and information
					</p>
				</div>

				{/* tabs */}
				<div className="flex gap-3 mb-6 justify-center">
					<button
						className={`px-6 py-3 rounded-xl border-2 font-semibold transition-all duration-200 ${
							tab === 'browse'
								? 'bg-blue-gradient text-white border-transparent shadow-lg'
								: 'bg-white border-brand-silver text-brand-dark hover:bg-brand-ice hover:border-brand-light'
						}`}
						onClick={() => setTab('browse')}
					>
						<FaSearch className="inline mr-2" />
						Browse & Edit
					</button>
					<button
						className={`px-6 py-3 rounded-xl border-2 font-semibold transition-all duration-200 ${
							tab === 'new'
								? 'bg-gradient-to-r from-brand-light to-brand-aqua text-white border-transparent shadow-lg'
								: 'bg-white border-brand-silver text-brand-dark hover:bg-brand-ice hover:border-brand-light'
						}`}
						onClick={() => {
							setTab('new');
							resetForm();
						}}
					>
						<FaUserPlus className="inline mr-2" />
						New Client
					</button>
				</div>

				{tab === 'browse' ? (
					<>
						{/* Search Header */}
						<div className="bg-white rounded-xl shadow-lg border border-brand-silver p-6 border-l-4 border-l-brand-light">
							<h3 className="text-lg font-semibold text-brand-dark border-b border-brand-silver/50 pb-2 mb-4">
								Search Clients
							</h3>
							<div className="flex flex-wrap items-center gap-4">
								<input
									className="flex-1 min-w-[300px] px-4 py-3 rounded-lg border-2 border-brand-silver focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent transition"
									value={term}
									onChange={(e) => setTerm(e.target.value)}
									placeholder="Search by Name / ABN / Code"
									onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
								/>
								<button
									className="px-6 py-3 rounded-lg bg-blue-gradient text-white font-semibold hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
									onClick={handleSearch}
								>
									<FaSearch className="inline mr-2" />
									Search
								</button>
							</div>
						</div>

						{/* DataTable Section */}
						<div className="bg-white rounded-xl shadow-lg border border-brand-silver p-6 border-l-4 border-l-brand-blue">
							<h3 className="text-lg font-semibold text-brand-dark border-b border-brand-silver/50 pb-2 mb-4">
								Client Results ({items.length} total)
							</h3>
							<DataTable
								data={items}
								columns={tableColumns}
								initialPageSize={5}
								emptyMessage="No clients found. Try adjusting your search criteria or create a new client."
								pageSizeOptions={[5, 10, 25, 50]}
							/>
						</div>

						{/* Edit Form Section */}
						{selectedId && (
							<>
								{/* Toolbar */}
								<div
									className="bg-white rounded-xl shadow-lg border border-brand-silver p-6 border-l-4 border-l-brand-blue"
									ref={formCardRef}
								>
									<div className="flex items-center gap-4 flex-wrap">
										<div className="px-4 py-2 rounded-full bg-brand-ice border border-brand-light text-brand-blue text-sm font-semibold">
											Mode:{' '}
											{isViewMode ? (
												<b className="text-blue-600">👁️ View Only</b>
											) : (
												<b className="text-green-600">✏️ Edit Mode</b>
											)}
										</div>
										<div className="px-4 py-2 rounded-full bg-brand-ice border border-brand-light text-brand-blue text-sm font-semibold">
											Client: <b>{form.name || form.code}</b>
										</div>
										{isViewMode && (
											<button
												className="px-6 py-3 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
												onClick={() => pick(selectedId)}
											>
												✏️ Switch to Edit Mode
											</button>
										)}
										{(okMsg || errMsg) && (
											<div
												className={`flex-grow px-4 py-3 rounded-lg text-center font-semibold ${
													okMsg
														? 'bg-green-50 border border-green-200 text-green-700'
														: 'bg-red-50 border border-red-200 text-red-700'
												}`}
											>
												{okMsg || errMsg}
											</div>
										)}
									</div>
								</div>

								<section className="bg-white rounded-xl shadow-lg border border-brand-silver p-6 border-l-4 border-l-brand-aqua">
									<h3 className="font-bold text-xl text-brand-dark mb-6 flex items-center gap-3">
										{isViewMode ? (
											<>
												<FaEye className="text-brand-blue" />
												View Client: {form.name}
											</>
										) : (
											<>
												<FaEdit className="text-brand-blue" />
												Edit Client: {form.name}
											</>
										)}
									</h3>
									<FormFields
										form={form}
										setForm={setForm}
										isViewMode={isViewMode}
									/>
									{!isViewMode && (
										<div className="flex gap-3 mt-6">
											<button
												className="px-6 py-3 rounded-lg bg-blue-gradient text-white font-semibold hover:shadow-lg transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
												onClick={update}
												disabled={!selectedId}
											>
												<FaEdit className="inline mr-2" />
												Update Client
											</button>
											<button
												className="px-6 py-3 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold hover:shadow-lg transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
												onClick={del}
												disabled={!selectedId}
											>
												<FaTrashAlt className="inline mr-2" /> Delete
											</button>
											<button
												className="px-6 py-3 rounded-lg bg-white border-2 border-brand-silver text-brand-dark font-semibold hover:bg-brand-ice hover:border-brand-light transition-all duration-200"
												onClick={resetForm}
											>
												Cancel
											</button>
										</div>
									)}
								</section>
							</>
						)}
					</>
				) : (
					// create form
					<section className="bg-white rounded-xl shadow-lg border border-brand-silver p-6 border-l-4 border-l-brand-light">
						<h3 className="font-bold text-xl text-brand-dark mb-6 flex items-center gap-3">
							<FaUserPlus className="text-brand-blue" />
							New Client
						</h3>
						<FormFields form={form} setForm={setForm} />
						<div className="flex gap-3 mt-6">
							<button
								className="px-6 py-3 rounded-lg bg-gradient-to-r from-brand-light to-brand-aqua text-white font-semibold hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
								onClick={create}
							>
								<FaUserPlus className="inline mr-2" />
								Create Client
							</button>
							<button
								className="px-6 py-3 rounded-lg bg-white border-2 border-brand-silver text-brand-dark font-semibold hover:bg-brand-ice hover:border-brand-light transition-all duration-200"
								onClick={resetForm}
							>
								Reset
							</button>
						</div>
					</section>
				)}
			</div>
		</div>
	);
}
