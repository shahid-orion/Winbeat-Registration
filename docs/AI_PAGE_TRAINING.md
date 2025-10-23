# Page-Specific AI Training System

## Overview

The WinBeat AI Assistant now includes a page-specific training system that allows the AI to interact with page functions and trigger UI actions. This document explains how the system works and how to extend it to other pages.

## Architecture

### Core Components

1. **PageActionsService** (`src/lib/pageActions.js`)

   - Singleton service that manages page registrations
   - Stores available actions and page data
   - Executes actions and returns results

2. **Page Registration** (e.g., `src/pages/Manage.jsx`)

   - Pages register their actions on mount using `useEffect`
   - Provide action functions and current page state
   - Unregister on unmount to prevent memory leaks

3. **AI Handler** (`src/components/AIAssistant.jsx`)

   - `handlePageAction()` function processes page-specific queries
   - Parses natural language to extract parameters
   - Executes page actions and returns formatted responses

4. **Gemini Integration** (`src/lib/geminiAI.js`)
   - System prompts now include page context
   - Gemini receives information about available page actions
   - Helps with complex queries and natural language understanding

## Manage Registration Page Features

### 1. Search Functionality

**User Commands:**

- "search for all registrations"
- "search for ABC Strata"
- "find registration with ABN 12345678901"
- "search by LIN 12345"

**How it works:**

```javascript
// AI extracts parameters from natural language
{ company: "ABC Strata", abn: "", lin: "" }

// Executes the search action
pageActions.executeAction('search', { company, abn, lin })

// Updates UI and returns result
"I've searched for company 'ABC Strata'. Found 3 registration(s)"
```

### 2. Edit Record

**User Commands:**

- "Edit ABC Strata"
- "Edit the record for ABC Strata"

**How it works:**

```javascript
// AI matches company name against search results
const match = results.find((r) => r.companyName.toLowerCase() === 'abc strata');

// Loads the registration for editing
pageActions.executeAction('edit', { companyName: 'ABC Strata' });

// Result: Registration loaded in form
("I've loaded the registration for editing. Loaded registration for editing: ABC Strata");
```

### 3. Download PDF

**User Commands:**

- "download PDF"
- "download the PDF file"

**How it works:**

```javascript
// Checks if registration is loaded
if (!form.ledgerID) {
  return error message
}

// Triggers PDF download
pageActions.executeAction('downloadPdf')

// Result: PDF file downloaded
"✅ PDF downloaded: Registration-12345.pdf"
```

## Adding Page Training to Other Pages

### Step 1: Register Page Actions

In your page component (e.g., `Clients.jsx`):

```javascript
import pageActions from '@/lib/pageActions';
import { useEffect } from 'react';

export default function Clients() {
	// ... your component code

	useEffect(() => {
		const pageActionsConfig = {
			search: async ({ query }) => {
				// Your search logic
				return {
					success: true,
					message: `Found ${results.length} clients`,
					results,
				};
			},

			filter: async ({ location }) => {
				// Your filter logic
				return {
					success: true,
					message: `Filtered clients by ${location}`,
				};
			},
		};

		const pageData = {
			currentFilters: filters,
			resultCount: clients.length,
			hasResults: clients.length > 0,
		};

		pageActions.registerPage('clients', pageActionsConfig, pageData);

		return () => {
			pageActions.unregisterPage('clients');
		};
	}, [filters, clients]); // Dependencies: update when state changes

	// ... rest of component
}
```

### Step 2: Add AI Handler Logic

In `AIAssistant.jsx`, add handler for your page in the `handlePageAction()` function:

```javascript
// CLIENTS PAGE ACTIONS
if (pageContext.page === 'clients') {
	if (lowerQuery.includes('search') || lowerQuery.includes('find')) {
		// Extract search term
		const searchMatch = query.match(/search\s+(?:for\s+)?(.+)/i);
		if (searchMatch) {
			const searchTerm = searchMatch[1].trim();

			const result = await pageActions.executeAction('search', {
				query: searchTerm,
			});

			return {
				message: `Searched for "${searchTerm}". ${result.message}`,
				source: 'page-action',
				actionResult: result,
			};
		}
	}

	if (lowerQuery.includes('filter')) {
		// Extract filter parameters
		const locationMatch = query.match(/filter.*?(sydney|melbourne|brisbane)/i);
		if (locationMatch) {
			const location = locationMatch[1];

			const result = await pageActions.executeAction('filter', { location });

			return {
				message: `Filtered clients by location. ${result.message}`,
				source: 'page-action',
				actionResult: result,
			};
		}
	}
}
```

### Step 3: Update Gemini System Prompt (Optional)

Add page-specific examples to `geminiAI.js` system prompt:

