const crypto = require('crypto');
const { config } = require('../../lib/config');

module.exports = async (req, res) => {
  // Verify the request is from Slack
  const signature = req.headers['x-slack-signature'];
  const timestamp = req.headers['x-slack-request-timestamp'];
  const body = JSON.stringify(req.body);

  // Check if we have Slack signing secret
  if (!config.SLACK_SIGNING_SECRET) {
    console.warn('SLACK_SIGNING_SECRET not configured');
    return res.status(503).json({ error: 'Service not configured' });
  }

  // Verify timestamp (must be within 5 minutes)
  const time = Math.floor(new Date().getTime() / 1000);
  if (Math.abs(time - timestamp) > 300) {
    return res.status(400).json({ error: 'Request timeout' });
  }

  // Verify signature
  const sigBasestring = 'v0:' + timestamp + ':' + body;
  const mySignature = 'v0=' + crypto
    .createHmac('sha256', config.SLACK_SIGNING_SECRET)
    .update(sigBasestring, 'utf8')
    .digest('hex');

  if (crypto.timingSafeEqual(
    Buffer.from(mySignature, 'utf8'),
    Buffer.from(signature, 'utf8')
  )) {
    // Handle URL verification challenge
    if (req.body.type === 'url_verification') {
      return res.status(200).json({ challenge: req.body.challenge });
    }

    // Handle events
    if (req.body.type === 'event_callback') {
      const event = req.body.event;
      
      console.log('Received event:', event.type);
      
      // TODO: Handle different event types
      switch (event.type) {
        case 'app_home_opened':
          console.log('App home opened by user:', event.user);
          break;
        case 'member_joined_channel':
          console.log('Paper added to channel:', event.channel);
          // TODO: Create initial Canvas
          break;
        case 'message':
          console.log('New message in channel:', event.channel);
          // TODO: Update Canvas
          break;
        case 'app_mention':
          console.log('Paper mentioned in channel:', event.channel);
          break;
      }
      
      // Acknowledge event received
      return res.status(200).json({ ok: true });
    }
  } else {
    return res.status(400).json({ error: 'Invalid signature' });
  }

  // Default response
  res.status(200).json({ ok: true });
}; 