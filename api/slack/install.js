const { config, SLACK_SCOPES } = require('../../lib/config');

module.exports = (req, res) => {
  // Check if Slack credentials are configured
  if (!config.SLACK_CLIENT_ID || !config.SLACK_CLIENT_SECRET || !config.SLACK_SIGNING_SECRET) {
    res.setHeader('Content-Type', 'text/html');
    return res.status(503).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Paper - Configuration Required</title>
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
            .warning {
              font-size: 48px;
              margin-bottom: 20px;
            }
            h1 {
              color: #1a1a1a;
              margin-bottom: 20px;
            }
            .steps {
              text-align: left;
              background: #f8f8f8;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .steps ol {
              margin: 10px 0;
              padding-left: 20px;
            }
            .steps li {
              margin: 10px 0;
            }
            code {
              background: #e4e4e4;
              padding: 2px 6px;
              border-radius: 3px;
              font-family: monospace;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="warning">⚠️</div>
            <h1>Slack App Not Configured</h1>
            <p>Paper is deployed but needs Slack app credentials to work.</p>
            
            <div class="steps">
              <h3>Setup Steps:</h3>
              <ol>
                <li>Create your Slack app at <a href="https://api.slack.com/apps" target="_blank">api.slack.com/apps</a></li>
                <li>Use the app manifest with this URL: <code>${req.headers.host}</code></li>
                <li>Get your app credentials from "Basic Information"</li>
                <li>Add them to Vercel environment variables:
                  <ul>
                    <li><code>SLACK_CLIENT_ID</code></li>
                    <li><code>SLACK_CLIENT_SECRET</code></li>
                    <li><code>SLACK_SIGNING_SECRET</code></li>
                    <li><code>APP_URL</code> = <code>https://${req.headers.host}</code></li>
                  </ul>
                </li>
                <li>Redeploy or restart your Vercel deployment</li>
              </ol>
            </div>
            
            <p><strong>Your deployment URL:</strong> <code>https://${req.headers.host}</code></p>
          </div>
        </body>
      </html>
    `);
  }

  // Build Slack OAuth URL
  const params = new URLSearchParams({
    client_id: config.SLACK_CLIENT_ID,
    scope: SLACK_SCOPES.BOT.join(','),
    redirect_uri: `${config.APP_URL}/slack/oauth`
  });

  const installUrl = `https://slack.com/oauth/v2/authorize?${params.toString()}`;

  // Send installation page
  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Install Paper to Slack</title>
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
            max-width: 400px;
          }
          h1 {
            color: #1a1a1a;
            margin-bottom: 10px;
          }
          .logo {
            font-size: 48px;
            margin-bottom: 20px;
          }
          p {
            color: #666;
            line-height: 1.6;
            margin-bottom: 30px;
          }
          .features {
            text-align: left;
            margin: 20px 0;
          }
          .features li {
            margin: 10px 0;
            color: #555;
          }
          .install-btn {
            display: inline-block;
            background: #4A154B;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            transition: background 0.2s;
          }
          .install-btn:hover {
            background: #3e1240;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">📄</div>
          <h1>Paper for Slack</h1>
          <p>AI-powered Canvas assistant that automatically creates and maintains organized summaries of your conversations.</p>
          
          <ul class="features">
            <li>🧠 Auto-generates structured Canvas summaries</li>
            <li>✅ Extracts action items with assignees</li>
            <li>📌 Captures key decisions and links</li>
            <li>🔄 Updates in real-time as conversations evolve</li>
          </ul>
          
          <a href="${installUrl}" class="install-btn">
            Add to Slack
          </a>
        </div>
      </body>
    </html>
  `);
}; 