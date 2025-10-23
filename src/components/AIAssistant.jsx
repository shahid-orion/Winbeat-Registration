import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';
import validateABN from '@/lib/utils';
import api from '@/lib/api';
import geminiAI from '@/lib/geminiAI';
import pageActions from '@/lib/pageActions';
import { ChatButton, ChatWindow } from './chatComponents';

export default function AIAssistant() {
	const [isOpen, setIsOpen] = useState(false);
	const [messages, setMessages] = useState([
		{
			id: 1,
			type: 'assistant',
			content:
				"Hi! I'm your WinBeat AI Assistant powered by Gemini 2.0 Flash. I can help you analyze data, navigate pages, and answer questions about registrations, clients, and users. What can I help you with today?",
			timestamp: new Date(),
			source: 'system',
		},
	]);
	const [inputValue, setInputValue] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const messagesEndRef = useRef(null);
	const textareaRef = useRef(null);
	const navigate = useNavigate();
	const { user } = useAuth();

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	const handleSendMessage = async () => {
		if (!inputValue.trim() || isLoading) return;

		const userMessage = {
			id: Date.now(),
			type: 'user',
			content: inputValue.trim(),
			timestamp: new Date(),
		};

		setMessages((prev) => [...prev, userMessage]);
		const query = inputValue.trim();
		setInputValue('');
		setIsLoading(true);

		try {
			// Process the user's request
			const response = await processAIRequest(query);

			const assistantMessage = {
				id: Date.now() + 1,
				type: 'assistant',
				content: response.message,
				timestamp: new Date(),
				data: response.data,
				action: response.action,
				source: response.source || 'system',
			};

			setMessages((prev) => [...prev, assistantMessage]);

			// Execute navigation if needed
			if (response.navigation) {
				setTimeout(() => {
					navigate(response.navigation.path, {
						state: response.navigation.state,
					});
				}, 1000);
			}
		} catch (error) {
			const errorMessage = {
				id: Date.now() + 1,
				type: 'assistant',
				content:
					'I apologize, but I encountered an error processing your request. Please try again.',
				timestamp: new Date(),
				source: 'error',
			};
			setMessages((prev) => [...prev, errorMessage]);
		} finally {
			setIsLoading(false);
		}
	};

	// Handle page-specific actions
	const handlePageAction = async (query) => {
		const pageContext = pageActions.getPageContext();

		if (!pageContext.page) {
			return null; // No page actions available
		}

		const lowerQuery = query.toLowerCase();

		// MANAGE REGISTRATIONS PAGE ACTIONS
		if (pageContext.page === 'manage-registrations') {
			// Search action
			if (lowerQuery.includes('search') || lowerQuery.includes('find')) {
				// Extract search parameters
				let company = '';
				let abn = '';
				let lin = '';

				// Check for "all registrations"
				if (
					lowerQuery.includes('all registration') ||
					lowerQuery === 'search'
				) {
					// Search with empty parameters to get all
					company = '';
					abn = '';
					lin = '';
				}
				// Check for company name
				else if (
					lowerQuery.includes('search for') ||
					lowerQuery.includes('find')
				) {
					// Extract the search term after "search for" or "find"
					const searchForMatch =
						query.match(/search\s+(?:for\s+)?(.+)/i) ||
						query.match(/find\s+(.+)/i);
					if (searchForMatch) {
						const searchTerm = searchForMatch[1].trim();

						// Determine if it's ABN (numbers only, 11 digits)
						if (/^\d{11}$/.test(searchTerm.replace(/\s/g, ''))) {
							abn = searchTerm.replace(/\s/g, '');
						}
						// Check if it's LIN (has "LIN" or "lin" in query)
						else if (lowerQuery.includes('lin')) {
							lin = searchTerm;
						}
						// Otherwise treat as company name
						else {
							company = searchTerm;
						}
					}
				}

				try {
					const result = await pageActions.executeAction('search', {
						company,
						abn,
						lin,
					});

					if (result.success) {
						let searchDesc = company
							? `company "${company}"`
							: abn
							? `ABN ${abn}`
							: lin
							? `LIN ${lin}`
							: 'all registrations';

						return {
							message: `I've searched for ${searchDesc}. ${result.message}`,
							source: 'page-action',
							actionResult: result,
						};
					} else {
						return {
							message: `Search failed: ${result.message}`,
							source: 'page-action-error',
							actionResult: result,
						};
					}
				} catch (error) {
					return {
						message: `Error executing search: ${error.message}`,
						source: 'error',
					};
				}
			}

			// Edit action
			if (lowerQuery.includes('edit')) {
				// Extract company name after "edit"
				const editMatch = query.match(/edit\s+(.+)/i);
				if (editMatch) {
					const companyName = editMatch[1].trim();

					try {
						const result = await pageActions.executeAction('edit', {
							companyName,
						});

						if (result.success) {
							return {
								message: `I've loaded the registration for editing. ${result.message}`,
								source: 'page-action',
								actionResult: result,
							};
						} else {
							return {
								message: `Unable to edit: ${result.message}`,
								source: 'page-action-error',
								actionResult: result,
							};
						}
					} catch (error) {
						return {
							message: `Error loading registration: ${error.message}`,
							source: 'error',
						};
					}
				}
			}

			// Download PDF action
			if (lowerQuery.includes('download') && lowerQuery.includes('pdf')) {
				try {
					const result = await pageActions.executeAction('downloadPdf');

					if (result.success) {
						return {
							message: `✅ ${result.message}`,
							source: 'page-action',
							actionResult: result,
						};
					} else {
						return {
							message: `❌ ${result.message}`,
							source: 'page-action-error',
							actionResult: result,
						};
					}
				} catch (error) {
					return {
						message: `Error downloading PDF: ${error.message}`,
						source: 'error',
					};
				}
			}
		}

		return null; // No page action matched
	};

	const processAIRequest = async (query) => {
		const lowerQuery = query.toLowerCase();

		// First, check for page-specific actions
		const pageActionResult = await handlePageAction(query);
		if (pageActionResult) {
			return pageActionResult;
		}

		// Get page context for Gemini
		const pageContext = pageActions.getPageContext();

		// Check if Gemini should handle this query
		if (geminiAI.isConfigured() && geminiAI.shouldUseGemini(query)) {
			try {
				// For complex queries, use Gemini with context and page awareness
				const geminiResponse = await geminiAI.generateResponse(
					query,
					user,
					{},
					pageContext
				);

				if (geminiResponse.success) {
					return {
						message: geminiResponse.message,
						source: geminiResponse.source,
					};
				}
			} catch (error) {
				console.error('Gemini failed, falling back to rule-based:', error);
				// Continue to rule-based logic below
			}
		}

		// Rule-based logic for specific WinBeat actions
		// Navigation commands
		if (
			lowerQuery.includes('go to') ||
			lowerQuery.includes('navigate to') ||
			lowerQuery.includes('open')
		) {
			return await handleNavigationRequest(lowerQuery);
		}

		// Search commands
		if (lowerQuery.includes('search for') || lowerQuery.includes('find')) {
			return await handleSearchRequest(lowerQuery, query);
		}

		// Data analysis commands
		if (
			lowerQuery.includes('analyze') ||
			lowerQuery.includes('check') ||
			lowerQuery.includes('wrong') ||
			lowerQuery.includes('invalid')
		) {
			return await handleAnalysisRequest(lowerQuery);
		}

		// General information request
		if (
			lowerQuery.includes('how many') ||
			lowerQuery.includes('count') ||
			lowerQuery.includes('total')
		) {
			return await handleCountRequest(lowerQuery);
		}

		// If no rule matches and Gemini is not configured, use default response
		if (!geminiAI.isConfigured()) {
			return {
				message: `I'm your WinBeat AI Assistant! I can help you with:
				
🔍 **Data Analysis**
• "Check which clients have invalid ABNs"
• "Find registrations expiring soon"
• "Show me users with admin access"

📊 **Statistics & Reports**
• "How many clients do we have?"
• "Count active registrations"
• "List all expired registrations"

🧭 **Smart Navigation**
• "Go to manage clients"
• "Open user management" (admin only)
• "Take me to home page"

🔎 **Intelligent Search**
• "Search for ABC Strata registration"
• "Find client with ABN 12345678901"
• "Look up user john.doe"

💡 **Quick Actions**
• "Show me clients in Sydney"
• "Find registrations without LIN numbers"
• "Check security levels of all users"

Just ask me anything about your WinBeat data or where you'd like to go!`,
				source: 'rule-based',
			};
		}

		// If Gemini is configured but query didn't match rules, try Gemini anyway
		try {
			const pageContext = pageActions.getPageContext();
			const geminiResponse = await geminiAI.generateResponse(
				query,
				user,
				{},
				pageContext
			);
			return {
				message: geminiResponse.message,
				source: geminiResponse.source,
			};
		} catch (error) {
			return {
				message:
					"I'm not sure how to help with that. Try asking about clients, registrations, users, or navigation.",
				source: 'fallback',
			};
		}
	};

	const handleNavigationRequest = async (query) => {
		if (query.includes('client') || query.includes('manage client')) {
			return {
				message: 'Navigating to the Client Management page...',
				navigation: { path: '/clients' },
				source: 'rule-based',
			};
		}

		if (query.includes('registration') && query.includes('manage')) {
			return {
				message: 'Navigating to the Registration Management page...',
				navigation: { path: '/manage' },
				source: 'rule-based',
			};
		}

		if (query.includes('registration') || query.includes('new registration')) {
			return {
				message: 'Navigating to the Registration page...',
				navigation: { path: '/registration' },
				source: 'rule-based',
			};
		}

		if (query.includes('user') || query.includes('manage user')) {
			if (!user || Number(user.security) < 2) {
				return {
					message:
						'Sorry, you need admin privileges to access user management.',
					source: 'rule-based',
				};
			}
			return {
				message: 'Navigating to the User Management page...',
				navigation: { path: '/users' },
				source: 'rule-based',
			};
		}

		if (query.includes('home') || query.includes('dashboard')) {
			return {
				message: 'Navigating to the Home page...',
				navigation: { path: '/home' },
				source: 'rule-based',
			};
		}

		return {
			message:
				'I can navigate to: Home, Registration, Manage Registration, Manage Clients, or Manage Users (admin only). Which page would you like to visit?',
			source: 'rule-based',
		};
	};

	const handleSearchRequest = async (query, originalQuery) => {
		// Extract search term
		const searchTermMatch = originalQuery.match(
			/(?:search for|find)\s+(.+?)(?:\s+registration|\s+client|$)/i
		);
		const searchTerm = searchTermMatch ? searchTermMatch[1].trim() : '';

		if (query.includes('registration')) {
			return {
				message: `Navigating to Registration Management and searching for "${searchTerm}"...`,
				navigation: {
					path: '/manage',
					state: { searchTerm },
				},
				source: 'rule-based',
			};
		}

		if (query.includes('client')) {
			return {
				message: `Navigating to Client Management and searching for "${searchTerm}"...`,
				navigation: {
					path: '/clients',
					state: { searchTerm },
				},
				source: 'rule-based',
			};
		}

		return {
			message: `I can search for registrations or clients. Please specify: "Search for ${searchTerm} registration" or "Search for ${searchTerm} client"`,
			source: 'rule-based',
		};
	};

	const handleAnalysisRequest = async (query) => {
		try {
			const pageContext = pageActions.getPageContext();

			if (
				query.includes('abn') ||
				query.includes('wrong abn') ||
				query.includes('invalid abn')
			) {
				const { data } = await api.get('/clients');
				const clients = data.items || [];

				const invalidABNs = clients.filter((client) => {
					if (!client.abn) return true; // Missing ABN
					return !validateABN(client.abn); // Invalid ABN using proper validation
				});

				// If Gemini is available and we have data, provide contextual analysis
				if (geminiAI.isConfigured() && invalidABNs.length > 0) {
					try {
						const contextualResponse =
							await geminiAI.generateContextualResponse(
								`Analyze ${invalidABNs.length} clients with invalid ABNs. Provide insights and recommendations.`,
								user,
								{ invalidABNs, totalClients: clients.length },
								pageContext
							);

						return {
							message: contextualResponse.message,
							data: invalidABNs.slice(0, 5).map((client) => ({
								name: client.name,
								code: client.code,
								abn: client.abn || 'Missing',
								issue: !client.abn ? 'Missing ABN' : 'Invalid format',
							})),
							source: contextualResponse.source,
						};
					} catch (error) {
						// Fallback to rule-based response
					}
				}

				return {
					message: `Found ${invalidABNs.length} clients with invalid ABNs:`,
					data: invalidABNs.map((client) => ({
						name: client.name,
						code: client.code,
						abn: client.abn || 'Missing',
						issue: !client.abn ? 'Missing ABN' : 'Invalid format',
					})),
					source: 'rule-based',
				};
			}

			if (
				query.includes('expir') ||
				query.includes('soon') ||
				query.includes('expire')
			) {
				const { data } = await api.get(
					'/api/registrations/search?company=&abn=&lin='
				);
				const registrations = data.items || [];

				const now = new Date();
				const threeMonthsFromNow = new Date(
					now.getTime() + 90 * 24 * 60 * 60 * 1000
				);

				const expiringSoon = registrations.filter((reg) => {
					const expiryDate = new Date(reg.expiryDate);
					return expiryDate <= threeMonthsFromNow && expiryDate >= now;
				});

				// Enhanced analysis with Gemini if available
				if (geminiAI.isConfigured() && expiringSoon.length > 0) {
					try {
						const contextualResponse =
							await geminiAI.generateContextualResponse(
								`Analyze ${expiringSoon.length} registrations expiring in the next 3 months. Provide business insights and action recommendations.`,
								user,
								{ expiringSoon, totalRegistrations: registrations.length },
								pageContext
							);

						return {
							message: contextualResponse.message,
							data: expiringSoon.slice(0, 5).map((reg) => ({
								company: reg.companyName,
								ledgerID: reg.ledgerID,
								expiryDate: reg.expiryDate,
								daysUntilExpiry: Math.ceil(
									(new Date(reg.expiryDate) - now) / (1000 * 60 * 60 * 24)
								),
							})),
							source: contextualResponse.source,
						};
					} catch (error) {
						// Fallback to rule-based
					}
				}

				return {
					message: `Found ${expiringSoon.length} registrations expiring in the next 3 months:`,
					data: expiringSoon.map((reg) => ({
						company: reg.companyName,
						ledgerID: reg.ledgerID,
						expiryDate: reg.expiryDate,
						daysUntilExpiry: Math.ceil(
							(new Date(reg.expiryDate) - now) / (1000 * 60 * 60 * 24)
						),
					})),
					source: 'rule-based',
				};
			}

			if (
				query.includes('admin') ||
				query.includes('security') ||
				query.includes('user')
			) {
				if (!user || Number(user.security) < 2) {
					return {
						message: 'Sorry, you need admin privileges to analyze user data.',
					};
				}

				const { data } = await api.get('/users');
				const users = data || [];

				if (query.includes('admin')) {
					const adminUsers = users.filter((u) => Number(u.security) >= 2);
					return {
						message: `Found ${adminUsers.length} users with admin access:`,
						data: adminUsers.map((u) => ({
							userCode: u.userCode,
							security: u.security === 2 ? 'Admin' : 'Super Admin',
							branch:
								u.branchID === 1
									? 'Sydney'
									: u.branchID === 2
									? 'Melbourne'
									: 'Not Set',
							country: u.country || 'Not Set',
						})),
					};
				}

				return {
					message: `User Security Analysis - Total Users: ${users.length}`,
					data: [
						{
							level: 'Viewer (0)',
							count: users.filter((u) => Number(u.security) === 0).length,
						},
						{
							level: 'Editor (1)',
							count: users.filter((u) => Number(u.security) === 1).length,
						},
						{
							level: 'Admin (2)',
							count: users.filter((u) => Number(u.security) >= 2).length,
						},
					],
				};
			}

			if (
				query.includes('lin') ||
				query.includes('without lin') ||
				query.includes('missing lin')
			) {
				const { data } = await api.get(
					'/api/registrations/search?company=&abn=&lin='
				);
				const registrations = data.items || [];

				const withoutLIN = registrations.filter(
					(reg) => !reg.lin || reg.lin.trim() === ''
				);

				return {
					message: `Found ${withoutLIN.length} registrations without LIN numbers:`,
					data: withoutLIN.map((reg) => ({
						company: reg.companyName,
						ledgerID: reg.ledgerID,
						abn: reg.companyABN,
						expiryDate: reg.expiryDate,
					})),
				};
			}

			if (
				query.includes('sydney') ||
				query.includes('melbourne') ||
				query.includes('branch')
			) {
				const { data } = await api.get('/clients');
				const clients = data.items || [];

				if (query.includes('sydney')) {
					// Assuming clients might have location data or we could infer from other fields
					return {
						message:
							'To analyze clients by location, I need location data in the client records. Currently analyzing by other criteria...',
					};
				}
			}

			return {
				message:
					'I can analyze: Invalid ABNs, expiring registrations, user security levels, missing LIN numbers, and more. What would you like me to check?',
			};
		} catch (error) {
			return {
				message:
					'Unable to retrieve data for analysis. Please ensure you have the necessary permissions.',
			};
		}
	};

	const handleCountRequest = async (query) => {
		try {
			if (query.includes('client')) {
				const { data } = await api.get('/clients');
				const count = data.items?.length || 0;
				return {
					message: `You currently have **${count} clients** in the system.`,
					source: 'rule-based',
				};
			}

			if (query.includes('registration')) {
				const { data } = await api.get(
					'/api/registrations/search?company=&abn=&lin='
				);
				const count = data.items?.length || 0;
				return {
					message: `You currently have **${count} registrations** in the system.`,
					source: 'rule-based',
				};
			}

			if (query.includes('user')) {
				if (!user || Number(user.security) < 2) {
					return {
						message:
							'Sorry, you need admin privileges to view user statistics.',
					};
				}
				const { data } = await api.get('/users');
				const count = data?.length || 0;
				return {
					message: `You currently have **${count} users** in the system.`,
					source: 'rule-based',
				};
			}

			return {
				message:
					'I can count clients, registrations, or users (admin only). What would you like me to count?',
				source: 'rule-based',
			};
		} catch (error) {
			return {
				message:
					'Unable to retrieve count data. Please ensure you have the necessary permissions.',
				source: 'error',
			};
		}
	};

	const formatTimestamp = (timestamp) => {
		return new Intl.DateTimeFormat('en-US', {
			hour: '2-digit',
			minute: '2-digit',
		}).format(timestamp);
	};

	return (
		<>
			{!isOpen && <ChatButton onOpen={() => setIsOpen(true)} />}
			{isOpen && (
				<ChatWindow
					messages={messages}
					isLoading={isLoading}
					inputValue={inputValue}
					onInputChange={(e) => setInputValue(e.target.value)}
					onSendMessage={handleSendMessage}
					onClose={() => setIsOpen(false)}
					messagesEndRef={messagesEndRef}
					formatTimestamp={formatTimestamp}
					user={user}
				/>
			)}
		</>
	);
}
