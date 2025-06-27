const { MongoClient } = require('mongodb');

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  const client = new MongoClient(uri, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
  });

  await client.connect();
  const db = client.db('paper');

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

// Collections
const COLLECTIONS = {
  INSTALLATIONS: 'installations',
  CANVASES: 'canvases',
  MESSAGES: 'messages',
  RATE_LIMITS: 'rate_limits'
};

// Database schemas
const schemas = {
  installation: {
    team_id: String,
    user_id: String,
    access_token: String, // encrypted
    bot_user_id: String,
    bot_access_token: String, // encrypted
    app_id: String,
    enterprise_id: String,
    installed_at: Date,
    updated_at: Date
  },
  canvas: {
    team_id: String,
    channel_id: String,
    canvas_id: String,
    topic_id: String,
    title: String,
    content: Object, // structured content
    last_message_ts: String,
    created_at: Date,
    updated_at: Date
  },
  message: {
    team_id: String,
    channel_id: String,
    message_ts: String,
    user: String,
    text: String,
    thread_ts: String,
    processed: Boolean,
    created_at: Date
  }
};

// Helper functions for multi-tenant queries
function getInstallationQuery(teamId, enterpriseId = null) {
  const query = { team_id: teamId };
  if (enterpriseId) {
    query.enterprise_id = enterpriseId;
  }
  return query;
}

function getCanvasQuery(teamId, channelId) {
  return { team_id: teamId, channel_id: channelId };
}

module.exports = {
  connectToDatabase,
  COLLECTIONS,
  schemas,
  getInstallationQuery,
  getCanvasQuery
}; 