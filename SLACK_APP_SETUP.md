# 🚀 Paper Slack App Setup Guide

## ✅ Step 2 Complete: OAuth Installation

The OAuth installation flow is now implemented with:
- 🔐 Secure token encryption (AES-256-GCM)
- 📝 Multi-tenant installation storage
- 🎯 Beautiful installation flow pages
- ✅ All tests passing

## 📋 Quick Setup Instructions

### 1. Update Your App URL in Manifest

Open `slack-app-manifest.json` and replace `YOUR_APP_URL` with your actual Vercel URL:

```json
"redirect_urls": [
  "https://paper-yourname.vercel.app/slack/oauth"
],
"request_url": "https://paper-yourname.vercel.app/slack/events"
```

### 2. Create Your Slack App

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Click **"Create New App"** → **"From an app manifest"**
3. Select your workspace
4. Paste the entire contents of `slack-app-manifest.json`
5. Review and click **"Create"**

### 3. Get Your App Credentials

After creating the app, go to **"Basic Information"** and copy:

- **Client ID** → Add to `SLACK_CLIENT_ID` in `.env`
- **Client Secret** → Add to `SLACK_CLIENT_SECRET` in `.env`
- **Signing Secret** → Add to `SLACK_SIGNING_SECRET` in `.env`

### 4. Deploy to Vercel

```bash
vercel
```

Add your environment variables in Vercel dashboard:
- Go to your project settings
- Navigate to "Environment Variables"
- Add all variables from your `.env` file

### 5. Test Installation

Visit: `https://your-app.vercel.app/slack/install`

You should see the Paper installation page. Click "Add to Slack" to test the OAuth flow.

## 🔍 What Happens During Installation

1. **User clicks "Add to Slack"** → Redirected to Slack OAuth page
2. **User approves permissions** → Slack redirects back with authorization code
3. **Paper exchanges code for tokens** → Securely encrypted and stored
4. **Success page shown** → User can open Slack and start using Paper

## 🛡️ Security Features

- ✅ All tokens encrypted with AES-256-GCM
- ✅ Multi-tenant data isolation by `team_id`
- ✅ Secure MongoDB storage
- ✅ Environment validation with Zod

## 🧪 Verify Installation

Run the test to ensure everything is configured:

```bash
npm run test:install
```

Expected output:
```
✅ Installation store module loads
✅ OAuth endpoints exist
✅ Installation store can encrypt/decrypt tokens
✅ Slack manifest is valid
✅ OAuth scopes are consistent
✅ Database indexes recommendation
```

## 📊 MongoDB Indexes (Recommended)

Add these indexes to your MongoDB for optimal performance:

```javascript
// In MongoDB Atlas or via mongosh:
db.installations.createIndex({ team_id: 1, enterprise_id: 1 })
db.canvases.createIndex({ team_id: 1, channel_id: 1 })
db.messages.createIndex({ team_id: 1, channel_id: 1, message_ts: -1 })
```

## 🚀 Next Steps

Once installation is working:
1. **Step 3**: Implement Canvas creation when Paper joins a channel
2. **Step 4**: Add AI-powered summarization
3. **Step 5**: Build real-time Canvas updates

## 🐛 Troubleshooting

### "Invalid client_id" error
- Double-check your `SLACK_CLIENT_ID` in `.env`
- Ensure no extra spaces or quotes

### "redirect_uri_mismatch" error
- Verify `APP_URL` in `.env` matches your Vercel deployment
- Update redirect URLs in Slack app settings

### Installation not saving
- Check MongoDB connection string
- Verify encryption key is 64 hex characters
- Look at Vercel function logs for errors

---

Ready for Step 3? The OAuth foundation is bulletproof! 🎉