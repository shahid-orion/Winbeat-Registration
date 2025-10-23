/**
 * Page Actions Service
 * Allows AI Assistant to interact with page-specific functionality
 */

class PageActionsService {
	constructor() {
		this.currentPage = null;
		this.actions = {};
		this.pageData = {};
	}

	/**
	 * Register a page and its available actions
	 * @param {string} pageName - Name of the page (e.g., 'manage-registrations')
	 * @param {object} actions - Object containing action functions
	 * @param {object} pageData - Current page data/state
	 */
	registerPage(pageName, actions, pageData = {}) {
		this.currentPage = pageName;
		this.actions[pageName] = actions;
		this.pageData[pageName] = pageData;
		console.log(`[PageActions] Registered page: ${pageName}`, {
			actions: Object.keys(actions),
			data: Object.keys(pageData),
		});
	}

	/**
	 * Unregister a page when component unmounts
	 */
	unregisterPage(pageName) {
		delete this.actions[pageName];
		delete this.pageData[pageName];
		if (this.currentPage === pageName) {
			this.currentPage = null;
		}
		console.log(`[PageActions] Unregistered page: ${pageName}`);
	}

	/**
	 * Execute an action on the current page
	 * @param {string} actionName - Name of the action to execute
	 * @param {any} params - Parameters to pass to the action
	 */
	async executeAction(actionName, params) {
		if (!this.currentPage) {
			throw new Error('No page is currently registered');
		}

		const pageActions = this.actions[this.currentPage];
		if (!pageActions) {
			throw new Error(`No actions registered for page: ${this.currentPage}`);
		}

		const action = pageActions[actionName];
		if (!action) {
			throw new Error(
				`Action "${actionName}" not found on page: ${this.currentPage}`
			);
		}

		console.log(
			`[PageActions] Executing ${actionName} on ${this.currentPage}`,
			params
		);
		return await action(params);
	}

	/**
	 * Get current page data
	 */
	getPageData(pageName) {
		return this.pageData[pageName || this.currentPage] || {};
	}

	/**
	 * Get available actions for current page
	 */
	getAvailableActions(pageName) {
		const page = pageName || this.currentPage;
		return page ? Object.keys(this.actions[page] || {}) : [];
	}

	/**
	 * Check if a specific action is available
	 */
	hasAction(actionName) {
		return this.getAvailableActions().includes(actionName);
	}

	/**
	 * Get current page name
	 */
	getCurrentPage() {
		return this.currentPage;
	}

	/**
	 * Get page context for AI
	 */
	getPageContext() {
		if (!this.currentPage) {
			return {
				page: null,
				actions: [],
				data: {},
			};
		}

		return {
			page: this.currentPage,
			actions: this.getAvailableActions(),
			data: this.getPageData(),
		};
	}
}

// Export singleton instance
export default new PageActionsService();
