import React from 'react';
import { FaStar } from 'react-icons/fa';

export default function ChatButton({ onOpen }) {
	return (
		<div className="fixed bottom-6 right-6 z-50">
			<button
				onClick={onOpen}
				className="group relative w-16 h-16 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-full shadow-2xl hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center animate-pulse hover:animate-none"
			>
				<div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full opacity-30 group-hover:opacity-50 transition-opacity blur-lg"></div>
				<div className="relative z-10 flex items-center justify-center">
					<FaStar className="text-white text-xl animate-spin-slow" />
				</div>
				{/* <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full border-2 border-white flex items-center justify-center shadow-lg">
					<div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
				</div> */}
			</button>

			{/* Floating tooltip */}
			<div className="absolute bottom-20 right-0 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
				Ask WinBeat AI Assistant
				<div className="absolute top-full right-4 w-2 h-2 bg-gray-900 transform rotate-45 -translate-y-1"></div>
			</div>
		</div>
	);
}
