export default function handler(req, res) {
  res.status(200).json({
    status: "ok",
    message: "Health check - root level",
    timestamp: new Date().toISOString(),
    env: {
      SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN ? "configured" : "missing",
      SLACK_SIGNING_SECRET: process.env.SLACK_SIGNING_SECRET ? "configured" : "missing"
    }
  });
}
