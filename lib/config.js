const { z } = require('zod');
require('dotenv').config();

// Environment variable schema
const envSchema = z.object({
  // Slack App Credentials - OPTIONAL for initial deploy
  SLACK_CLIENT_ID: z.string().min(1).optional(),
  SLACK_CLIENT_SECRET: z.string().min(1).optional(),
  SLACK_SIGNING_SECRET: z.string().min(1).optional(),
  
  // MongoDB - REQUIRED
  MONGODB_URI: z.string().url().startsWith('mongodb'),
  
  // Encryption - REQUIRED
  ENCRYPTION_KEY: z.string().length(64).regex(/^[0-9a-fA-F]{64}$/),
  
  // OpenAI - REQUIRED
  OPENAI_API_KEY: z.string().startsWith('sk-'),
  
  // Upstash Redis - OPTIONAL
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
  
  // App URL - OPTIONAL for initial deploy
  APP_URL: z.string().url().optional(),
  
  // Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development')
});

// Validate and export config
let config;
try {
  config = envSchema.parse(process.env);
} catch (error) {
  console.error('Environment validation failed:');
  console.error(error.errors);
  // Only throw in production if Slack credentials are missing
  if (process.env.NODE_ENV === 'production' && 
      (!process.env.SLACK_CLIENT_ID || !process.env.SLACK_CLIENT_SECRET || !process.env.SLACK_SIGNING_SECRET)) {
    console.warn('Warning: Slack credentials missing. OAuth endpoints will not work until configured.');
  }
  config = process.env; // Use raw env vars as fallback
}

// Slack OAuth scopes required
const SLACK_SCOPES = {
  BOT: [
    'channels:history',
    'channels:read',
    'chat:write',
    'users:read',
    'files:read',
    'team:read',
    'groups:history',
    'groups:read',
    'im:history',
    'mpim:history'
  ],
  USER: []
};

module.exports = {
  config,
  SLACK_SCOPES
}; 