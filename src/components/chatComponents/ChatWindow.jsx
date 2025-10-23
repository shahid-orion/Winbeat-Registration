import React from 'react';
import { FaTimes, FaStar } from 'react-icons/fa';
import ChatInput from './ChatInput';

export default function ChatWindow({
	messages,
	isLoading,
	inputValue,
	onInputChange,
	onSendMessage,
	onClose,
	messagesEndRef,
	formatTimestamp,
	user,
}) {
	return (
		<div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 z-50 flex flex-col overflow-hidden">
			{/* Header */}
			<div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white p-4 flex items-center justify-between rounded-t-3xl relative overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 backdrop-blur-sm"></div>
				<div className="flex items-center gap-3 relative z-10">
					<div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
						<FaStar className="text-xl animate-pulse" />
					</div>
					<div>
						<h3 className="font-bold text-lg">WinBeat AI</h3>
						<div className="text-sm text-indigo-100 flex items-center gap-1">
							<div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
							Always ready to help
						</div>
					</div>
				</div>
				<button
					onClick={onClose}
					className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105 relative z-10"
				>
					<FaTimes className="text-lg" />
				</button>
			</div>

			{/* Messages */}
			<div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-slate-50/50 to-white/80">
				{messages.map((message) => (
					<div
						key={message.id}
						className={`flex ${
							message.type === 'user' ? 'justify-end' : 'justify-start'
						}`}
					>
						<div
							className={`flex gap-3 max-w-[85%] ${
								message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
							}`}
						>
							{/* Avatar */}
							<div
								className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
									message.type === 'user'
										? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
										: 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
								}`}
							>
								{message.type === 'user' ? (
									<span className="text-xs font-bold">
										{user?.userCode?.[0]?.toUpperCase() || 'U'}
									</span>
								) : (
									<FaStar className="text-xs" />
								)}
							</div>

							{/* Message bubble */}
							<div
								className={`rounded-2xl px-4 py-3 backdrop-blur-sm ${
									message.type === 'user'
										? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
										: 'bg-white/90 border border-slate-200 text-slate-800 shadow-sm'
								}`}
							>
								<div className="text-sm leading-relaxed whitespace-pre-line">
									{message.content}
								</div>

								{/* Data display */}
								{message.data && (
									<div className="mt-4 p-4 bg-slate-50/80 rounded-xl border border-slate-200 backdrop-blur-sm">
										<div className="space-y-3">
											{message.data.slice(0, 5).map((item, idx) => (
												<div
													key={idx}
													className="text-xs bg-white/80 rounded-lg p-3 border border-slate-200 backdrop-blur-sm"
												>
													{Object.entries(item).map(([key, value]) => (
														<div
															key={key}
															className="flex justify-between items-center py-1"
														>
															<span className="font-semibold text-indigo-600 capitalize">
																{key.replace(/([A-Z])/g, ' $1')}:
															</span>
															<span className="text-slate-700 font-medium">
																{value}
															</span>
														</div>
													))}
												</div>
											))}
											{message.data.length > 5 && (
												<div className="text-xs text-indigo-500 italic text-center py-2">
													... and {message.data.length - 5} more items
												</div>
											)}
										</div>
									</div>
								)}

								<div
									className={`text-xs mt-2 flex items-center justify-between ${
										message.type === 'user' ? 'text-blue-100' : 'text-slate-500'
									}`}
								>
									<span>{formatTimestamp(message.timestamp)}</span>
									{message.type === 'assistant' && message.source && (
										<span
											className={`px-2 py-1 rounded-full text-xs font-medium ${
												message.source === 'gemini' ||
												message.source === 'gemini-contextual'
													? 'bg-purple-100 text-purple-600 border border-purple-200'
													: message.source === 'page-action'
													? 'bg-green-100 text-green-600 border border-green-200'
													: message.source === 'page-action-error'
													? 'bg-orange-100 text-orange-600 border border-orange-200'
													: 'bg-blue-100 text-blue-600 border border-blue-200'
											}`}
										>
											{message.source === 'gemini'
												? '🤖 Gemini'
												: message.source === 'gemini-contextual'
												? '🧠 Gemini+'
												: message.source === 'page-action'
												? '⚡ Action'
												: message.source === 'page-action-error'
												? '⚠️ Action'
												: message.source === 'rule-based'
												? '⚡ Rules'
												: '🔧 System'}
										</span>
									)}
								</div>
							</div>
						</div>
					</div>
				))}

				{/* Loading indicator */}
				{isLoading && (
					<div className="flex justify-start">
						<div className="bg-white border border-brand-silver rounded-2xl px-4 py-3 shadow-sm">
							<div className="flex items-center gap-2">
								<div className="flex gap-1">
									<div className="w-2 h-2 bg-brand-blue rounded-full animate-bounce"></div>
									<div
										className="w-2 h-2 bg-brand-blue rounded-full animate-bounce"
										style={{ animationDelay: '0.1s' }}
									></div>
									<div
										className="w-2 h-2 bg-brand-blue rounded-full animate-bounce"
										style={{ animationDelay: '0.2s' }}
									></div>
								</div>
								<span className="text-sm text-brand-blue/70">Thinking...</span>
							</div>
						</div>
					</div>
				)}

				<div ref={messagesEndRef} />
			</div>

			<ChatInput
				value={inputValue}
				onChange={onInputChange}
				onSend={onSendMessage}
				isLoading={isLoading}
				messages={messages}
			/>
		</div>
	);
}
