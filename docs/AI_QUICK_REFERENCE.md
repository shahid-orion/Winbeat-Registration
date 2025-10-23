# WinBeat AI - Page-Specific Training Quick Reference

## 🎯 What's New

Your WinBeat AI Assistant can now:

- **Execute multi-step workflows** - Chain multiple actions together automatically
- **Navigate across pages** - Go to any page and perform actions
- **Interact directly with pages** - Search, edit, create, download - all via natural language
- **Provide real-time progress updates** - See each step as it executes

## 🔥 Multi-Step Workflows

### Complex Command Example

The AI can now execute complex, multi-step commands like:

```
User: "go to manage registration page and search for ABC Strata and download pdf"

AI: 🔄 Starting workflow: Search, Edit, and Download PDF

    Step 1/4: Navigate to target page...
    ✅ navigate: Navigated to manage-registrations

    Step 2/4: Search for the record...
    ✅ search: Searched for company "ABC Strata". Found 1 registration(s)

    Step 3/4: Load record for editing...
    ✅ edit: Loaded registration for editing: ABC Strata

    Step 4/4: Download PDF...
    ✅ downloadPdf: PDF download initiated for ABC Strata

    ✨ Workflow completed successfully!
    📊 Completed 4/4 steps
```

### Available Workflows

#### 1. Search → Edit → Download

```
"go to manage registration page and search for [company] and download pdf"
"find ABC Strata and download the PDF"
"navigate to registrations, search XYZ Corp, and get the PDF"
```

#### 2. Search → Edit

```
"go to clients page and search for ABC Company and edit it"
"find user john.doe and edit"
"navigate to users and edit admin.user"
```

#### 3. Navigate → Search

```
"go to manage registrations and search for ABC"
"open clients page and find XYZ"
"navigate to users and search for john"
```

#### 4. Navigate → Create

```
"go to clients page and create a new client"
"open users and add a new user"
"navigate to manage registrations and create new"
```

### Workflow Benefits

- **Automated**: No manual clicking required
- **Reliable**: Each step is validated before proceeding
- **Transparent**: See exactly what's happening in real-time
- **Error Handling**: Stops and reports if any step fails
- **Time-Saving**: Execute complex tasks in seconds

## ✨ Manage Registration Page

### Search Registrations

Ask the AI to search using natural language:

```
User: "search for all registrations"
AI: ✅ I've searched for all registrations. Found 42 registration(s)

User: "find ABC Strata"
AI: ✅ I've searched for company "ABC Strata". Found 1 registration(s)

User: "search by ABN 12345678901"
AI: ✅ I've searched for ABN 12345678901. Found 1 registration(s)

User: "show me registrations with LIN 12345"
AI: ✅ I've searched for LIN 12345. Found 2 registration(s)
```

**How it works:**

- AI automatically detects if you're searching by company name, ABN, or LIN
- Triggers the search function directly
- Shows results in the table
- Provides feedback about number of results found

### Edit Records

After searching, ask AI to edit a specific record:

```
User: "search for ABC Strata"
AI: ✅ Found 1 registration(s)

User: "Edit ABC Strata"
AI: ✅ I've loaded the registration for editing. Loaded registration for editing: ABC Strata
```

**How it works:**

- AI matches company name against search results
- Loads the record into the edit form
- Ready for you to make changes

### Download PDF

With a registration loaded, ask AI to download the PDF:

```
User: "download PDF"
AI: ✅ PDF downloaded: Registration-12345.pdf
```

**Error handling:**

```
User: "download PDF"
AI: ❌ No registration is currently loaded. Please load or create a registration first.
```

## 🎨 Source Badges

The AI shows you how it handled your request:

- ⚡ **Action** (green) - Successfully executed page action
- ⚠️ **Action** (orange) - Page action failed with error
- 🤖 **Gemini** - Response from Gemini AI
- 🧠 **Gemini+** - Enhanced contextual response
- ⚡ **Rules** - Quick rule-based response
- 🔧 **System** - System notification

