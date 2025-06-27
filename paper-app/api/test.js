export default function handler(req, res) {
  const token = process.env.SLACK_BOT_TOKEN;
  const secret = process.env.SLACK_SIGNING_SECRET;
  
  res.status(200).json({
    message: "Test endpoint",
    timestamp: new Date().toISOString(),
    env: {
      SLACK_BOT_TOKEN: token ? `exists (${token.substring(0, 10)}...)` : "missing",
      SLACK_SIGNING_SECRET: secret ? `exists (${secret.substring(0, 10)}...)` : "missing",
      NODE_ENV: process.env.NODE_ENV
    }
  });
} 