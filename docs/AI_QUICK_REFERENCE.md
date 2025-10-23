# WinBeat AI - Page-Specific Training Quick Reference

## 🎯 What's New

Your WinBeat AI Assistant can now **interact directly with pages** and trigger actions! No more manual clicking - just ask the AI to do it for you.

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

## 🚀 Coming Soon

More page-specific actions are being added:

### Clients Page

- Search and filter clients
- View client details
- Export client lists

### User Management

- Create new users
- Search and filter users
- Update user permissions

### Dashboard

- Generate reports
- View analytics
- Export data

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
2. **Be specific:** Use exact company names when editing
3. **Load before download:** Make sure a registration is loaded before downloading PDF
4. **Natural language:** Don't overthink it - just ask naturally!

## 📝 Feedback

The AI is constantly learning! If you find a query that should work but doesn't, let us know and we'll improve it.

---

**Need Help?** Just ask the AI:

- "What can you do?"
- "Help me search registrations"
- "How do I edit a record?"
