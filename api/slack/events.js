const { WebClient } = require("@slack/web-api");
const { buffer } = require("micro");
const crypto = require("crypto");

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  try {
    // Load environment variables inside the handler
    const slackToken = process.env.SLACK_BOT_TOKEN;
    const signingSecret = process.env.SLACK_SIGNING_SECRET;

    // Log environment variable status (without exposing the actual values)
    console.log("=== SLACK HANDLER STARTED ===");
    console.log("Deployment timestamp:", new Date().toISOString());
    console.log("SLACK_BOT_TOKEN exists:", !!slackToken);
    console.log("SLACK_SIGNING_SECRET exists:", !!signingSecret);
    console.log("Request method:", req.method);
    console.log("Request URL:", req.url);

    // Handle GET requests (health check)
    if (req.method === "GET") {
      return res.status(200).json({ 
        status: "ok",
        message: "Slack event handler is running",
        timestamp: new Date().toISOString(),
        env: {
          SLACK_BOT_TOKEN: !!slackToken ? "configured" : "missing",
          SLACK_SIGNING_SECRET: !!signingSecret ? "configured" : "missing"
        }
      });
    }

    // Check if required environment variables are set
    if (!slackToken || !signingSecret) {
      console.error("Missing required environment variables");
      return res.status(500).json({
        error: "Configuration error",
        details: {
          SLACK_BOT_TOKEN: !!slackToken ? "configured" : "missing",
          SLACK_SIGNING_SECRET: !!signingSecret ? "configured" : "missing"
        }
      });
    }

    const rawBody = await buffer(req);
    const signature = req.headers["x-slack-signature"];
    const timestamp = req.headers["x-slack-request-timestamp"];

    // Verify Slack signature
    if (!signature || !timestamp) {
      console.error("Missing Slack signature headers");
      return res.status(400).send("Missing required headers");
    }

    const hmac = crypto.createHmac("sha256", String(signingSecret));
    const [version, hash] = signature.split("=");
    hmac.update(`v0:${timestamp}:${rawBody.toString()}`);
    const digest = hmac.digest("hex");

    if (!crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(digest))) {
      return res.status(400).send("Verification failed");
    }

    const body = JSON.parse(rawBody.toString());

    // Handle URL verification
    if (body.type === "url_verification") {
      return res.status(200).json({ challenge: body.challenge });
    }

    // Handle app mentions
    if (
      body.event &&
      body.event.type === "app_mention" &&
      !body.event.subtype // ignore bot messages
    ) {
      const channel = body.event.channel;
      const user = body.event.user;
      const text = body.event.text;

      console.log("=== APP MENTION EVENT RECEIVED ===");
      console.log("Event type:", body.event.type);
      console.log("Channel:", channel);
      console.log("User:", user);
      console.log("Text:", text);
      console.log("Full event:", JSON.stringify(body.event, null, 2));

      try {
        console.log("Attempting to send message to Slack...");
        const web = new WebClient(slackToken);
        const result = await web.chat.postMessage({
          channel,
          text: `👋 Hello from Paper!`,
        });
        
        console.log("Message sent successfully!");
        console.log("Message result:", JSON.stringify(result, null, 2));
      } catch (postError) {
        console.error("ERROR posting message to Slack:");
        console.error("Error name:", postError.name);
        console.error("Error message:", postError.message);
        console.error("Error code:", postError.code);
        console.error("Full error:", postError);
      }

      return res.status(200).end();
    }

    // Fallback for any other events
    return res.status(200).end();
  } catch (error) {
    console.error("Error in events.js handler:", error);
    return res.status(500).send("Internal Server Error");
  }
}
