# Paper - AI-Powered Slack Canvas Assistant

Paper is a bulletproof, serverless, multi-tenant Slack app that auto-generates and maintains Granola-style Canvas from conversations in Slack channels.

## 🎯 Core Features

- **Auto-Canvas Creation**: Automatically creates structured Canvas when added to a channel
- **AI-Powered Summaries**: Uses GPT-4 to extract insights, action items, and decisions
- **Real-time Updates**: Keeps Canvas updated as conversations progress
- **Multi-tenant**: Securely handles multiple workspaces
- **Serverless**: Runs on Vercel with MongoDB Atlas

## 🚀 Setup Instructions

### Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Slack workspace (for testing)
- OpenAI API key
- Vercel account

### Step 1: Environment Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp env.example .env
   ```

3. **Generate encryption key:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   Copy the output and set it as `ENCRYPTION_KEY` in your `.env` file.

4. **Configure MongoDB Atlas:**
   - Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Get your connection string and add it to `MONGODB_URI`

5. **Create Slack App:**
   - Go to [api.slack.com/apps](https://api.slack.com/apps)
   - Create a new app
   - Add OAuth scopes (see below)
   - Get your credentials and add to `.env`

### Required Slack OAuth Scopes

**Bot Token Scopes:**
- `channels:history` - Read channel messages
- `channels:read` - View channel info
- `chat:write` - Post messages
- `users:read` - View user info
- `files:read` - Access shared files
- `team:read` - View workspace info
- `groups:history` - Read private channel messages
- `groups:read` - View private channel info

### Step 2: Run Tests

```bash
# Test environment setup
npm run test:env

# Test OAuth installation
npm run test:install
```

This will verify:
- ✅ Environment variables are loaded
- ✅ Encryption utility works
- ✅ Database connection is configured
- ✅ OAuth installation flow is ready
- ✅ Slack manifest is valid
- ✅ All required files are present

### Step 3: Deploy to Vercel

```bash
vercel
```

Set your environment variables in Vercel dashboard.

## 📁 Project Structure

```
Paper/
├── api/              # Serverless functions
├── lib/              # Core utilities
│   ├── config.js     # Environment validation
│   ├── database.js   # MongoDB connection
│   └── encryption.js # Token encryption
├── tests/            # Test files
├── package.json      # Dependencies
└── vercel.json       # Vercel config
```

## 🧪 Development

Run local development server:
```bash
npm run dev
```

## 🔒 Security

- All Slack tokens are encrypted using AES-256-GCM
- Multi-tenant data isolation by `team_id`
- Rate limiting via Upstash Redis
- Secure serverless architecture

## 📝 Canvas Format

Paper creates Canvas with this structure:

```
# 🧠 Summary
Brief overview of the discussion

# ✅ Action Items
- [ ] Task description → @assignee → Due: Date

# 🔗 Shared Files & Links
- Resource name → URL

# ❓ Open Questions
- Question that needs answering

# 📌 Key Decisions
- Decision that was made
```