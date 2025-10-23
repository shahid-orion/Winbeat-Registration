import React, {
	useMemo,
	useState,
	useCallback,
	useEffect,
	useRef,
} from 'react';
import { useLocation } from 'react-router-dom';
import { http } from '@/lib/api';
import DataTable from '@/components/DataTable';
import validateABN, { smoothScrollToElement } from '../lib/utils';
import pageActions from '../lib/pageActions';

// ---------- UI atoms (memoized) ----------
const Card = React.memo(
	React.forwardRef(function Card({ children, className = '' }, ref) {
		return (
			<div
				ref={ref}
				className={`bg-white rounded-xl shadow-lg border border-brand-silver p-6 ${className}`}
			>
				{children}
			</div>
		);
	})
);

const SectionTitle = React.memo(function SectionTitle({ children }) {
	return (
		<div className="font-bold text-lg text-brand-dark mb-4 flex items-center gap-3">
			<div className="w-2 h-6 bg-blue-gradient rounded-full"></div>
			{children}
		</div>
	);
});

const Input = React.memo(function Input({
	label,
	name,
	value,
	type = 'text',
	required = false,
	onChange,
	readOnly,
	maxLength,
}) {
	return (
		<label className="grid gap-2">
			<span className="text-sm font-semibold text-brand-dark">
				{label} {required && <span className="text-red-500">*</span>}
			</span>
			<input
				name={name}
				type={type}
				value={value ?? ''}
				required={required}
				readOnly={readOnly}
				maxLength={maxLength}
				className="px-4 py-3 rounded-lg border-2 border-brand-silver focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent transition"
				onChange={onChange}
			/>
		</label>
	);
});

const Flag = React.memo(function Flag({
	label,
	name,
	checked,
	onChange,
	disabled = false,
}) {
	return (
		<label
			className={`flex items-center gap-3 p-3 rounded-lg bg-white border border-brand-silver transition-all duration-200 ${
				!disabled
					? 'hover:border-brand-light hover:bg-brand-ice cursor-pointer'
					: 'opacity-60 cursor-not-allowed'
			}`}
		>
			<input
				type="checkbox"
				className="w-5 h-5 text-brand-blue border-2 border-brand-silver rounded-lg focus:ring-2 focus:ring-brand-light focus:ring-offset-2 transition hover:border-brand-blue disabled:opacity-50 disabled:cursor-not-allowed"
				checked={!!checked}
				onChange={(e) => onChange(name, e.target.checked)}
				disabled={disabled}
			/>
			<span className="text-sm font-medium text-brand-dark">{label}</span>
		</label>
	);
});

const BankRadio = React.memo(function BankRadio({
	label,
	name,
	value,
	current,
	onChange,
	disabled = false,
}) {
	return (
		<label
			className={`flex items-center gap-3 p-3 rounded-lg bg-white border border-brand-silver transition-all duration-200 ${
				!disabled
					? 'hover:border-brand-light hover:bg-brand-ice cursor-pointer'
					: 'opacity-60 cursor-not-allowed'
			}`}
		>
			<input
				type="radio"
				name={name}
				className="w-5 h-5 text-brand-blue border-2 border-brand-silver focus:ring-2 focus:ring-brand-light focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
				checked={current === value}
				onChange={() => onChange(value)}
				disabled={disabled}
			/>
			<span className="text-sm font-medium text-brand-dark">{label}</span>
		</label>
	);
});

// ---------- Constants ----------
const funderOptions = [
	{ id: 1, label: 'Atvest' },
	{ id: 2, label: 'CentreAll' },
	{ id: 3, label: 'Elantis' },
	{ id: 4, label: 'Hunter' },
	{ id: 5, label: 'Insure PF' },
	{ id: 6, label: 'MacquariePacific' },
	{ id: 7, label: 'NorthState' },
	{ id: 8, label: 'Premium' },
	{ id: 9, label: 'PremiumPay' },
	{ id: 10, label: 'Principal' },
	{ id: 11, label: 'QPR' },
	{ id: 12, label: 'RedPlanet' },
	{ id: 13, label: 'Westpac' },
];

// helper: cast only when saving
function toIntOrNull(v) {
	if (v === null || v === undefined) return null;
	const s = String(v).trim();
	if (s === '') return null;
	const n = Number(s);
	return Number.isFinite(n) ? n : null;
}