## 💡 Tips & Tricks

### Natural Language Examples

**Search variations:**

- "search for all registrations"
- "find ABC Strata"
- "look for registrations with ABN 12345678901"
- "show me companies named ABC"
- "search by LIN 12345"

**Edit variations:**

- "Edit ABC Strata"
- "modify the record for ABC Strata"
- "open ABC Strata for editing"

**Download variations:**

- "download PDF"
- "export as PDF"
- "get the PDF file"

### Workflow Examples

**Example 1: Find and Edit**

```
User: "find ABC Strata"
AI: ✅ Found 1 registration(s)

User: "edit it"
AI: ✅ Registration loaded for editing
```

**Example 2: Search and Download**

```
User: "search for XYZ Corp"
AI: ✅ Found 1 registration(s)

User: "edit XYZ Corp"
AI: ✅ Registration loaded

User: "download PDF"
AI: ✅ PDF downloaded: Registration-67890.pdf
```

**Example 3: Bulk Search**

```
User: "search for all registrations"
AI: ✅ Found 42 registration(s)
(All results show in table)
```

## 🔍 Smart Detection

The AI automatically detects what you're searching for:

### ABN Detection

11-digit numbers are automatically treated as ABNs:

```
"find 12345678901" → Searches by ABN
"search for 12345678901" → Searches by ABN
```

### LIN Detection

Queries mentioning "LIN" or "lin":

```
"search by LIN 12345" → Searches by LIN
"find lin 67890" → Searches by LIN
```

### Company Name (Default)

Everything else is treated as company name:

```
"find ABC Strata" → Searches by company name
"search for XYZ Corporation" → Searches by company name
```

## 👥 Clients Page

### Search Clients

Search for clients by name, code, or any text:

```
User: "search for all clients"
AI: ✅ I've loaded all clients. Found 35 client(s)

User: "find ABC Corporation"
AI: ✅ I've searched for "ABC Corporation". Found 1 client(s)

User: "search for sydney"
AI: ✅ I've searched for "sydney". Found 8 client(s)
```

**How it works:**

- AI searches across client names, codes, and other fields
- Shows results in the table
- Provides feedback about number of results found

### Edit Client

After searching, ask AI to edit a specific client:

```
User: "search for ABC Corp"
AI: ✅ Found 1 client(s)

User: "Edit ABC Corp"
AI: ✅ I've loaded the client for editing. Loaded client for editing: ABC Corp
```

**How it works:**

- AI matches client name or code against search results
- Loads the client record into the edit form
- Ready for you to make changes

### Create New Client

Ask AI to open the form for creating a new client:

```
User: "create new client"
AI: ✅ Opening form to create new client. Please fill in the required fields.

User: "add a client"
AI: ✅ Opening form to create new client. Please fill in the required fields.
```

### Clients Page Examples

**Example 1: Search and Edit**

```
User: "find clients in Sydney"
AI: ✅ I've searched for "Sydney". Found 8 client(s)

User: "edit ABC Corp"
AI: ✅ Loaded client for editing: ABC Corp
```

**Example 2: Create New**

```
User: "I need to add a new client"
AI: ✅ Opening form to create new client. Please fill in the required fields.
(Form opens with empty fields)
```

## 👤 User Management Page

### Search Users

Search for users by user code:

```
User: "search for all users"
AI: ✅ I've loaded all users. Found 12 user(s)

User: "find user john.doe"
AI: ✅ I've searched for user "john.doe". Found 1 user(s)
```

### Filter by Security Level

Ask AI to show users by their access level:

```
User: "show me all admin users"
AI: ✅ Found 3 Admin user(s)

User: "find all editors"
AI: ✅ Found 5 Editor user(s)

User: "list viewer users"
AI: ✅ Found 4 Viewer user(s)
```

**Security Levels:**

