// Input.jsx (or keep in same file but OUTSIDE the component)
import React from 'react';

export const Card = React.memo(function Card({ children, className = '' }) {
	return (
		<div
			className={`bg-white border border-gray-200 rounded-[10px] p-4 ${className}`}
		>
			{children}
		</div>
	);
});

export const SectionTitle = React.memo(function SectionTitle({ children }) {
	return <div className="font-semibold mb-2">{children}</div>;
});

export const Input = React.memo(function Input({
	label,
	name,
	value,
	type = 'text',
	required = false,
	onChange,
}) {
	return (
		<label className="grid gap-1 text-xs text-gray-700">
			<span className="font-medium">
				{label} {required && <span className="text-red-600">*</span>}
			</span>
			<input
				name={name}
				type={type}
				value={value ?? ''}
				required={required}
				className="px-3 py-2 rounded border outline-none focus:ring-2 focus:ring-blue-300"
				onChange={onChange}
			/>
		</label>
	);
});
export const textInput =
	'px-3 py-2 border border-[#cfcfcf] rounded-[8px] bg-white focus:outline-none focus:ring-2 focus:ring-blue-300';

export const Flag = React.memo(function Flag({
	label,
	name,
	checked,
	onChange,
}) {
	return (
		<label className="flex items-center gap-2 text-[14px]">
			<input
				type="checkbox"
				className="scale-[1.15] mr-1"
				checked={!!checked}
				onChange={(e) => onChange(name, e.target.checked)}
			/>
			{label}
		</label>
	);
});

export const BankRadio = React.memo(function BankRadio({
	label,
	name,
	value,
	current,
	onChange,
}) {
	return (
		<label className="flex items-center gap-2 text-[14px]">
			<input
				type="radio"
				name={name}
				className="scale-[1.15] mr-1"
				checked={current === value}
				onChange={() => onChange(value)}
			/>
			{label}
		</label>
	);
});
