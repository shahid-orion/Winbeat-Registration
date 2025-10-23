import React from 'react';
import { FaPaperPlane } from 'react-icons/fa';

export default function ChatInput({
	value,
	onChange,
	onSend,
	isLoading,
	messages,
}) {
	return (
		<div className="p-6 bg-white/90 backdrop-blur-sm rounded-b-3xl border-t border-slate-200">
			<div className="flex gap-4 items-end">
				<div className="flex-1 relative">
					<textarea
						value={value}
						onChange={onChange}
						onKeyDown={(e) => {
							if (e.key === 'Enter' && !e.shiftKey) {
								e.preventDefault();
								onSend();
							}
						}}
						placeholder="Ask me anything about WinBeat..."
						className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all resize-none bg-white/80 backdrop-blur-sm placeholder-slate-400 text-slate-800"
						rows="2"
						disabled={isLoading}
						dir="ltr"
						style={{ textAlign: 'left', direction: 'ltr' }}
					/>
					{/* {value.trim() && (
						<div className="absolute top-2 right-2 text-xs text-slate-400 bg-slate-100 rounded-full px-2 py-1">
							Press Enter to send
						</div>
					)} */}
				</div>
				<button
					onClick={onSend}
					disabled={!value.trim() || isLoading}
					className="w-14 h-14 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center group relative overflow-hidden"
				>
					<div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 opacity-0 group-hover:opacity-30 transition-opacity"></div>
					<FaPaperPlane className="text-lg relative z-10 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
				</button>
			</div>

			{/* Quick suggestions */}
			{messages?.length === 1 && (
				<div className="mt-4 flex flex-wrap gap-2">
					{[
						'Check invalid ABNs',
						'Count all clients',
						'Go to manage page',
						'Find expiring registrations',
					].map((suggestion, idx) => (
						<button
							key={idx}
							onClick={() => onChange({ target: { value: suggestion } })}
							className="px-3 py-2 text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors"
						>
							{suggestion}
						</button>
					))}
				</div>
			)}
		</div>
	);
}