function blankForm() {
	return {
		ledgerID: null,
		clientID: null,
		companyName: '',
		companyABN: '',
		licensedUsers: '1',
		expiryDate: new Date().toISOString().slice(0, 10),
		country: 'AUS',
		bankType: 0,
		LIN: '',
		winbeatnowUsers: '0',
		qlikSenseUsers: '0',
		qlikSenseExtraction: '0',
		coinsurance: false,
		dbServices: false,
		sunrise: false,
		customForms: false,
		claimWrite: false,
		ibna: false,
		instalments: false,
		organiseIT: false,
		export: false,
		dmi: false,
		amSecurity: false,
		steadfast: false,
		iCloseAccounting: false,
		iClosePolicies: false,
		iCloseClaims: false,
		diary: false,
		opg: false,
		elink: false,
		elinkClient: false,
		eLinkExpress: false,
		smartOffice: false,
		qlikView: false,
		winbeatNow: false,
		svu: false,
		qlikSense: false,
	};
}

export default function Manage() {
	const location = useLocation();
	const [search, setSearch] = useState({ company: '', abn: '', lin: '' });
	const [results, setResults] = useState([]);
	const [searched, setSearched] = useState(false);
	const [searchMsg, setSearchMsg] = useState('');

	// Form state - declared early so it can be used in useEffect dependencies
	const [form, setForm] = useState(blankForm());
	const [isEdit, setIsEdit] = useState(false);
	const [isViewMode, setIsViewMode] = useState(false); // New: track view-only mode
	const [formDirty, setFormDirty] = useState(false);
	const [msg, setMsg] = useState('');
	const [ok, setOk] = useState(false);

	const [selectedFunders, setSelectedFunders] = useState([]);
	const [selectedBackgroundFunders, setSelectedBackgroundFunders] = useState(
		[]
	);

	// Ref for Company Information section to scroll to it when editing
	const statusCardRef = useRef(null);
	const [scrollTrigger, setScrollTrigger] = useState(0); // New: force scroll trigger

	// Auto-scroll to Company Information section when a record is loaded for editing
	useEffect(() => {
		if (isEdit && statusCardRef.current && scrollTrigger > 0) {
			smoothScrollToElement(statusCardRef.current, 1000, 80);
		}
	}, [scrollTrigger]); // Watch scrollTrigger to fire on every view/edit click

	// Handle AI navigation with search term
	useEffect(() => {
		if (location.state?.searchTerm) {
			const searchTerm = location.state.searchTerm;
			setSearch({ company: searchTerm, abn: '', lin: '' });
			// Auto-trigger search after a brief delay
			setTimeout(() => {
				doSearchWithTerm(searchTerm);
			}, 500);
		}
	}, [location.state]);

	// Register page actions for AI Assistant
	useEffect(() => {
		const pageActionsConfig = {
			search: async ({ company = '', abn = '', lin = '' }) => {
				setSearch({ company, abn, lin });
				// Wait a bit for state to update
				await new Promise((resolve) => setTimeout(resolve, 100));

				try {
					setSearchMsg('');
					const url = `/api/registrations/search?company=${encodeURIComponent(
						company || ''
					)}&abn=${encodeURIComponent(abn || '')}&lin=${encodeURIComponent(
						lin || ''
					)}`;
					const res = await http(url);
					setResults(res.items ?? []);
					setSearched(true);

					return {
						success: true,
						message: `Found ${res.items?.length || 0} registration(s)`,
						resultCount: res.items?.length || 0,
						results: res.items || [],
					};
				} catch (e) {
					const errorMsg = e?.message ?? String(e);
					setSearchMsg(errorMsg);
					return {
						success: false,
						message: errorMsg,
					};
				}
			},

			edit: async ({ ledgerId, companyName }) => {
				// If company name provided, find ledgerId from results
				let targetLedgerId = ledgerId;

				if (companyName && !ledgerId) {
					const match = results.find(
						(r) => r.companyName?.toLowerCase() === companyName.toLowerCase()
					);

					if (!match) {
						return {
							success: false,
							message: `Could not find registration for "${companyName}"`,
						};
					}

					targetLedgerId = match.ledgerID;
				}

				if (!targetLedgerId) {
					return {
						success: false,
						message: 'Please provide either ledgerId or companyName',
					};
				}

				try {
					await loadByLedger(targetLedgerId);
					return {
						success: true,
						message: `Loaded registration for editing: ${
							form.companyName || targetLedgerId
						}`,
						ledgerId: targetLedgerId,
					};
				} catch (e) {
					return {
						success: false,
						message: e?.message ?? String(e),
					};
				}
			},

			downloadPdf: async () => {
				if (!form.ledgerID) {
					return {
						success: false,
						message:
							'No registration is currently loaded. Please load or create a registration first.',
					};
				}

				try {
					const r = await fetch(`/api/registrations/${form.ledgerID}/pdf`);
					if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
					const blob = await r.blob();
					const link = document.createElement('a');
					link.href = URL.createObjectURL(blob);
					link.download = `Registration-${form.ledgerID}.pdf`;
					document.body.appendChild(link);
					link.click();
					link.remove();
					URL.revokeObjectURL(link.href);
					setMsg('PDF downloaded.');
					setOk(true);

					return {
						success: true,
						message: `PDF downloaded: Registration-${form.ledgerID}.pdf`,
						fileName: `Registration-${form.ledgerID}.pdf`,
					};
				} catch (e) {
					const errorMsg = e?.message ?? String(e);
					setMsg(errorMsg);
					setOk(false);
					return {
						success: false,
						message: errorMsg,
					};
				}
			},
		};

		const pageData = {
			searchState: search,
			results: results,
			resultCount: results.length,
			hasResults: results.length > 0,
			currentForm: form,
			isEdit: isEdit,
			hasLoadedRegistration: !!form.ledgerID,
		};

		pageActions.registerPage(
			'manage-registrations',
			pageActionsConfig,
			pageData
		);

		// Cleanup on unmount
		return () => {
			pageActions.unregisterPage('manage-registrations');
		};
	}, [search, results, form, isEdit]);

	// Helper function to search with a specific term
	async function doSearchWithTerm(term) {
		try {
			setSearchMsg('');
			const url = `/api/registrations/search?company=${encodeURIComponent(
				term || ''
			)}&abn=&lin=`;
			const res = await http(url);
			setResults(res.items ?? []);
			setSearched(true);
		} catch (e) {
			setSearchMsg(e?.message ?? String(e));
		}
	}

	const funderColumns = useMemo(
		() =>
			[0, 1, 2, 3].map((col) => funderOptions.filter((_, i) => i % 4 === col)),
		[]
	);

	// Define columns for the DataTable
	const tableColumns = useMemo(
		() => [
			{
				key: 'ledgerID',
				label: 'LedgerID',
			},
			{
				key: 'clientID',
				label: 'ClientID',
			},
			{
				key: 'companyName',
				label: 'Company',
				render: (value) => <span className="font-medium">{value}</span>,
			},
			{
				key: 'companyABN',
				label: 'ABN',
			},
			{
				key: 'lin',
				label: 'LIN',
			},
			{
				key: 'expiryDate',
				label: 'Expiry',
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
								e.stopPropagation(); // Prevent row click
								viewRow(row.ledgerID);
							}}
						>
							👁️ View
						</button>
						<button
							className="px-4 py-2 rounded-lg bg-gradient-to-r from-brand-light to-brand-aqua text-white font-medium hover:shadow-lg transition-all duration-200 hover:scale-[1.05]"
							onClick={(e) => {
								e.stopPropagation(); // Prevent row click
								editRow(row.ledgerID);
							}}
						>
							✏️ Edit
						</button>
					</div>
				),
			},
		],
		[]
	);

	// ==== stable handlers ====
	const markDirty = useCallback(() => setFormDirty(true), []);
	const handleInput = useCallback((e) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
		setFormDirty(true);
	}, []);

	const handleFlag = useCallback((name, checked) => {
		setForm((prev) => ({ ...prev, [name]: checked }));
		setFormDirty(true);
	}, []);

	const handleBankType = useCallback((val) => {
		setForm((prev) => ({ ...prev, bankType: val }));
		setFormDirty(true);
	}, []);

	// ==== search ====
	async function doSearch() {
		try {
			setSearchMsg('');
			const url = `/api/registrations/search?company=${encodeURIComponent(
				search.company || ''
			)}&abn=${encodeURIComponent(search.abn || '')}&lin=${encodeURIComponent(
				search.lin || ''
			)}`;
			const res = await http(url);
			setResults(res.items ?? []);
			setSearched(true);
		} catch (e) {
			setSearchMsg(e?.message ?? String(e));
		}
	}

	function resetSearch() {
		setSearch({ company: '', abn: '', lin: '' });
		setResults([]);
		setSearched(false);
		setSearchMsg('');
	}

	async function viewRow(ledgerId) {
		await loadByLedger(ledgerId, true); // Pass true for view mode
	}

	async function editRow(ledgerId) {
		await loadByLedger(ledgerId, false); // Pass false for edit mode
	}

	async function loadByLedger(id, viewMode = false) {
		try {
			setMsg('');
			setOk(false);
			const dto = await http(`/api/registrations/${id}`);

			// Log the response to debug field mapping
			console.log('Loaded DTO:', dto);

			// Map all fields from the DTO to form state
			// Handle different possible property name variations from API
			setForm({
				ledgerID: dto.ledgerID ?? dto.ledgerId ?? null,
				clientID: dto.clientID ?? dto.clientId ?? null,
				companyName: dto.companyName ?? '',
				companyABN: dto.companyABN ?? dto.companyAbn ?? '',
				licensedUsers: String(dto.licensedUsers ?? '1'),
				expiryDate: dto.expiryDate ? String(dto.expiryDate).slice(0, 10) : '',
				country: dto.country ?? 'AUS',
				bankType: dto.bankType ?? 0,
				LIN: dto.lin ?? dto.LIN ?? '',
				winbeatnowUsers: String(
					dto.winbeatnowUsers ?? dto.winbeatNowUsers ?? '0'
				),
				qlikSenseUsers: String(dto.qlikSenseUsers ?? '0'),
				qlikSenseExtraction: String(dto.qlikSenseExtraction ?? '0'),

				// Boolean flags - ensure all are populated from DTO
				coinsurance: !!dto.coinsurance,
				dbServices: !!dto.dbServices,
				sunrise: !!dto.sunrise,
				customForms: !!dto.customForms,
				claimWrite: !!dto.claimWrite,
				ibna: !!dto.ibna,
				instalments: !!dto.instalments,
				organiseIT: !!dto.organiseIT,
				export: !!dto.export,
				dmi: !!dto.dmi,
				amSecurity: !!dto.amSecurity,
				steadfast: !!dto.steadfast,
				iCloseAccounting: !!dto.iCloseAccounting,
				iClosePolicies: !!dto.iClosePolicies,
				iCloseClaims: !!dto.iCloseClaims,
				diary: !!dto.diary,
				opg: !!dto.opg,
				elink: !!dto.elink,
				elinkClient: !!dto.elinkClient,
				eLinkExpress: !!dto.eLinkExpress,
				smartOffice: !!dto.smartOffice,
				qlikView: !!dto.qlikView,
				winbeatNow: !!dto.winbeatNow,
				svu: !!dto.svu,
				qlikSense: !!dto.qlikSense,
			});

			// Handle funders - can be array or CSV string
			const f = Array.isArray(dto.funders)
				? dto.funders.slice()
				: typeof dto.funders === 'string' && dto.funders.trim()
				? dto.funders
						.split(',')
						.map((s) => parseInt(s, 10))
						.filter((x) => !isNaN(x))
				: [];

			const bf = Array.isArray(dto.backgroundFunders)
				? dto.backgroundFunders.slice()
				: typeof dto.backgroundFunders === 'string' &&
				  dto.backgroundFunders.trim()
				? dto.backgroundFunders
						.split(',')
						.map((s) => parseInt(s, 10))
						.filter((x) => !isNaN(x))
				: [];

			console.log('Parsed funders:', f);
			console.log('Parsed backgroundFunders:', bf);

			setSelectedFunders(f);
			setSelectedBackgroundFunders(bf);

			setIsEdit(true);
			setIsViewMode(viewMode); // Set view mode state
			setFormDirty(false);
			setMsg(`${viewMode ? 'Viewing' : 'Loaded'} LedgerID ${id}`);
			setOk(true);

			// Trigger scroll every time (increment counter)
			setScrollTrigger((prev) => prev + 1);

			// Log form state after setting
			console.log('Form state after loading:', {
				form: { ...form },
				selectedFunders: f,
				selectedBackgroundFunders: bf,
			});
		} catch (e) {
			setMsg(/404/.test(String(e)) ? 'Not found.' : e?.message ?? String(e));
			setOk(false);
		}
	}

	function validate() {
		const n = (v) => (v === null || v === '' || Number.isNaN(+v) ? 0 : +v);
		if (form.winbeatNow && n(form.winbeatnowUsers) > n(form.licensedUsers))
			throw new Error('winbeatnow users exceeds licensed users.');
		if (!form.companyName?.trim())
			throw new Error('Please enter Company Name.');
		if (!form.companyABN?.trim()) throw new Error('Please enter Company ABN');
		// Validate ABN format and checksum
		if (!validateABN(form.companyABN)) {
			throw new Error('Please enter a valid Australian Business Number (ABN)');
		}
		if (!form.expiryDate) throw new Error('Please enter Expiry Date');
	}

	async function save() {
		try {
			validate();
			setMsg('');
			setOk(false);

			const payload = {
				...form,
				licensedUsers: toIntOrNull(form.licensedUsers) ?? 0,
				winbeatnowUsers: toIntOrNull(form.winbeatnowUsers),
				qlikSenseUsers: toIntOrNull(form.qlikSenseUsers) ?? 0,
				qlikSenseExtraction: String(form.qlikSenseExtraction ?? '0'),
				eLinkExpress: !!form.eLinkExpress,
				funders: [...selectedFunders],
				backgroundFunders: [...selectedBackgroundFunders],
			};

			const t = localStorage.getItem('auth_token');

			const res = await http('/api/registrations', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					...(t ? { Authorization: `Bearer ${t}` } : {}),
				},
				body: JSON.stringify(payload),
			});

			const updatedLedgerID = res.ledgerId ?? form.ledgerID;
			setForm((f) => ({ ...f, ledgerID: updatedLedgerID }));
			setIsEdit(true);
			setFormDirty(false);
			setMsg(`Updated, LedgerID = ${updatedLedgerID}`);
			setOk(true);

			// ✅ Option 1: Full refresh (recommended - simple and reliable)
			if (searched) {
				await doSearch();
			}

			// ✅ Option 2: Smart update (more efficient but complex)
			// if (searched) {
			//   setResults(prevResults => {
			//     const index = prevResults.findIndex(r => r.ledgerID === updatedLedgerID);
			//     if (index >= 0) {
			//       // Update existing row
			//       const updated = [...prevResults];
			//       updated[index] = { ...updated[index], ...form };
			//       return updated;
			//     } else {
			//       // Add new row if it's a new registration
			//       return [...prevResults, { ...form, ledgerID: updatedLedgerID }];
			//     }
			//   });
			// }
		} catch (e) {
			setMsg(e?.message ?? String(e));
			setOk(false);
		}
	}

	async function downloadPdf() {
		try {
			if (!form.ledgerID) throw new Error('Load or save a registration first.');
			const r = await fetch(`/api/registrations/${form.ledgerID}/pdf`);
			if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
			const blob = await r.blob();
			const link = document.createElement('a');
			link.href = URL.createObjectURL(blob);
			link.download = `Registration-${form.ledgerID}.pdf`;
			document.body.appendChild(link);
			link.click();
			link.remove();
			URL.revokeObjectURL(link.href);
			setMsg('PDF downloaded.');
			setOk(true);
		} catch (e) {
			setMsg(e?.message ?? String(e));
			setOk(false);
		}
	}

	// ---------- render ----------
	return (
		<div className="min-h-screen bg-brand-pearl">
			<div className="max-w-7xl mx-auto p-6 space-y-6">
				{/* Header */}
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold text-brand-dark mb-3">
						Manage Registrations
					</h1>
					<p className="text-lg text-brand-blue/80">
						Search and manage existing WinBeat registrations
					</p>
				</div>

				{/* Navigation */}
				<div className="flex gap-3">
					<a
						className="px-4 py-2 rounded-lg bg-white border border-brand-silver hover:bg-brand-ice hover:border-brand-light transition-all duration-200 font-medium text-brand-dark"
						href="/"
					>
						← Home
					</a>
					<a
						className="px-4 py-2 rounded-lg bg-blue-gradient text-white font-semibold hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
						href="/registration"
					>
						➕ New Registration
					</a>
				</div>

				{/* Search box */}
				<Card className="border-l-4 border-l-brand-light">
					<SectionTitle>Search Registrations</SectionTitle>
					<div className="flex flex-wrap items-center gap-4">
						<input
							className="px-4 py-3 rounded-lg border-2 border-brand-silver focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent transition flex-1 min-w-[200px]"
							placeholder="Company Name"
							value={search.company}
							onChange={(e) =>
								setSearch((s) => ({ ...s, company: e.target.value }))
							}
						/>
						<input
							className="px-4 py-3 rounded-lg border-2 border-brand-silver focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent transition flex-1 min-w-[200px]"
							placeholder="ABN"
							value={search.abn}
							onChange={(e) =>
								setSearch((s) => ({ ...s, abn: e.target.value }))
							}
						/>
						<input
							className="px-4 py-3 rounded-lg border-2 border-brand-silver focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent transition flex-1 min-w-[200px]"
							placeholder="LIN"
							value={search.lin}
							onChange={(e) =>
								setSearch((s) => ({ ...s, lin: e.target.value }))
							}
						/>
						<button
							className="px-6 py-3 rounded-lg bg-blue-gradient text-white font-semibold hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
							onClick={doSearch}
						>
							🔍 Search
						</button>
						<button
							className="px-6 py-3 rounded-lg bg-white border-2 border-brand-silver text-brand-dark font-semibold hover:bg-brand-ice hover:border-brand-light transition-all duration-200"
							onClick={resetSearch}
						>
							Clear
						</button>
					</div>

					{searchMsg && (
						<div className="mt-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700">
							{searchMsg}
						</div>
					)}

					{/* Replace old table with DataTable component */}
					{searched && (
						<div className="mt-6">
							<DataTable
								data={results}
								columns={tableColumns}
								initialPageSize={5}
								emptyMessage="No results found. Try adjusting your search criteria."
								pageSizeOptions={[5, 10, 25, 50]}
							/>
						</div>
					)}
				</Card>

				{/* Toolbar */}
				{isEdit && (
					<Card className="border-l-4 border-l-brand-blue" ref={statusCardRef}>
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
								Status:{' '}
								{form.ledgerID ? (
									<b>Loaded #{form.ledgerID}</b>
								) : (
									<span>—</span>
								)}
							</div>
							{!isViewMode && (
								<>
									<button
										className="px-6 py-3 rounded-lg bg-blue-gradient text-white font-semibold hover:shadow-lg transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
										disabled={!formDirty}
										onClick={save}
									>
										💾 Save (Upsert)
									</button>
								</>
							)}
							<button
								className="px-6 py-3 rounded-lg bg-gradient-to-r from-brand-light to-brand-aqua text-white font-semibold hover:shadow-lg transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
								disabled={!form.ledgerID}
								onClick={downloadPdf}
							>
								📥 Download PDF
							</button>
							{isViewMode && (
								<button
									className="px-6 py-3 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
									onClick={() => editRow(form.ledgerID)}
								>
									✏️ Switch to Edit Mode
								</button>
							)}
							{msg && (
								<div
									className={`flex-grow px-4 py-3 rounded-lg text-center font-semibold ${
										ok
											? 'bg-green-50 border border-green-200 text-green-700'
											: 'bg-red-50 border border-red-200 text-red-700'
									}`}
								>
									{msg}
								</div>
							)}
						</div>
					</Card>
				)}

				{/* Edit panel */}
				{isEdit && (
					<div className="space-y-6">
						{/* Company / Identity */}
						<Card
							className="border-l-4 border-l-brand-blue"
							// ref={companyInfoRef}
						>
							<SectionTitle>Company Information</SectionTitle>
							<div className="grid gap-6 lg:grid-cols-3">
								<Input
									label="Company Name"
									name="companyName"
									value={form.companyName}
									required
									onChange={handleInput}
									readOnly={isViewMode}
								/>
								<Input
									label="Company ABN"
									name="companyABN"
									value={form.companyABN}
									required
									onChange={handleInput}
									readOnly={isViewMode}
								/>
								<Input
									label="Country"
									name="country"
									value={form.country}
									onChange={handleInput}
									maxLength={3}
									readOnly={isViewMode}
								/>
								<Input
									label="LIN"
									name="LIN"
									value={form.LIN}
									onChange={handleInput}
									readOnly={true}
								/>
								<Input
									label="Expiry Date"
									name="expiryDate"
									value={form.expiryDate}
									onChange={handleInput}
									type="date"
									readOnly={isViewMode}
								/>
							</div>

							<div className="mt-6 grid gap-6 lg:grid-cols-3">
								<Input
									label="Users"
									name="licensedUsers"
									value={form.licensedUsers}
									onChange={handleInput}
									type="number"
									readOnly={isViewMode}
								/>
								<Input
									label="WinbeatNow Users"
									name="winbeatnowUsers"
									value={form.winbeatnowUsers}
									onChange={handleInput}
									type="number"
									readOnly={isViewMode}
								/>
								<Input
									label="QlikSense Users"
									name="qlikSenseUsers"
									value={form.qlikSenseUsers}
									onChange={handleInput}
									type="number"
									readOnly={isViewMode}
								/>
							</div>
						</Card>

						{/* General options */}
						<Card className="border-l-4 border-l-brand-aqua">
							<SectionTitle>General Options</SectionTitle>
							<div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
								<Flag
									label="Coinsurance"
									name="coinsurance"
									checked={form.coinsurance}
									onChange={handleFlag}
									disabled={isViewMode}
								/>
								<Flag
									label="OrganiseIT"
									name="organiseIT"
									checked={form.organiseIT}
									onChange={handleFlag}
									disabled={isViewMode}
								/>
								<Flag
									label="IBNA"
									name="ibna"
									checked={form.ibna}
									onChange={handleFlag}
									disabled={isViewMode}
								/>
								<Flag
									label="Custom forms"
									name="customForms"
									checked={form.customForms}
									onChange={handleFlag}
									disabled={isViewMode}
								/>
								<Flag
									label="Export"
									name="export"
									checked={form.export}
									onChange={handleFlag}
									disabled={isViewMode}
								/>
								<Flag
									label="DMI"
									name="dmi"
									checked={form.dmi}
									onChange={handleFlag}
									disabled={isViewMode}
								/>
								<Flag
									label="AM security"
									name="amSecurity"
									checked={form.amSecurity}
									onChange={handleFlag}
									disabled={isViewMode}
								/>
								<Flag
									label="Steadfast"
									name="steadfast"
									checked={form.steadfast}
									onChange={handleFlag}
									disabled={isViewMode}
								/>
								<Flag
									label="Diary"
									name="diary"
									checked={form.diary}
									onChange={handleFlag}
									disabled={isViewMode}
								/>
							</div>
						</Card>

						<div className="grid gap-6 lg:grid-cols-2">
							{/* Banking */}
							<Card className="border-l-4 border-l-brand-dark">
								<SectionTitle>Banking Options</SectionTitle>
								<div className="grid gap-4 grid-cols-2">
									<BankRadio
										label="Not applicable"
										name="bankType"
										value={0}
										current={form.bankType}
										onChange={handleBankType}
										disabled={isViewMode}
									/>
									<BankRadio
										label="Automated banking"
										name="bankType"
										value={1}
										current={form.bankType}
										onChange={handleBankType}
										disabled={isViewMode}
									/>
									<BankRadio
										label="MPP"
										name="bankType"
										value={2}
										current={form.bankType}
										onChange={handleBankType}
										disabled={isViewMode}
									/>
									<BankRadio
										label="NAB Transact"
										name="bankType"
										value={3}
										current={form.bankType}
										onChange={handleBankType}
										disabled={isViewMode}
									/>
								</div>
							</Card>

							{/* eLink */}
							<Card className="border-l-4 border-l-brand-light">
								<SectionTitle>eLink</SectionTitle>
								<div className="grid gap-4 grid-cols-3">
									<Flag
										label="Policy"
										name="elink"
										checked={form.elink}
										onChange={handleFlag}
										disabled={isViewMode}
									/>
									<Flag
										label="Client"
										name="elinkClient"
										checked={form.elinkClient}
										onChange={handleFlag}
										disabled={isViewMode}
									/>
									<Flag
										label="eXpress"
										name="eLinkExpress"
										checked={form.eLinkExpress}
										onChange={handleFlag}
										disabled={isViewMode}
									/>
								</div>
							</Card>
						</div>

						<div className="grid gap-6 lg:grid-cols-2">
							{/* EDI */}
							<Card className="border-l-4 border-l-brand-blue">
								<SectionTitle>EDI Options</SectionTitle>
								<div className="grid gap-4 grid-cols-2">
									<Flag
										label="Sunrise"
										name="sunrise"
										checked={form.sunrise}
										onChange={handleFlag}
										disabled={isViewMode}
									/>
									<Flag
										label="iClose - Accounting"
										name="iCloseAccounting"
										checked={form.iCloseAccounting}
										onChange={handleFlag}
										disabled={isViewMode}
									/>
									<Flag
										label="iClose - Policies"
										name="iClosePolicies"
										checked={form.iClosePolicies}
										onChange={handleFlag}
										disabled={isViewMode}
									/>
									<Flag
										label="iClose - Claims"
										name="iCloseClaims"
										checked={form.iCloseClaims}
										onChange={handleFlag}
										disabled={isViewMode}
									/>
									<Flag
										label="Claimwrite"
										name="claimWrite"
										checked={form.claimWrite}
										onChange={handleFlag}
										disabled={isViewMode}
									/>
									<Flag
										label="SmartOffice"
										name="smartOffice"
										checked={form.smartOffice}
										onChange={handleFlag}
										disabled={isViewMode}
									/>
									<Flag
										label="Instalments"
										name="instalments"
										checked={form.instalments}
										onChange={handleFlag}
										disabled={isViewMode}
									/>
									<Flag
										label="OPG"
										name="opg"
										checked={form.opg}
										onChange={handleFlag}
										disabled={isViewMode}
									/>
								</div>
							</Card>

							{/* Qlik */}
							<Card className="border-l-4 border-l-brand-aqua">
								<SectionTitle>Qlik</SectionTitle>
								<div className="grid gap-4 grid-cols-2">
									<Flag
										label="QlikView"
										name="qlikView"
										checked={form.qlikView}
										onChange={handleFlag}
										disabled={isViewMode}
									/>
									<Flag
										label="Qlik Sense"
										name="qlikSense"
										checked={form.qlikSense}
										onChange={handleFlag}
										disabled={isViewMode}
									/>
								</div>

								{form.qlikSense && (
									<div className="mt-6 p-4 bg-brand-ice rounded-lg border border-brand-silver">
										<label className="block text-sm font-semibold text-brand-dark mb-3">
											QlikSense Extraction
										</label>
										<select
											className="w-full px-4 py-3 rounded-lg border-2 border-brand-silver focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent transition bg-white disabled:opacity-60 disabled:cursor-not-allowed"
											value={form.qlikSenseExtraction}
											onChange={(e) => {
												setForm((prev) => ({
													...prev,
													qlikSenseExtraction: e.target.value,
												}));
												markDirty();
											}}
											disabled={isViewMode}
										>
											<option value="0">Not applicable</option>
											<option value="1">Daily</option>
											<option value="2">Weekly</option>
											<option value="3">Monthly</option>
										</select>
									</div>
								)}
							</Card>
						</div>

						{/* Funders */}
						<Card className="border-l-4 border-l-brand-dark">
							<SectionTitle>Funders</SectionTitle>
							<div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
								{funderColumns.map((col, colIndex) => (
									<div key={colIndex} className="space-y-3">
										<div className="font-bold text-sm text-brand-dark mb-3 flex gap-4 px-2">
											<span className="w-5 text-center">A</span>
											<span className="w-5 text-center">BF</span>
											<span>Funder</span>
										</div>
										{col.map((o) => (
											<div
												key={o.id}
												className="grid grid-cols-[20px_20px_1fr] items-center gap-4 py-2 px-2 rounded-lg hover:bg-brand-ice transition-colors"
											>
												<input
													type="checkbox"
													className="w-5 h-5 text-brand-blue border-2 border-brand-silver rounded-lg focus:ring-2 focus:ring-brand-light focus:ring-offset-2 transition hover:border-brand-blue disabled:opacity-50 disabled:cursor-not-allowed"
													checked={selectedFunders.includes(o.id)}
													onChange={(e) => {
														setSelectedFunders((s) =>
															e.target.checked
																? [...s, o.id]
																: s.filter((x) => x !== o.id)
														);
														markDirty();
													}}
													disabled={isViewMode}
												/>
												<input
													type="checkbox"
													className="w-5 h-5 text-brand-aqua border-2 border-brand-silver rounded-lg focus:ring-2 focus:ring-brand-light focus:ring-offset-2 transition hover:border-brand-aqua disabled:opacity-50 disabled:cursor-not-allowed"
													checked={selectedBackgroundFunders.includes(o.id)}
													onChange={(e) => {
														setSelectedBackgroundFunders((s) =>
															e.target.checked
																? [...s, o.id]
																: s.filter((x) => x !== o.id)
														);
														markDirty();
													}}
													disabled={isViewMode}
												/>
												<span className="text-sm font-medium text-brand-dark">
													{o.label}
												</span>
											</div>
										))}
									</div>
								))}
							</div>
							<div className="text-sm font-semibold text-brand-blue/80 mt-6 pt-4 border-t border-brand-silver">
								<span className="bg-brand-ice px-3 py-1 rounded-lg">
									A = Activate
								</span>{' '}
								&nbsp;&nbsp;
								<span className="bg-brand-ice px-3 py-1 rounded-lg">
									BF = Background Funding
								</span>
							</div>
						</Card>
					</div>
				)}
			</div>
		</div>
	);
}