- **Admin** (Level 2) - Full system access
- **Editor** (Level 1) - Can manage registrations
- **Viewer** (Level 0) - Read-only access

### Edit User

After searching, ask AI to edit a specific user:

```
User: "search for john.doe"
AI: ✅ Found 1 user(s)

User: "edit john.doe"
AI: ✅ I've loaded the user for editing. Loaded user for editing: john.doe
```

### Create New User

Ask AI to open the form for creating a new user:

```
User: "create new user"
AI: ✅ Opening form to create new user. Please fill in the required fields.

User: "add a user"
AI: ✅ Opening form to create new user. Please fill in the required fields.
```

### User Management Examples

**Example 1: Find Admins**

```
User: "show me all admin users"
AI: ✅ Found 3 Admin user(s)
(Table shows only admin users)
```

**Example 2: Edit User**

```
User: "find john.doe"
AI: ✅ Found 1 user(s)

User: "edit john.doe"
AI: ✅ Loaded user for editing: john.doe
(Form opens with user details)
```

**Example 3: Create User**

```
User: "I need to add a new user"
AI: ✅ Opening form to create new user. Please fill in the required fields.
(Form opens with empty fields)
```

## 🚀 Future Enhancements

Additional features planned for future releases:

### All Pages

- Voice command support
- Batch operations (e.g., "update all expired registrations")
- Confirmation dialogs for destructive actions
- Multi-step workflows
- Action history and undo functionality

### Dashboard (Coming Soon)

- Generate custom reports
- View real-time analytics
- Export data in various formats
- Schedule automated reports

## 📊 Example Conversation

Here's a real conversation showing the AI's capabilities:

```
User: "Hi, I need to find a registration"
AI: 🤖 Hello! I can help you search for registrations. You can search by:
    - Company name: "find ABC Strata"
    - ABN: "search by ABN 12345678901"
    - LIN: "show me LIN 12345"
    What would you like to search for?

User: "search for ABC Strata"
AI: ⚡ I've searched for company "ABC Strata". Found 1 registration(s)

User: "Edit it"
AI: ⚡ I've loaded the registration for editing. Registration ID: 12345

User: "Thanks! Now download the PDF"
AI: ⚡ PDF downloaded: Registration-12345.pdf

User: "Perfect, thank you!"
AI: 🤖 You're welcome! Is there anything else I can help you with?
```

## ❓ Troubleshooting

### "Could not find registration for..."

- Make sure you've searched first
- Check the exact company name spelling
- Try searching again to refresh results

### "No registration is currently loaded"

- You need to load a registration before downloading PDF
- Use "Edit [Company Name]" to load a registration

### Action not working

- Make sure you're on the correct page (Manage Registrations)
- Try rephrasing your query
- Check that search results are visible in the table

## 🎯 Best Practices

1. **Search before editing:** Always search first to see available records
2. **Be specific:** Use exact names/codes when editing
3. **Load before download:** Make sure a registration is loaded before downloading PDF
4. **Natural language:** Don't overthink it - just ask naturally!
5. **Page awareness:** The AI knows which page you're on and adapts its responses

## � All Available Commands by Page

### Manage Registrations

- "search for all registrations"
- "find ABC Strata"
- "search by ABN 12345678901"
- "search by LIN 12345"
- "Edit ABC Strata"
- "download PDF"

### Clients

- "search for all clients"
- "find ABC Corporation"
- "search for clients in Sydney"
- "Edit ABC Corp"
- "create new client"
- "add a client"

### User Management

- "search for all users"
- "find user john.doe"
- "show me all admin users"
- "find all editors"
- "list viewer users"
- "edit john.doe"
- "create new user"
- "add a user"

## �📝 Feedback

The AI is constantly learning! If you find a query that should work but doesn't, let us know and we'll improve it.

---

**Need Help?** Just ask the AI:

- "What can you do?"
- "Help me search registrations"
- "How do I edit a record?"
- "Show me what actions are available"
