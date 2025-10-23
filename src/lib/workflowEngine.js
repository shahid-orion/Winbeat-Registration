/**
 * Workflow Engine Service
 * Handles multi-step AI workflows that span across pages and actions
 */

import pageActions from './pageActions';

class WorkflowEngine {
	constructor() {
		this.currentWorkflow = null;
		this.workflowHistory = [];
		this.isExecuting = false;
	}

	/**
	 * Define complex workflows that combine multiple actions
	 */
	workflows = {
		// Workflow: Go to page, search, edit, and download PDF
		'search-edit-download': {
			name: 'Search, Edit, and Download PDF',
			description:
				'Navigate to page, search for record, edit it, and download PDF',
			steps: [
				{
					id: 'navigate',
					action: 'navigate',
					description: 'Navigate to target page',
				},
				{
					id: 'search',
					action: 'search',
					description: 'Search for the record',
				},
				{
					id: 'edit',
					action: 'edit',
					description: 'Load record for editing',
				},
				{
					id: 'download',
					action: 'downloadPdf',
					description: 'Download PDF',
				},
			],
		},

		// Workflow: Search and edit
		'search-edit': {
			name: 'Search and Edit',
			description: 'Navigate to page, search for record, and edit it',
			steps: [
				{
					id: 'navigate',
					action: 'navigate',
					description: 'Navigate to target page',
				},
				{
					id: 'search',
					action: 'search',
					description: 'Search for the record',
				},
				{
					id: 'edit',
					action: 'edit',
					description: 'Load record for editing',
				},
			],
		},

		// Workflow: Navigate and search
		'navigate-search': {
			name: 'Navigate and Search',
			description: 'Navigate to page and perform search',
			steps: [
				{
					id: 'navigate',
					action: 'navigate',
					description: 'Navigate to target page',
				},
				{
					id: 'search',
					action: 'search',
					description: 'Search for records',
				},
			],
		},

		// Workflow: Create with pre-filled data
		'navigate-create': {
			name: 'Navigate and Create',
			description: 'Navigate to page and open create form',
			steps: [
				{
					id: 'navigate',
					action: 'navigate',
					description: 'Navigate to target page',
				},
				{
					id: 'create',
					action: 'create',
					description: 'Open create form',
				},
			],
		},
	};

	/**
	 * Parse natural language query to identify workflow intent
	 */
	identifyWorkflow(query, currentPage) {
		const lowerQuery = query.toLowerCase();

		// Complex multi-step patterns
		if (
			lowerQuery.includes('go to') &&
			lowerQuery.includes('search') &&
			lowerQuery.includes('download')
		) {
			return {
				workflowId: 'search-edit-download',
				confidence: 0.9,
			};
		}

		if (
			lowerQuery.includes('go to') &&
			lowerQuery.includes('search') &&
			lowerQuery.includes('edit')
		) {
			return {
				workflowId: 'search-edit',
				confidence: 0.9,
			};
		}

		if (
			lowerQuery.includes('go to') &&
			(lowerQuery.includes('search') || lowerQuery.includes('find'))
		) {
			return {
				workflowId: 'navigate-search',
				confidence: 0.85,
			};
		}

		if (
			lowerQuery.includes('go to') &&
			(lowerQuery.includes('create') || lowerQuery.includes('add'))
		) {
			return {
				workflowId: 'navigate-create',
				confidence: 0.85,
			};
		}

		// Single-step patterns (if on same page)
		if (!lowerQuery.includes('go to') && lowerQuery.includes('search')) {
			if (
				lowerQuery.includes('edit') ||
				lowerQuery.includes('download') ||
				lowerQuery.includes('and then')
			) {
				return {
					workflowId: 'search-edit-download',
					confidence: 0.8,
					skipNavigation: true,
				};
			}
		}

		return null;
	}