```javascript
PAGE-SPECIFIC ACTIONS (when on relevant pages):
- Manage Registrations: Trigger searches, edit records, download PDFs
- Clients: Search and filter client data, view details
- User Management: Create, edit, or search users
```

## Best Practices

### 1. Action Return Format

Always return a consistent format from page actions:

```javascript
{
  success: boolean,
  message: string,
  // Optional additional data
  resultCount?: number,
  results?: Array,
  fileName?: string
}
```

### 2. Error Handling

Handle errors gracefully in action functions:

```javascript
try {
	// Your action logic
	return { success: true, message: 'Success!' };
} catch (e) {
	return {
		success: false,
		message: e?.message ?? String(e),
	};
}
```

### 3. Natural Language Parsing

Use flexible regex patterns to match user intent:

```javascript
// Match multiple variations
const searchPattern = /(?:search|find|look for|show me)\s+(?:for\s+)?(.+)/i;
const editPattern = /(?:edit|modify|change)\s+(.+)/i;
```

### 4. Parameter Extraction

Be smart about extracting parameters:

```javascript
// Detect ABN (11 digits)
if (/^\d{11}$/.test(searchTerm.replace(/\s/g, ''))) {
	abn = searchTerm.replace(/\s/g, '');
}
// Detect LIN
else if (lowerQuery.includes('lin')) {
	lin = searchTerm;
}
// Default to company name
else {
	company = searchTerm;
}
```

### 5. User Feedback

Provide clear, actionable feedback:

```javascript
// Good
"I've searched for company 'ABC Strata'. Found 3 registration(s)";

// Bad
'Search completed';
```

## Testing Page Actions

### Manual Testing Checklist

1. **Search Tests:**

   - [ ] "search for all registrations"
   - [ ] "search for ABC Strata"
   - [ ] "find registration with ABN 12345678901"
   - [ ] "search by LIN 12345"

2. **Edit Tests:**

   - [ ] "Edit ABC Strata" (after search with results)
   - [ ] "Edit XYZ Corp" (non-existent company)

3. **Download Tests:**
   - [ ] "download PDF" (with loaded registration)
   - [ ] "download PDF" (without loaded registration)

### Console Logging

Page actions include helpful console logs:

```
[PageActions] Registered page: manage-registrations {
  actions: ['search', 'edit', 'downloadPdf'],
  data: ['searchState', 'results', 'resultCount', ...]
}

[PageActions] Executing search on manage-registrations { company: 'ABC Strata', abn: '', lin: '' }

[PageActions] Unregistered page: manage-registrations
```

## Source Badges

The chat UI shows different badges based on action source:

- 🤖 **Gemini** - Response from Gemini AI
- 🧠 **Gemini+** - Contextual response with data
- ⚡ **Action** - Page action executed successfully (green)
- ⚠️ **Action** - Page action failed (orange)
- ⚡ **Rules** - Rule-based response (blue)
- 🔧 **System** - System message

## Troubleshooting

### Action Not Triggering

1. Check page is registered:

   ```javascript
   console.log(pageActions.getCurrentPage()); // Should show page name
   ```

2. Check action exists:

   ```javascript
   console.log(pageActions.getAvailableActions()); // Should include your action
   ```

3. Check query parsing:
   ```javascript
   // Add console.log in handlePageAction
   console.log('Query:', query, 'Matched:', lowerQuery.includes('search'));
   ```

### Action Failing

1. Check action return format
2. Look for console errors
3. Verify dependencies in useEffect
4. Check async/await usage

### Page Context Not Updating

1. Ensure useEffect dependencies are correct:

   ```javascript
   useEffect(() => {
   	// register actions
   }, [search, results, form]); // Add all relevant state
   ```

2. Check cleanup function:
   ```javascript
   return () => {
   	pageActions.unregisterPage('your-page-name');
   };
   ```

## Future Enhancements

- [ ] Add voice command support
- [ ] Implement batch actions (e.g., "edit all expired registrations")
- [ ] Add confirmation dialogs for destructive actions
- [ ] Support multi-step workflows
- [ ] Add action history/undo functionality
- [ ] Implement context-aware suggestions based on page state

## Example Queries

### Manage Registrations Page

**Search:**

- "search for all registrations"
- "find ABC Strata"
- "search by ABN 12345678901"
- "show me registrations with LIN 12345"

**Edit:**

- "Edit ABC Strata"
- "modify the record for XYZ Corp"
- "open ABC Strata for editing"

**Download:**

- "download PDF"
- "export as PDF"
- "download the registration PDF"

### Clients Page (Future)

- "search for clients in Sydney"
- "show me clients with invalid ABNs"
- "filter clients by active status"
- "export client list"

### User Management (Future)

- "create new user"
- "search for admin users"
- "change user password"
- "deactivate user john.doe"

---

_Last Updated: 2024-01-XX_
_Version: 1.0_
