const { WebClient } = require("@slack/web-api");
const { buffer } = require("micro");
const crypto = require("crypto");

// Canvas storage
const canvasStore = {};

export const config = {
  api: {
    bodyParser: false,
  },
};

// UNIFIED bot join handler
async function createWelcomeForChannel(web, channelId, botUserId) {
  console.log("🎯 UNIFIED HANDLER STARTED 🎯");
  console.log("Creating welcome for channel:", channelId);
  console.log("Bot user ID:", botUserId);

  try {
    // Get channel name
    let channelName = channelId;
    try {
      const channelInfo = await web.conversations.info({ channel: channelId });
      channelName = channelInfo.channel.name;
      console.log("✅ Channel name retrieved:", channelName);
    } catch (err) {
      console.log("⚠️ Could not get channel name:", err.message);
    }

    // Create canvas
    let canvasId = null;
    let canvasCreated = false;
    
    try {
      console.log("🎨 Creating canvas...");
      const canvasResult = await web.canvases.create({
        title: `Paper - #${channelName}`,
        document_content: {
          type: "markdown",
          markdown: `# Welcome to Paper! 🤖\n\nThis is your AI assistant canvas for **#${channelName}**.\n\n## What I can help with:\n- Answer questions\n- Organize information\n- Take notes\n- Collaborate on ideas\n\nJust mention me with @Paper and I'll be happy to help! ✨`
        }
      });
      
      canvasId = canvasResult.canvas_id || canvasResult.id;
      canvasStore[channelId] = canvasId;
      canvasCreated = true;
      
      console.log("✅ Canvas created successfully:", canvasId);
      console.log("📊 Canvas store updated:", canvasStore);
      
    } catch (canvasError) {
      console.log("❌ Canvas creation failed:", canvasError.message);
    }

    // Get canvas preview URL
    let canvasUrl = null;
    if (canvasCreated && canvasId) {
      try {
        const canvasInfo = await web.canvases.access.get({ canvas_id: canvasId });
        canvasUrl = canvasInfo.url || `https://slack.com/canvas/${canvasId}`;
        console.log("🔗 Canvas URL retrieved:", canvasUrl);
      } catch (urlError) {
        console.log("⚠️ Could not get canvas URL:", urlError.message);
      }
    }

    // Send unified welcome message
    let message = `🚀 **NEW CODE ACTIVE!** Hello! I'm Paper, your AI assistant. I'm ready to help in #${channelName}! 🤖`;
    
    if (canvasCreated) {
      message += `\n\n🎨 I've created a canvas for this channel: "*Paper - #${channelName}*"`;
      if (canvasUrl) {
        message += `\n🔗 <${canvasUrl}|View Canvas>`;
      } else {
        message += `\n📋 Canvas ID: ${canvasId}`;
      }
      message += `\n\n✨ Mention me with @Paper anytime you need help!`;
    }

    try {
      const result = await web.chat.postMessage({
        channel: channelId,
        text: message
      });
      console.log("✅ Welcome message sent successfully!");
      console.log("📨 Message timestamp:", result.ts);
    } catch (msgError) {
      console.log("❌ Failed to send welcome message:", msgError.message);
    }

  } catch (error) {
    console.log("💥 Error in welcome handler:", error.message);
  }
}