	/**
	 * Extract parameters from natural language query
	 */
	extractParameters(query) {
		const params = {
			page: null,
			searchTerm: null,
			company: null,
			abn: null,
			lin: null,
			userCode: null,
			clientName: null,
		};

		const lowerQuery = query.toLowerCase();

		// Extract target page
		if (
			lowerQuery.includes('manage registration') ||
			lowerQuery.includes('registration page')
		) {
			params.page = 'manage-registrations';
		} else if (lowerQuery.includes('client')) {
			params.page = 'clients';
		} else if (lowerQuery.includes('user')) {
			params.page = 'users';
		}

		// Extract search term - look for patterns like "search for ABC Strata"
		// Use lookahead to match until " and " (not just characters 'a','n','d')
		const searchPatterns = [
			/search\s+for\s+(.+?)(?:\s+and\s+|\s*$)/i,
			/find\s+(.+?)(?:\s+and\s+|\s*$)/i,
			/look\s+for\s+(.+?)(?:\s+and\s+|\s*$)/i,
		];

		for (const pattern of searchPatterns) {
			const match = query.match(pattern);
			if (match) {
				const term = match[1].trim();
				params.searchTerm = term;

				// Determine if it's company, ABN, LIN, etc.
				if (/^\d{11}$/.test(term.replace(/\s/g, ''))) {
					params.abn = term.replace(/\s/g, '');
				} else if (lowerQuery.includes('lin')) {
					params.lin = term;
				} else if (params.page === 'manage-registrations') {
					params.company = term;
				} else if (params.page === 'clients') {
					params.clientName = term;
				} else if (params.page === 'users') {
					params.userCode = term;
				}

				break;
			}
		}

		// Debug logging
		console.log('[WorkflowEngine] extractParameters query:', query);
		console.log('[WorkflowEngine] extractParameters result:', params);

		return params;
	}

	/**
	 * Execute a multi-step workflow
	 */
	async executeWorkflow(workflowId, parameters, navigate, callbacks = {}) {
		if (this.isExecuting) {
			return {
				success: false,
				message: 'Another workflow is currently executing. Please wait.',
			};
		}

		const workflow = this.workflows[workflowId];
		if (!workflow) {
			return {
				success: false,
				message: `Unknown workflow: ${workflowId}`,
			};
		}

		this.isExecuting = true;
		this.currentWorkflow = {
			id: workflowId,
			workflow,
			parameters,
			startTime: Date.now(),
			steps: [],
		};

		const results = {
			success: true,
			workflowId,
			workflowName: workflow.name,
			steps: [],
			totalSteps: workflow.steps.length,
			completedSteps: 0,
			failedStep: null,
		};

		try {
			// Execute each step in sequence
			for (let i = 0; i < workflow.steps.length; i++) {
				const step = workflow.steps[i];

				// Skip navigation if already on target page
				if (
					step.action === 'navigate' &&
					parameters.skipNavigation &&
					pageActions.getCurrentPage() === parameters.page
				) {
					results.steps.push({
						step: step.id,
						action: step.action,
						status: 'skipped',
						message: 'Already on target page',
					});
					results.completedSteps++;
					continue;
				}

				// Notify progress
				if (callbacks.onStepStart) {
					callbacks.onStepStart(i + 1, workflow.steps.length, step.description);
				}

				// Execute the step
				const stepResult = await this.executeStep(
					step,
					parameters,
					navigate,
					results
				);

				results.steps.push({
					step: step.id,
					action: step.action,
					status: stepResult.success ? 'completed' : 'failed',
					message: stepResult.message,
					data: stepResult.data,
				});

				if (!stepResult.success) {
					results.success = false;
					results.failedStep = step.id;
					results.errorMessage = stepResult.message;
					break;
				}

				results.completedSteps++;

				// Wait a bit between steps for UI to update
				if (i < workflow.steps.length - 1) {
					await this.delay(parameters.delayBetweenSteps || 800);
				}
			}

			// Save to history
			this.workflowHistory.push({
				...this.currentWorkflow,
				endTime: Date.now(),
				results,
			});

			return results;
		} catch (error) {
			console.error('Workflow execution error:', error);
			return {
				success: false,
				message: `Workflow failed: ${error.message}`,
				error: error,
			};
		} finally {
			this.isExecuting = false;
			this.currentWorkflow = null;
		}
	}

	/**
	 * Execute a single workflow step
	 */
	async executeStep(step, parameters, navigate, previousResults) {
		try {
			switch (step.action) {
				case 'navigate':
					return await this.executeNavigate(parameters, navigate);

				case 'search':
					return await this.executeSearch(parameters);

				case 'edit':
					return await this.executeEdit(parameters, previousResults);

				case 'downloadPdf':
					return await this.executeDownloadPdf(parameters);

				case 'create':
					return await this.executeCreate(parameters);

				default:
					return {
						success: false,
						message: `Unknown action: ${step.action}`,
					};
			}
		} catch (error) {
			return {
				success: false,
				message: error.message || String(error),
			};
		}
	}

