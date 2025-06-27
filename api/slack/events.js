const { WebClient } = require("@slack/web-api");
const { buffer } = require("micro");
const crypto = require("crypto");

// In-memory storage for canvas IDs
const canvasStore = {};

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

    // Initialize WebClient
    const web = new WebClient(slackToken);

    // Get bot's user ID using auth.test
    let botUserId = null;
    try {
      const authResult = await web.auth.test();
      botUserId = authResult.user_id;
      console.log("Bot user ID:", botUserId);
    } catch (error) {
      console.error("Failed to get bot user ID:", error.message);
    }

    // Handle member_joined_channel event
    if (
      body.event &&
      body.event.type === "member_joined_channel" &&
      body.event.user === botUserId
    ) {
      const channelId = body.event.channel;
      
      console.log("=== BOT JOINED CHANNEL ===");
      console.log("Channel ID:", channelId);
      console.log("Bot User ID:", botUserId);

      try {
        // Get channel info to get the channel name
        const channelInfo = await web.conversations.info({
          channel: channelId
        });
        
        const channelName = channelInfo.channel.name;
        console.log("Channel name:", channelName);

        // Attempt to create canvas
        // Note: canvases.create might not be available in the current API
        try {
          console.log("Attempting to create canvas...");
          
          // Check if canvases API exists
          if (web.canvases && web.canvases.create) {
            const canvasResult = await web.canvases.create({
              title: `Paper - #${channelName}`,
              channel: channelId
            });
            
            const canvasId = canvasResult.canvas_id || canvasResult.id;
            canvasStore[channelId] = canvasId;
            
            console.log("Created canvas:", canvasId);
            console.log("Canvas store:", canvasStore);
          } else {
            console.log("Canvas API not available - web.canvases.create is not a function");
            console.log("Available methods:", Object.keys(web));
            
            // Fallback: Post a message about canvas creation
            await web.chat.postMessage({
              channel: channelId,
              text: `👋 Hello! I'm Paper, your AI assistant. Canvas creation is not yet available through the API, but I'm here to help!`
            });
          }
        } catch (canvasError) {
          console.error("Failed to create canvas:", canvasError.message);
          console.error("Canvas error details:", canvasError);
          
          // Fallback message
          await web.chat.postMessage({
            channel: channelId,
            text: `👋 Hello! I'm Paper, your AI assistant. I'm ready to help in this channel!`
          });
        }
      } catch (error) {
        console.error("Error handling bot channel join:", error.message);
        console.error("Full error:", error);
      }

      return res.status(200).end();
    }

    // Handle bot_added to channel (alternative event)
    if (
      body.event &&
      body.event.type === "message" &&
      body.event.subtype === "bot_add" &&
      body.event.bot_id
    ) {
      console.log("=== BOT_ADD EVENT DETECTED ===");
      console.log("Event:", JSON.stringify(body.event, null, 2));
      
      // Check if this is our bot
      try {
        const botInfo = await web.bots.info({ bot: body.event.bot_id });
        if (botInfo.bot.user_id === botUserId) {
          const channelId = body.event.channel;
          console.log("Our bot was added to channel:", channelId);
          
          // Try to create canvas
          try {
            const channelInfo = await web.conversations.info({ channel: channelId });
            const channelName = channelInfo.channel.name;
            
            console.log("Attempting canvas creation for channel:", channelName);
            
            // Check if canvases API exists
            if (web.canvases && web.canvases.create) {
              const canvasResult = await web.canvases.create({
                title: `Paper - #${channelName}`,
                channel: channelId
              });
              
              const canvasId = canvasResult.canvas_id || canvasResult.id;
              canvasStore[channelId] = canvasId;
              
              console.log("Created canvas:", canvasId);
            } else {
              console.log("Canvas API not available");
            }
          } catch (error) {
            console.error("Error in bot_add handler:", error.message);
          }
        }
      } catch (error) {
        console.error("Error checking bot info:", error.message);
      }
      
      return res.status(200).end();
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

    // Log all events for debugging
    console.log("=== EVENT RECEIVED ===");
    console.log("Event type:", body.event?.type);
    console.log("Event subtype:", body.event?.subtype);
    if (body.event?.type === "message" && body.event?.subtype) {
      console.log("Message subtype details:", JSON.stringify(body.event, null, 2));
    }

    // Fallback for any other events
    return res.status(200).end();
  } catch (error) {
    console.error("Error in events.js handler:", error);
    return res.status(500).send("Internal Server Error");
  }
}
