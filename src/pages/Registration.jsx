import { useMemo, useState, useCallback } from 'react';
import { http } from '@/lib/api';
import {
	Card,
	SectionTitle,
	Input,
	BankRadio,
	textInput,
} from '@/components/ui';
import validateABN, { createNumericInputHandler } from '../lib/utils';

// funders (same list/ordering as the HTML)
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

export default function Registration() {
	const [msg, setMsg] = useState('');
	const [ok, setOk] = useState(false);
	const [savedLedgerId, setSavedLedgerId] = useState(null);

	const [form, setForm] = useState({
		ledgerID: null,
		clientID: null,
		companyName: '', // was null
		companyABN: '', // was null
		licensedUsers: '1', // string
		expiryDate: new Date().toISOString().slice(0, 10),
		country: 'AUS',
		bankType: 0, // radio can stay number
		LIN: '',
		winbeatnowUsers: '0', // string
		qlikSenseUsers: '0', // string
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
	});

	const [selectedFunders, setSelectedFunders] = useState([]);
	const [selectedBackgroundFunders, setSelectedBackgroundFunders] = useState(
		[]
	);

	const funderColumns = useMemo(
		() =>
			[0, 1, 2, 3].map((col) => funderOptions.filter((_, i) => i % 4 === col)),
		[]
	);

	// STABLE handlers (don't create new functions every render)
	const handleInput = useCallback((e) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value })); // keep as string
	}, []);

	// Handler for integer-only input fields (no spaces allowed)
	// Using utility function from utils.js for reusability across pages
	const handleNumericInput = useCallback(
		createNumericInputHandler(setForm),
		[]
	);

	const handleFlag = useCallback((name, checked) => {
		setForm((prev) => ({ ...prev, [name]: checked }));
	}, []);

	const handleBankType = useCallback((val) => {
		setForm((prev) => ({ ...prev, bankType: val }));
	}, []);

	const n = (v) => (v === null || v === '' || Number.isNaN(+v) ? 0 : +v);
	const u = (patch) => setForm((f) => ({ ...f, ...patch }));

	function validate() {
		if (form.winbeatNow && n(form.winbeatnowUsers) > n(form.licensedUsers))
			throw new Error('winbeatnow users exceeds licensed users.');
		if (!form.companyName?.trim()) throw new Error('Please enter Company Name');
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
				licensedUsers: n(form.licensedUsers),
				winbeatnowUsers:
					form.winbeatnowUsers == null ? null : n(form.winbeatnowUsers),
				qlikSenseUsers: n(form.qlikSenseUsers),
				qlikSenseExtraction: String(form.qlikSenseExtraction),
				eLinkExpress: !!form.eLinkExpress,
				funders: [...selectedFunders],
				backgroundFunders: [...selectedBackgroundFunders],
			};

			console.log('Save payload:', payload);

			const t = localStorage.getItem('auth_token');

			const res = await http('/api/registrations', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					...(t ? { Authorization: `Bearer ${t}` } : {}),
				},
				body: JSON.stringify(payload),
			});

			setSavedLedgerId(res.ledgerId);
			setMsg(`Saved OK. LedgerID = ${res.ledgerId}`);
			setOk(true);
		} catch (e) {
			setMsg(e?.message ?? String(e));
			setOk(false);
		}
	}

	async function downloadPdf() {
		try {
			if (!savedLedgerId) throw new Error('Save first, then download.');
			const r = await fetch(`/api/registrations/${savedLedgerId}/pdf`);
			if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
			const blob = await r.blob();
			const a = document.createElement('a');
			a.href = URL.createObjectURL(blob);
			a.download = `Registration-${savedLedgerId}.pdf`;
			document.body.appendChild(a);
			a.click();
			a.remove();
			URL.revokeObjectURL(a.href);
			setMsg('PDF downloaded.');
			setOk(true);
		} catch (e) {
			setMsg(e?.message ?? String(e));
			setOk(false);
		}
	}

	async function printPdf() {
		try {
			if (!savedLedgerId) throw new Error('Save first, then print.');
			const r = await fetch(`/api/registrations/${savedLedgerId}/pdf`);
			if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
			const blob = await r.blob();
			const pdfUrl = URL.createObjectURL(blob);
			const w = window.open(pdfUrl, '_blank');
			if (!w) throw new Error('Popup blocked. Allow popups to print.');
			w.addEventListener('load', () => w.print());
		} catch (e) {
			setMsg(e?.message ?? String(e));
			setOk(false);
		}
	}

	const Flag = ({ label, name }) => (
		<label className="flex items-center gap-3 p-3 rounded-lg bg-white border border-brand-silver hover:border-brand-light hover:bg-brand-ice transition-all duration-200 cursor-pointer group">
			<input
				type="checkbox"
				className="w-5 h-5 text-brand-blue border-2 border-brand-silver rounded-lg focus:ring-2 focus:ring-brand-light focus:ring-offset-2 transition group-hover:border-brand-blue"
				checked={!!form[name]}
				onChange={(e) => u({ [name]: e.target.checked })}
			/>
			<span className="text-sm font-medium text-brand-dark group-hover:text-brand-blue transition-colors">
				{label}
			</span>
		</label>
	);

	return (
		<div className="min-h-screen bg-gradient-to-br from-brand-pearl via-white to-brand-ice/50 p-6">
			<div className="max-w-7xl mx-auto space-y-8">
				{/* Header */}
				<div className="text-center mb-12">
					{/* <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-gradient rounded-2xl shadow-lg mb-6">
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
								d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
					</div> */}
					<h1 className="text-5xl font-bold text-brand-dark mb-4 bg-gradient-to-r from-brand-dark to-brand-blue bg-clip-text text-transparent">
						Winbeat Registration
					</h1>
					<p className="text-xl text-brand-blue/80 max-w-2xl mx-auto leading-relaxed">
						Complete the registration form below to set up your WinBeat account
					</p>
				</div>

				{/* Toolbar */}
				<Card className="relative p-8 bg-gradient-to-r from-white to-brand-ice/30 border-l-4 border-l-brand-blue shadow-xl">
					<div className="flex items-center gap-6 flex-wrap">
						<div className="px-5 py-3 rounded-2xl bg-white border-2 border-brand-light shadow-sm">
							<span className="text-sm font-semibold text-brand-blue">
								Status:{' '}
								{savedLedgerId ? (
									<b className="text-brand-dark">Saved #{savedLedgerId}</b>
								) : (
									<span className="text-brand-silver">—</span>
								)}
							</span>
						</div>

						<button
							className="px-8 py-4 rounded-xl bg-blue-gradient text-white font-bold hover:shadow-2xl transition-all duration-300 hover:scale-105 shadow-lg"
							onClick={save}
						>
							💾 Save (Upsert)
						</button>

						<button
							className="px-8 py-4 rounded-xl bg-gradient-to-r from-brand-light to-brand-aqua text-white font-bold hover:shadow-2xl transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
							disabled={!savedLedgerId}
							onClick={downloadPdf}
						>
							📥 Download PDF
						</button>

						<button
							className="px-8 py-4 rounded-xl bg-gradient-to-r from-white to-brand-silver border-2 border-brand-silver text-brand-dark font-bold hover:shadow-lg transition-all duration-300 hover:scale-105 hover:border-brand-light disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
							disabled={!savedLedgerId}
							onClick={printPdf}
						>
							🖨️ Print
						</button>

						{msg && (
							<div
								className={`flex-grow text-center px-6 py-4 font-semibold text-lg ${
									ok ? 'text-green-500' : 'text-red-500'
								}`}
							>
								{msg}
							</div>
						)}
					</div>
				</Card>

				{/* Company / Identity */}
				<Card className="relative p-8 bg-gradient-to-br from-white to-brand-ice/50 shadow-xl rounded-2xl border-l-4 border-l-brand-light overflow-hidden">
					{/* <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-brand-light/10 to-brand-aqua/10 rounded-full -translate-y-16 translate-x-16"></div> */}
					<SectionTitle className="flex items-center gap-3 mb-6">
						<div className="w-10 h-10 bg-blue-gradient rounded-lg flex items-center justify-center">
							<svg
								className="w-5 h-5 text-white"
								fill="currentColor"
								viewBox="0 0 20 20"
							>
								<path
									fillRule="evenodd"
									d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z"
									clipRule="evenodd"
								/>
							</svg>
						</div>
						Company Information
					</SectionTitle>
					<div className="grid gap-6 lg:grid-cols-3 relative z-10">
						<Input
							label="Company Name"
							name="companyName"
							value={form.companyName}
							required
							onChange={handleInput}
						/>
						<Input
							label="Company ABN"
							name="companyABN"
							value={form.companyABN}
							required
							onChange={handleNumericInput}
							placeholder="e.g., 51 824 753 556"
						/>
						<Input
							label="Country"
							name="country"
							value={form.country}
							onChange={handleInput}
							maxLength={3}
						/>
						<Input
							label="LIN"
							name="LIN"
							value={form.LIN}
							onChange={handleInput}
						/>
						<Input
							label="Expiry Date"
							name="expiryDate"
							value={form.expiryDate}
							onChange={handleInput}
							type="date"
						/>
					</div>

					<div className="mt-8 grid gap-6 lg:grid-cols-3 relative z-10">
						<Input
							label="Users"
							name="licensedUsers"
							value={form.licensedUsers}
							onChange={handleNumericInput}
							placeholder="e.g., 5"
						/>
						<Input
							label="WinbeatNow Users"
							name="winbeatnowUsers"
							value={form.winbeatnowUsers}
							onChange={handleNumericInput}
							placeholder="e.g., 3"
						/>
						<Input
							label="QlikSense Users"
							name="qlikSenseUsers"
							value={form.qlikSenseUsers}
							onChange={handleNumericInput}
							placeholder="e.g., 2"
						/>
					</div>
				</Card>

				{/* General options */}
				<Card className="relative p-8 bg-gradient-to-br from-white to-brand-ice/50 shadow-xl rounded-2xl border-l-4 border-l-brand-aqua">
					<SectionTitle className="flex items-center gap-3 mb-6">
						<div className="w-10 h-10 bg-gradient-to-r from-brand-light to-brand-aqua rounded-lg flex items-center justify-center">
							<svg
								className="w-5 h-5 text-white"
								fill="currentColor"
								viewBox="0 0 20 20"
							>
								<path
									fillRule="evenodd"
									d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
									clipRule="evenodd"
								/>
							</svg>
						</div>
						General Options
					</SectionTitle>
					<div className="grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
						<Flag label="Coinsurance" name="coinsurance" />
						<Flag label="OrganiseIT" name="organiseIT" />
						<Flag label="IBNA" name="ibna" />
						<Flag label="Custom forms" name="customForms" />
						<Flag label="Export" name="export" />
						<Flag label="DMI" name="dmi" />
						<Flag label="AM security" name="amSecurity" />
						<Flag label="Steadfast" name="steadfast" />
						<Flag label="Diary" name="diary" />
					</div>
				</Card>

				{/* Banking + eLink */}
				<div className="grid gap-8 lg:grid-cols-2">
					<Card className="relative p-8 bg-gradient-to-br from-white to-brand-ice/50 shadow-xl rounded-2xl border-l-4 border-l-brand-blue">
						<SectionTitle className="flex items-center gap-3 mb-6">
							<div className="w-10 h-10 bg-gradient-to-r from-brand-blue to-brand-dark rounded-lg flex items-center justify-center">
								<svg
									className="w-5 h-5 text-white"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
									<path
										fillRule="evenodd"
										d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
										clipRule="evenodd"
									/>
								</svg>
							</div>
							Banking Options
						</SectionTitle>
						<div className="grid gap-4 grid-cols-2">
							<BankRadio
								label="Not applicable"
								name="bankType"
								value={0}
								current={form.bankType}
								onChange={handleBankType}
							/>
							<BankRadio
								label="Automated banking"
								name="bankType"
								value={1}
								current={form.bankType}
								onChange={handleBankType}
							/>
							<BankRadio
								label="MPP"
								name="bankType"
								value={2}
								current={form.bankType}
								onChange={handleBankType}
							/>
							<BankRadio
								label="NAB Transact"
								name="bankType"
								value={3}
								current={form.bankType}
								onChange={handleBankType}
							/>
						</div>
					</Card>

					<Card className="relative p-8 bg-gradient-to-br from-white to-brand-ice/50 shadow-xl rounded-2xl border-l-4 border-l-brand-light">
						<SectionTitle className="flex items-center gap-3 mb-6">
							<div className="w-10 h-10 bg-gradient-to-r from-brand-light to-brand-aqua rounded-lg flex items-center justify-center">
								<svg
									className="w-5 h-5 text-white"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fillRule="evenodd"
										d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
										clipRule="evenodd"
									/>
								</svg>
							</div>
							eLink
						</SectionTitle>
						<div className="grid gap-4 grid-cols-3">
							<Flag label="Policy" name="elink" />
							<Flag label="Client" name="elinkClient" />
							<Flag label="eXpress" name="eLinkExpress" />
						</div>
					</Card>
				</div>

				{/* EDI + Qlik */}
				<div className="grid gap-8 lg:grid-cols-2">
					<Card className="relative p-8 bg-gradient-to-br from-white to-brand-ice/50 shadow-xl rounded-2xl border-l-4 border-l-brand-dark">
						<SectionTitle className="flex items-center gap-3 mb-6">
							<div className="w-10 h-10 bg-gradient-to-r from-brand-dark to-brand-blue rounded-lg flex items-center justify-center">
								<svg
									className="w-5 h-5 text-white"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fillRule="evenodd"
										d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
										clipRule="evenodd"
									/>
								</svg>
							</div>
							EDI Options
						</SectionTitle>
						<div className="grid gap-4 grid-cols-2">
							<Flag label="Sunrise" name="sunrise" />
							<Flag label="iClose - Accounting" name="iCloseAccounting" />
							<Flag label="iClose - Policies" name="iClosePolicies" />
							<Flag label="iClose - Claims" name="iCloseClaims" />
							<Flag label="Claimwrite" name="claimWrite" />
							<Flag label="SmartOffice" name="smartOffice" />
							<Flag label="Instalments" name="instalments" />
							<Flag label="OPG" name="opg" />
						</div>
					</Card>

					<Card className="relative p-8 bg-gradient-to-br from-white to-brand-ice/50 shadow-xl rounded-2xl border-l-4 border-l-brand-aqua">
						<SectionTitle className="flex items-center gap-3 mb-6">
							<div className="w-10 h-10 bg-gradient-to-r from-brand-blue to-brand-aqua rounded-lg flex items-center justify-center">
								<svg
									className="w-5 h-5 text-white"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fillRule="evenodd"
										d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
										clipRule="evenodd"
									/>
								</svg>
							</div>
							Qlik
						</SectionTitle>
						<div className="grid gap-4 grid-cols-2">
							<Flag label="QlikView" name="qlikView" />
							<Flag label="Qlik Sense" name="qlikSense" />
						</div>

						{form.qlikSense && (
							<div className="mt-6 p-6 bg-white rounded-xl border-2 border-brand-silver shadow-sm">
								<label className="block text-sm font-semibold text-brand-dark mb-3">
									QlikSense Extraction
								</label>
								<select
									className="w-full px-4 py-3 border-2 border-brand-silver rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent transition bg-white"
									value={form.qlikSenseExtraction}
									onChange={(e) =>
										u({ qlikSenseExtraction: Number(e.target.value) })
									}
								>
									<option value={0}>Not applicable</option>
									<option value={1}>Daily</option>
									<option value={2}>Weekly</option>
									<option value={3}>Monthly</option>
								</select>
							</div>
						)}
					</Card>
				</div>

				{/* Funders */}
				<Card className="relative p-8 bg-gradient-to-br from-white to-brand-ice/50 shadow-xl rounded-2xl border-l-4 border-l-brand-blue overflow-hidden">
					<div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-brand-light/5 to-brand-aqua/5 rounded-full -translate-x-20 -translate-y-20"></div>
					<SectionTitle className="flex items-center gap-3 mb-6 relative z-10">
						<div className="w-10 h-10 bg-gradient-to-r from-brand-dark to-brand-blue rounded-lg flex items-center justify-center">
							<svg
								className="w-5 h-5 text-white"
								fill="currentColor"
								viewBox="0 0 20 20"
							>
								<path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
								<path
									fillRule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
									clipRule="evenodd"
								/>
							</svg>
						</div>
						Funders
					</SectionTitle>

					<div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4 relative z-10">
						{funderColumns.map((col, i) => (
							<div key={i} className="space-y-3">
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
											className="w-5 h-5 text-brand-blue border-2 border-brand-silver rounded-lg focus:ring-2 focus:ring-brand-light focus:ring-offset-2 transition hover:border-brand-blue"
											checked={selectedFunders.includes(o.id)}
											onChange={(e) => {
												setSelectedFunders((s) =>
													e.target.checked
														? [...s, o.id]
														: s.filter((x) => x !== o.id)
												);
											}}
										/>
										<input
											type="checkbox"
											className="w-5 h-5 text-brand-aqua border-2 border-brand-silver rounded-lg focus:ring-2 focus:ring-brand-light focus:ring-offset-2 transition hover:border-brand-aqua"
											checked={selectedBackgroundFunders.includes(o.id)}
											onChange={(e) => {
												setSelectedBackgroundFunders((s) =>
													e.target.checked
														? [...s, o.id]
														: s.filter((x) => x !== o.id)
												);
											}}
										/>
										<span className="text-sm font-medium text-brand-dark">
											{o.label}
										</span>
									</div>
								))}
							</div>
						))}
					</div>

					<div className="text-sm font-semibold text-brand-blue/80 mt-6 pt-4 border-t border-brand-silver relative z-10">
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
		</div>
	);
}
