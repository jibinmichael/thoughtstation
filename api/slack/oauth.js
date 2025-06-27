const { WebClient } = require('@slack/web-api');
const { config } = require('../../lib/config');
const { SlackInstallationStore } = require('../../lib/slack-install');

module.exports = async (req, res) => {
  const { code, error } = req.query;

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error);
    return res.status(400).send(`
      <html>
        <body style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h1>❌ Installation Failed</h1>
          <p>Error: ${error}</p>
          <a href="/slack/install">Try Again</a>
        </body>
      </html>
    `);
  }

  if (!code) {
    return res.status(400).send('Missing authorization code');
  }

  try {
    // Exchange code for access token
    const client = new WebClient();
    const oauthResponse = await client.oauth.v2.access({
      client_id: config.SLACK_CLIENT_ID,
      client_secret: config.SLACK_CLIENT_SECRET,
      code: code,
      redirect_uri: `${config.APP_URL}/slack/oauth`
    });

    // Store installation
    const installationStore = new SlackInstallationStore();
    await installationStore.storeInstallation({
      team: {
        id: oauthResponse.team.id,
        name: oauthResponse.team.name
      },
      enterprise: oauthResponse.enterprise ? {
        id: oauthResponse.enterprise.id,
        name: oauthResponse.enterprise.name
      } : undefined,
      bot: {
        token: oauthResponse.access_token,
        scopes: oauthResponse.scope.split(','),
        userId: oauthResponse.bot_user_id
      },
      user: {
        id: oauthResponse.authed_user.id,
        token: oauthResponse.authed_user.access_token,
        scopes: oauthResponse.authed_user.scope?.split(',')
      },
      appId: oauthResponse.app_id,
      tokenType: oauthResponse.token_type,
      isEnterpriseInstall: oauthResponse.is_enterprise_install || false
    });

    // Success page
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Paper Installed Successfully</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: #f4f4f4;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 12px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              text-align: center;
              max-width: 500px;
            }
            .success-icon {
              font-size: 64px;
              margin-bottom: 20px;
            }
            h1 {
              color: #1a1a1a;
              margin-bottom: 20px;
            }
            p {
              color: #666;
              line-height: 1.6;
              margin-bottom: 20px;
            }
            .next-steps {
              background: #f8f8f8;
              padding: 20px;
              border-radius: 8px;
              text-align: left;
              margin: 20px 0;
            }
            .next-steps h3 {
              margin-top: 0;
              color: #333;
            }
            .next-steps ol {
              margin: 10px 0;
              padding-left: 20px;
            }
            .next-steps li {
              margin: 8px 0;
              color: #555;
            }
            .open-slack-btn {
              display: inline-block;
              background: #4A154B;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 600;
              margin-top: 20px;
            }
            .open-slack-btn:hover {
              background: #3e1240;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success-icon">✅</div>
            <h1>Paper Installed Successfully!</h1>
            <p>Paper has been added to <strong>${oauthResponse.team.name}</strong></p>
            
            <div class="next-steps">
              <h3>🚀 Next Steps:</h3>
              <ol>
                <li>Add Paper to any channel by typing <code>/invite @Paper</code></li>
                <li>Paper will automatically scan recent messages and create a Canvas</li>
                <li>The Canvas will update in real-time as your conversation continues</li>
              </ol>
            </div>
            
            <p><strong>Pro tip:</strong> Paper works best in focused project or topic channels!</p>
            
            <a href="slack://open" class="open-slack-btn">
              Open Slack
            </a>
          </div>
        </body>
      </html>
    `);

  } catch (error) {
    console.error('OAuth exchange error:', error);
    res.status(500).send(`
      <html>
        <body style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h1>❌ Installation Failed</h1>
          <p>Unable to complete installation. Please try again.</p>
          <details>
            <summary>Error Details</summary>
            <pre>${error.message}</pre>
          </details>
          <br>
          <a href="/slack/install">Try Again</a>
        </body>
      </html>
    `);
  }
}; 