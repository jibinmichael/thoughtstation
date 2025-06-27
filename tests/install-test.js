require('dotenv').config();
const crypto = require('crypto');

console.log('🧪 Paper - OAuth Installation Test\n');

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

async function asyncTest(name, fn) {
  try {
    await fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (error) {
    console.log(`❌ ${name}`);
    console.log(`   Error: ${error.message}`);
    failed++;
  }
}

// Test 1: Check installation store module
test('Installation store module loads', () => {
  const { SlackInstallationStore } = require('../lib/slack-install');
  if (!SlackInstallationStore) {
    throw new Error('SlackInstallationStore not exported');
  }
});

// Test 2: Check OAuth endpoints exist
test('OAuth endpoints exist', () => {
  const fs = require('fs');
  const requiredFiles = [
    'api/slack/install.js',
    'api/slack/oauth.js'
  ];
  
  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      throw new Error(`Missing file: ${file}`);
    }
  }
});

// Test 3: Test installation store with mock data
asyncTest('Installation store can encrypt/decrypt tokens', async () => {
  // Set up test encryption key
  const testKey = crypto.randomBytes(32).toString('hex');
  process.env.ENCRYPTION_KEY = testKey;
  
  // Clear module cache to reload with new key
  delete require.cache[require.resolve('../lib/encryption')];
  delete require.cache[require.resolve('../lib/slack-install')];
  
  const { SlackInstallationStore } = require('../lib/slack-install');
  const store = new SlackInstallationStore();
  
  // Test data
  const mockToken = 'xoxb-test-token-123456';
  const installation = {
    team: { id: 'T12345', name: 'Test Team' },
    bot: { token: mockToken, userId: 'U12345' },
    user: { id: 'U67890' },
    appId: 'A12345'
  };
  
  // Simulate storing (just test encryption)
  const encrypted = store.encryption.encrypt(mockToken);
  const decrypted = store.encryption.decrypt(encrypted);
  
  if (decrypted !== mockToken) {
    throw new Error('Token encryption/decryption failed');
  }
});

// Test 4: Slack manifest validation
test('Slack manifest is valid', () => {
  const fs = require('fs');
  const manifestPath = 'slack-app-manifest.json';
  
  if (!fs.existsSync(manifestPath)) {
    throw new Error('Slack manifest file missing');
  }
  
  const manifestContent = fs.readFileSync(manifestPath, 'utf8');
  const manifest = JSON.parse(manifestContent);
  
  // Check required fields
  if (!manifest.display_information?.name) {
    throw new Error('Manifest missing app name');
  }
  
  if (!manifest.oauth_config?.scopes?.bot) {
    throw new Error('Manifest missing bot scopes');
  }
  
  if (!manifest.settings?.event_subscriptions?.bot_events) {
    throw new Error('Manifest missing event subscriptions');
  }
  
  // Check for placeholder URLs
  const manifestStr = JSON.stringify(manifest);
  if (manifestStr.includes('YOUR_APP_URL')) {
    console.log('   Note: Remember to update YOUR_APP_URL in manifest before uploading to Slack');
  }
});

// Test 5: Required scopes match between config and manifest
test('OAuth scopes are consistent', () => {
  const { SLACK_SCOPES } = require('../lib/config');
  const fs = require('fs');
  const manifest = JSON.parse(fs.readFileSync('slack-app-manifest.json', 'utf8'));
  
  const configScopes = SLACK_SCOPES.BOT.sort();
  const manifestScopes = manifest.oauth_config.scopes.bot.sort();
  
  // Check if scopes match (manifest might have additional scopes)
  for (const scope of configScopes) {
    if (!manifestScopes.includes(scope)) {
      throw new Error(`Scope '${scope}' in config but not in manifest`);
    }
  }
});

// Test 6: MongoDB indexes recommendation
test('Database indexes recommendation', () => {
  console.log('   Note: Recommended MongoDB indexes:');
  console.log('   - installations: { team_id: 1, enterprise_id: 1 }');
  console.log('   - canvases: { team_id: 1, channel_id: 1 }');
  console.log('   - messages: { team_id: 1, channel_id: 1, message_ts: -1 }');
});

// Summary
console.log('\n📊 Test Summary:');
console.log(`   Passed: ${passed}`);
console.log(`   Failed: ${failed}`);

if (failed === 0) {
  console.log('\n🎉 All tests passed! OAuth installation setup is complete.');
  console.log('\n📝 Next steps to create your Slack app:');
  console.log('   1. Go to https://api.slack.com/apps');
  console.log('   2. Click "Create New App" → "From an app manifest"');
  console.log('   3. Select your workspace');
  console.log('   4. Paste the contents of slack-app-manifest.json');
  console.log('   5. Replace YOUR_APP_URL with your actual Vercel URL');
  console.log('   6. Review and create the app');
  console.log('   7. Copy the credentials to your .env file:');
  console.log('      - Client ID → SLACK_CLIENT_ID');
  console.log('      - Client Secret → SLACK_CLIENT_SECRET');
  console.log('      - Signing Secret → SLACK_SIGNING_SECRET');
  console.log('\n🚀 Then visit YOUR_APP_URL/slack/install to test installation!');
  process.exit(0);
} else {
  console.log('\n❌ Some tests failed. Please check the errors above.');
  process.exit(1);
} 