export default async function handler(req, res) {
  try {
    const slackToken = process.env.SLACK_BOT_TOKEN;
    const signingSecret = process.env.SLACK_SIGNING_SECRET;

    console.log("🔥 COMPLETELY NEW HANDLER VERSION 🔥");
    console.log("⏰ Timestamp:", new Date().toISOString());
    console.log("🔑 Token exists:", !!slackToken);
    console.log("🔐 Secret exists:", !!signingSecret);
    console.log("📨 Method:", req.method);

    // Health check
    if (req.method === "GET") {
      return res.status(200).json({ 
        status: "NEW VERSION ACTIVE",
        message: "Completely rewritten event handler",
        timestamp: new Date().toISOString(),
        canvasStore: canvasStore
      });
    }

    if (!slackToken || !signingSecret) {
      console.log("❌ Missing environment variables");
      return res.status(500).json({ error: "Configuration error" });
    }

    // Verify request
    const rawBody = await buffer(req);
    const signature = req.headers["x-slack-signature"];
    const timestamp = req.headers["x-slack-request-timestamp"];

    if (!signature || !timestamp) {
      console.log("❌ Missing signature headers");
      return res.status(400).send("Missing headers");
    }

    const hmac = crypto.createHmac("sha256", String(signingSecret));
    const [version, hash] = signature.split("=");
    hmac.update(`v0:${timestamp}:${rawBody.toString()}`);
    const digest = hmac.digest("hex");

    if (!crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(digest))) {
      return res.status(400).send("Verification failed");
    }

    const body = JSON.parse(rawBody.toString());

    // URL verification
    if (body.type === "url_verification") {
      return res.status(200).json({ challenge: body.challenge });
    }

    const web = new WebClient(slackToken);

    // Get bot user ID
    let botUserId = null;
    try {
      const authResult = await web.auth.test();
      botUserId = authResult.user_id;
      console.log("🤖 Bot user ID:", botUserId);
    } catch (error) {
      console.log("⚠️ Could not get bot user ID:", error.message);
    }

    // Handle bot joining channel
    if (
      body.event &&
      body.event.type === "member_joined_channel" &&
      body.event.user === botUserId
    ) {
      console.log("🎯 DETECTED: member_joined_channel event");
      console.log("👤 User:", body.event.user, "🤖 Bot:", botUserId);
      await createWelcomeForChannel(web, body.event.channel, botUserId);
      return res.status(200).end();
    }

    // Handle channel_join message
    if (
      body.event &&
      body.event.type === "message" &&
      body.event.subtype === "channel_join" &&
      body.event.user === botUserId
    ) {
      console.log("🎯 DETECTED: channel_join message event");
      console.log("👤 User:", body.event.user, "🤖 Bot:", botUserId);
      
      // Prevent duplicates
      if (!canvasStore[body.event.channel]) {
        await createWelcomeForChannel(web, body.event.channel, botUserId);
      } else {
        console.log("⚠️ Canvas already exists for this channel");
      }
      return res.status(200).end();
    }

    // Handle app mentions
    if (
      body.event &&
      body.event.type === "app_mention" &&
      !body.event.subtype
    ) {
      const channel = body.event.channel;
      const user = body.event.user;
      const text = body.event.text;

      console.log("💬 APP MENTION RECEIVED");
      console.log("📍 Channel:", channel);
      console.log("👤 User:", user);
      console.log("💭 Text:", text);

      try {
        const canvasId = canvasStore[channel];
        let responseText = `👋 Hello from Paper! (NEW VERSION ACTIVE)`;
        
        if (canvasId) {
          responseText += `\n\n🎨 I have a canvas ready for this channel!\n📋 Canvas ID: ${canvasId}`;
          
          try {
            const canvasInfo = await web.canvases.access.get({ canvas_id: canvasId });
            if (canvasInfo.url) {
              responseText += `\n🔗 <${canvasInfo.url}|View Canvas>`;
            }
          } catch (canvasError) {
            console.log("⚠️ Could not get canvas URL:", canvasError.message);
          }
        }
        
        await web.chat.postMessage({
          channel,
          text: responseText,
        });
        
        console.log("✅ Mention response sent!");
        
      } catch (postError) {
        console.log("❌ Error responding to mention:", postError.message);
      }

      return res.status(200).end();
    }

    // Log all other events
    console.log("📝 OTHER EVENT RECEIVED");
    console.log("🔍 Type:", body.event?.type);
    console.log("🏷️ Subtype:", body.event?.subtype);
    console.log("📄 Event details:", JSON.stringify(body.event, null, 2));

    return res.status(200).end();
  } catch (error) {
    console.log("💥 Handler error:", error);
    return res.status(500).send("Internal Server Error");
  }
}

// Timestamp: 1751020826
