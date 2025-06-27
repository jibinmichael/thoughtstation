module.exports = (req, res) => {
  res.status(200).json({
    app: 'Paper - Slack Canvas Assistant',
    version: '1.0.0',
    endpoints: {
      install: '/slack/install',
      oauth: '/slack/oauth',
      events: '/slack/events'
    }
  });
}; 