	/**
	 * Step executors
	 */
	async executeNavigate(params, navigate) {
		if (!params.page) {
			return { success: false, message: 'No target page specified' };
		}

		const pageMap = {
			'manage-registrations': '/manage',
			clients: '/clients',
			users: '/users',
		};

		const path = pageMap[params.page];
		if (!path) {
			return { success: false, message: `Unknown page: ${params.page}` };
		}

		navigate(path);

		// Wait for navigation to complete
		await this.delay(500);

		return {
			success: true,
			message: `Navigated to ${params.page}`,
			data: { page: params.page, path },
		};
	}

	async executeSearch(params) {
		const page = pageActions.getCurrentPage();
		if (!page) {
			return {
				success: false,
				message: 'Not on a page with search capability',
			};
		}

		// Wait for page to register
		await this.delay(300);

		if (page === 'manage-registrations') {
			const result = await pageActions.executeAction('search', {
				company: params.company || '',
				abn: params.abn || '',
				lin: params.lin || '',
			});
			return result;
		} else if (page === 'clients') {
			const result = await pageActions.executeAction('search', {
				term: params.clientName || params.searchTerm || '',
			});
			return result;
		} else if (page === 'users') {
			const result = await pageActions.executeAction('search', {
				userCode: params.userCode || params.searchTerm || '',
			});
			return result;
		}

		return { success: false, message: 'Search not available on this page' };
	}

	async executeEdit(params, previousResults) {
		const page = pageActions.getCurrentPage();
		if (!page) {
			return { success: false, message: 'Not on a page with edit capability' };
		}

		// Extract the identifier from search results or parameters
		let identifier = params.searchTerm || params.company || params.clientName;

		// Debug logging
		console.log('[WorkflowEngine] executeEdit params:', params);
		console.log('[WorkflowEngine] executeEdit identifier:', identifier);
		console.log('[WorkflowEngine] executeEdit page:', page);

		if (page === 'manage-registrations') {
			const companyName = params.company || params.searchTerm;
			console.log(
				'[WorkflowEngine] Calling edit with companyName:',
				companyName
			);

			if (!companyName) {
				return {
					success: false,
					message: 'No company name found in parameters for edit action',
				};
			}

			const result = await pageActions.executeAction('edit', {
				companyName: companyName,
			});
			return result;
		} else if (page === 'clients') {
			const clientName = params.clientName || params.searchTerm;

			if (!clientName) {
				return {
					success: false,
					message: 'No client name found in parameters for edit action',
				};
			}

			const result = await pageActions.executeAction('edit', {
				clientName: clientName,
			});
			return result;
		} else if (page === 'users') {
			const userCode = params.userCode || params.searchTerm;

			if (!userCode) {
				return {
					success: false,
					message: 'No user code found in parameters for edit action',
				};
			}

			const result = await pageActions.executeAction('edit', {
				userCode: userCode,
			});
			return result;
		}

		return { success: false, message: 'Edit not available on this page' };
	}

	async executeDownloadPdf(params) {
		const page = pageActions.getCurrentPage();

		if (page !== 'manage-registrations') {
			return {
				success: false,
				message: 'PDF download only available on Manage Registrations page',
			};
		}

		const result = await pageActions.executeAction('downloadPdf');
		return result;
	}

	async executeCreate(params) {
		const page = pageActions.getCurrentPage();
		if (!page) {
			return {
				success: false,
				message: 'Not on a page with create capability',
			};
		}

		const result = await pageActions.executeAction('create');
		return result;
	}

	/**
	 * Utility: Delay execution
	 */
	delay(ms) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	/**
	 * Get workflow execution history
	 */
	getHistory() {
		return this.workflowHistory;
	}

	/**
	 * Clear workflow history
	 */
	clearHistory() {
		this.workflowHistory = [];
	}

	/**
	 * Check if workflow is currently executing
	 */
	isWorkflowExecuting() {
		return this.isExecuting;
	}

	/**
	 * Get current workflow status
	 */
	getCurrentWorkflowStatus() {
		return this.currentWorkflow;
	}
}

// Export singleton instance
export default new WorkflowEngine();
