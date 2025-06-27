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

// Helper function to handle bot joining a channel
async function handleBotJoinChannel(web, channelId, botUserId) {
  console.log("=== BOT JOINED CHANNEL ===");
  console.log("Channel ID:", channelId);
  console.log("Bot User ID:", botUserId);

  try {
    // Get channel info to get the channel name
    let channelName = channelId; // fallback to ID
    try {
      const channelInfo = await web.conversations.info({
        channel: channelId
      });
      channelName = channelInfo.channel.name;
      console.log("Channel name:", channelName);
    } catch (channelError) {
      console.log("Could not get channel name, using ID:", channelError.message);
    }

    // Attempt to create canvas
    let canvasCreated = false;
    let canvasId = null;
    
    try {
      console.log("Attempting to create canvas...");
      
      const canvasResult = await web.canvases.create({
        title: `Paper - #${channelName}`,
        document_content: {
          type: "markdown",
          markdown: `# Welcome to Paper!\n\nThis is your AI assistant canvas for **#${channelName}**.\n\n## What I can help with:\n- Answer questions\n- Organize information\n- Take notes\n- And much more!\n\nJust mention me with @Paper and I'll be happy to help! 🤖`
        }
      });
      
      canvasId = canvasResult.canvas_id || canvasResult.id;
      canvasStore[channelId] = canvasId;
      canvasCreated = true;
      
      console.log("Created canvas:", canvasId);
      console.log("Canvas store:", canvasStore);
      
    } catch (canvasError) {
      console.log("Canvas creation failed:", canvasError.message);
      canvasCreated = false;
    }

    // Get canvas preview if created successfully
    let canvasPreview = null;
    if (canvasCreated && canvasId) {
      try {
        const canvasInfo = await web.canvases.access.get({
          canvas_id: canvasId
        });
        canvasPreview = {
          title: canvasInfo.title,
          url: canvasInfo.url || `https://slack.com/canvas/${canvasId}`,
          id: canvasId
        };
        console.log("Canvas preview:", canvasPreview);
      } catch (previewError) {
        console.log("Could not get canvas preview:", previewError.message);
      }
    }

    // Send welcome message with canvas info
    try {
      let messageText = `🚀 NEW CODE ACTIVE! Hello! I'm Paper, your AI assistant. I'm ready to help in #${channelName}!`;
      
      if (canvasCreated && canvasPreview) {
        messageText = `🚀 NEW CODE ACTIVE! Hello! I'm Paper, your AI assistant. I'm ready to help in #${channelName}!\n\n📋 I've created a canvas for this channel: "*${canvasPreview.title}*"\n🔗 <${canvasPreview.url}|View Canvas>\n\nMention me with @Paper anytime you need help! 🤖`;
      } else if (canvasCreated && canvasId) {
        messageText = `🚀 NEW CODE ACTIVE! Hello! I'm Paper, your AI assistant. I'm ready to help in #${channelName}!\n\n📋 I've created a canvas for this channel: "*Paper - #${channelName}*" (Canvas ID: ${canvasId})\n\nMention me with @Paper anytime you need help! 🤖`;
      }

      const result = await web.chat.postMessage({
        channel: channelId,
        text: messageText
      });
      
      console.log("NEW CODE: Welcome message sent successfully");
      
    } catch (messageError) {
      console.error("Failed to send welcome message:", messageError.message);
    }

  } catch (error) {
    console.error("Error handling bot channel join:", error.message);
  }
}

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

    // Handle GET requests (health check)
    if (req.method === "GET") {
      return res.status(200).json({ 
        status: "ok",
        message: "Slack event handler is running",
        timestamp: new Date().toISOString(),
        canvasStore: canvasStore,
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

    // Get bot's user ID (with error handling for scope issues)
    let botUserId = null;
    try {
      const authResult = await web.auth.test();
      botUserId = authResult.user_id;
      console.log("Bot user ID:", botUserId);
    } catch (error) {
      console.log("Could not get bot user ID (scope issue):", error.message);
      // We'll handle events without bot user ID comparison
    }

    // Handle member_joined_channel event (when bot is added to channel)
    if (
      body.event &&
      body.event.type === "member_joined_channel" &&
      (body.event.user === botUserId || !botUserId) // Handle case where we can't get bot ID
    ) {
      await handleBotJoinChannel(web, body.event.channel, botUserId);
      return res.status(200).end();
    }

    // Handle channel_join message subtype (alternative way bot joins channel)
    if (
      body.event &&
      body.event.type === "message" &&
      body.event.subtype === "channel_join" &&
      (body.event.user === botUserId || (!botUserId && body.event.text && body.event.text.includes("joined")))
    ) {
      // Only handle if we haven't already processed this channel
      if (!canvasStore[body.event.channel]) {
        await handleBotJoinChannel(web, body.event.channel, botUserId);
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
      console.log("Channel:", channel);
      console.log("User:", user);
      console.log("Text:", text);

      try {
        // Check if we have a canvas for this channel
        const canvasId = canvasStore[channel];
        let responseText = `👋 Hello from Paper!`;
        
        if (canvasId) {
          responseText += `\n\n📋 I have a canvas ready for this channel. Canvas ID: ${canvasId}`;
          
          // Try to get canvas URL
          try {
            const canvasInfo = await web.canvases.access.get({
              canvas_id: canvasId
            });
            if (canvasInfo.url) {
              responseText += `\n🔗 <${canvasInfo.url}|View Canvas>`;
            }
          } catch (canvasError) {
            console.log("Could not get canvas URL:", canvasError.message);
          }
        }
        
        const result = await web.chat.postMessage({
          channel,
          text: responseText,
        });
        
        console.log("Message sent successfully!");
        
      } catch (postError) {
        console.error("ERROR posting message to Slack:", postError.message);
      }

      return res.status(200).end();
    }

    // Log all other events for debugging
    console.log("=== EVENT RECEIVED ===");
    console.log("Event type:", body.event?.type);
    console.log("Event subtype:", body.event?.subtype);

    return res.status(200).end();
  } catch (error) {
    console.error("Error in events.js handler:", error);
    return res.status(500).send("Internal Server Error");
  }
}
// Force redeploy - Fri Jun 27 15:33:48 IST 2025
