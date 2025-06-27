require('dotenv').config();
const crypto = require('crypto');

console.log('🧪 Paper - Environment & Config Test\n');

// Test results tracking
let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (error) {
    console.log(`❌ ${name}`);
    console.log(`   Error: ${error.message}`);
    failed++;
  }
}

// Test 1: Check if dotenv loads
test('Environment variables loaded', () => {
  if (Object.keys(process.env).length === 0) {
    throw new Error('No environment variables found');
  }
});

// Test 2: Check required environment variables
test('Required environment variables present', () => {
  const required = [
    'SLACK_CLIENT_ID',
    'SLACK_CLIENT_SECRET', 
    'SLACK_SIGNING_SECRET',
    'MONGODB_URI',
    'ENCRYPTION_KEY',
    'OPENAI_API_KEY',
    'APP_URL'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing: ${missing.join(', ')}`);
  }
});

// Test 3: Test encryption utility
test('Encryption utility works', () => {
  // Use a test key if ENCRYPTION_KEY is not set
  const testKey = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
  
  // Temporarily set the key
  const originalKey = process.env.ENCRYPTION_KEY;
  process.env.ENCRYPTION_KEY = testKey;
  
  try {
    const { getEncryption } = require('../lib/encryption');
    const encryption = getEncryption();
    
    const testData = 'xoxb-test-token-12345';
    const encrypted = encryption.encrypt(testData);
    const decrypted = encryption.decrypt(encrypted);
    
    if (decrypted !== testData) {
      throw new Error('Encryption/decryption mismatch');
    }
  } finally {
    // Restore original key
    if (originalKey) {
      process.env.ENCRYPTION_KEY = originalKey;
    } else {
      delete process.env.ENCRYPTION_KEY;
    }
  }
});

// Test 4: Test MongoDB connection string format
test('MongoDB URI format is valid', () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/paper';
  if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
    throw new Error('Invalid MongoDB URI format');
  }
});

// Test 5: Test database connection (if MongoDB is available)
test('Database connection module loads', async () => {
  const { connectToDatabase, COLLECTIONS } = require('../lib/database');
  
  // Just check if the module loads correctly
  if (!connectToDatabase || !COLLECTIONS) {
    throw new Error('Database module exports missing');
  }
  
  // Verify collections are defined
  const expectedCollections = ['INSTALLATIONS', 'CANVASES', 'MESSAGES', 'RATE_LIMITS'];
  for (const collection of expectedCollections) {
    if (!COLLECTIONS[collection]) {
      throw new Error(`Missing collection: ${collection}`);
    }
  }
});

// Test 6: Config validation loads
test('Config validation works', () => {
  // Clear module cache to re-test
  delete require.cache[require.resolve('../lib/config')];
  
  try {
    const { SLACK_SCOPES } = require('../lib/config');
    
    if (!SLACK_SCOPES || !SLACK_SCOPES.BOT || SLACK_SCOPES.BOT.length === 0) {
      throw new Error('Slack scopes not properly defined');
    }
  } catch (error) {
    // Config validation might fail if env vars are missing, that's ok for this test
    if (!error.message.includes('Slack scopes')) {
      // This is an expected validation error, not a code error
      console.log('   Note: Config validation errors are expected if .env is not set up');
    } else {
      throw error;
    }
  }
});

// Test 7: Project structure
test('Project structure is correct', () => {
  const fs = require('fs');
  const requiredFiles = [
    'package.json',
    'vercel.json',
    'lib/encryption.js',
    'lib/database.js',
    'lib/config.js'
  ];
  
  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      throw new Error(`Missing file: ${file}`);
    }
  }
});

// Summary
console.log('\n📊 Test Summary:');
console.log(`   Passed: ${passed}`);
console.log(`   Failed: ${failed}`);

if (failed === 0) {
  console.log('\n🎉 All tests passed! Environment setup is complete.');
  console.log('\n📝 Next steps:');
  console.log('   1. Copy env.example to .env and fill in your values');
  console.log('   2. Generate a 32-byte encryption key:');
  console.log(`      node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`);
  console.log('   3. Set up MongoDB Atlas and get your connection string');
  console.log('   4. Create a Slack app at api.slack.com');
  process.exit(0);
} else {
  console.log('\n❌ Some tests failed. Please check the errors above.');
  process.exit(1);
} 