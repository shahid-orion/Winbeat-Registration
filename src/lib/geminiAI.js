import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiAIService {
	constructor() {
		this.apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
		this.genAI = new GoogleGenerativeAI(this.apiKey);
		this.model = this.genAI.getGenerativeModel({
			model: 'gemini-2.0-flash-exp',
			generationConfig: {
				temperature: 0.7,
				topP: 0.8,
				topK: 40,
				maxOutputTokens: 1024,
			},
		});
	}

	// System prompt that gives Gemini context about WinBeat
	getSystemPrompt(user, availableData = {}, pageContext = null) {
		let pageInfo = '';
		if (pageContext && pageContext.page) {
			pageInfo = `

CURRENT PAGE: ${pageContext.page}
Available Page Actions: ${pageContext.actions.join(', ')}
Page State: ${JSON.stringify(pageContext.data, null, 2)}

When the user requests a page-specific action:
1. Identify the intent (search, edit, download, etc.)
2. Extract relevant parameters from their natural language
3. Format your response to indicate the action should be triggered
4. Use phrases like "I'll search for..." or "Let me edit..." to show the action will be performed`;
		}

		return `You are WinBeat AI Assistant, an intelligent assistant for the WinBeat Registration Management System.

CONTEXT:
- User: ${user?.userCode || 'Unknown'} (Security Level: ${user?.security || 0})
- System: WinBeat manages client registrations, ABN validations, and user accounts
- Available data: ${
			Object.keys(availableData).join(', ') || 'None loaded'
		}${pageInfo}

CAPABILITIES YOU CAN SUGGEST:
1. Data Analysis: "Check invalid ABNs", "Find expiring registrations", "Show user security levels"
2. Navigation: "Go to clients page", "Open registration form", "Navigate to manage users"
3. Search: "Find client ABC Corp", "Search for registration with LIN 12345"
4. Statistics: "Count all clients", "How many registrations expire this month"

PAGE-SPECIFIC ACTIONS (when on relevant pages):
- Manage Registrations: Trigger searches, edit records, download PDFs
- Clients: Search and filter client data
- User Management: Create, edit, or search users

IMPORTANT RULES:
- Keep responses concise and professional
- For page actions, acknowledge what you're doing (e.g., "I'll search for...")
- For data analysis, explain what you would check and why
- If you need specific data to answer, say what data would be needed
- Use business terminology appropriate for registration management
- Always maintain a helpful, professional tone

Current user security level: ${
			user?.security || 0
		} (0=Viewer, 1=Editor, 2=Admin)
${
	user?.security < 2
		? 'Note: User has limited privileges. Admin functions require security level 2+.'
		: 'Note: User has admin privileges.'
}

Please respond to the user's query in a helpful and contextually appropriate way.`;
	}

	// Determine if query should use Gemini or rule-based logic
	shouldUseGemini(query) {
		const lowerQuery = query.toLowerCase();

		// Use rule-based for simple, specific actions
		const simpleActions = [
			'go to',
			'navigate to',
			'open',
			'search for',
			'find',
			'count',
			'how many',
			'total',
			'check invalid abn',
			'check wrong abn',
			'expiring registrations',
			'expire soon',
		];

		// If it's a simple action, use rule-based
		if (simpleActions.some((action) => lowerQuery.includes(action))) {
			return false;
		}

		// Use Gemini for complex questions, explanations, general chat
		return true;
	}

	// Generate response using Gemini
	async generateResponse(query, user, context = {}, pageContext = null) {
		try {
			const systemPrompt = this.getSystemPrompt(user, context, pageContext);
			const fullPrompt = `${systemPrompt}\n\nUser Query: "${query}"\n\nResponse:`;

			const result = await this.model.generateContent(fullPrompt);
			const response = await result.response;
			const text = response.text();

			return {
				message: text,
				source: 'gemini',
				success: true,
			};
		} catch (error) {
			console.error('Gemini AI Error:', error);

			// Fallback message
			return {
				message: `I'm having trouble processing your request right now. You can try:
				
🔍 **Data Commands**: "Check invalid ABNs", "Find expiring registrations"
🧭 **Navigation**: "Go to clients", "Open registration page"  
📊 **Statistics**: "Count all clients", "How many users"
🔎 **Search**: "Find client ABC Corp", "Search registration XYZ"

Please try rephrasing your question or use one of these specific commands.`,
				source: 'fallback',
				success: false,
				error: error.message,
			};
		}
	}

	// Enhanced context-aware response with data integration
	async generateContextualResponse(
		query,
		user,
		availableData = {},
		pageContext = null
	) {
		const systemPrompt = `${this.getSystemPrompt(
			user,
			availableData,
			pageContext
		)}

AVAILABLE DATA CONTEXT:
${Object.entries(availableData)
	.map(([key, value]) => {
		if (Array.isArray(value)) {
			return `- ${key}: ${value.length} items available`;
		}
		return `- ${key}: ${JSON.stringify(value).substring(0, 100)}...`;
	})
	.join('\n')}

Use this context to provide specific, data-aware responses.`;

		try {
			const fullPrompt = `${systemPrompt}\n\nUser Query: "${query}"\n\nContextual Response:`;

			const result = await this.model.generateContent(fullPrompt);
			const response = await result.response;
			const text = response.text();

			return {
				message: text,
				source: 'gemini-contextual',
				success: true,
				context: Object.keys(availableData),
			};
		} catch (error) {
			console.error('Contextual Gemini Error:', error);
			return this.generateResponse(query, user, availableData, pageContext);
		}
	}

	// Check if Gemini service is properly configured
	isConfigured() {
		return !!this.apiKey && this.apiKey !== 'your_api_key_here';
	}

	// Get service status
	getStatus() {
		return {
			configured: this.isConfigured(),
			model: 'gemini-2.0-flash-exp',
			apiKey: this.apiKey ? `${this.apiKey.substring(0, 8)}...` : 'Not set',
		};
	}
}

// Export singleton instance
export default new GeminiAIService();
