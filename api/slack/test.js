export default async function handler(req, res) {
  try {
    console.log("Test endpoint called");
    
    // Test importing modules one by one
    let webApiStatus = "not tested";
    let microStatus = "not tested";
    
    try {
      const { WebClient } = await import("@slack/web-api");
      webApiStatus = "imported successfully";
    } catch (e) {
      webApiStatus = `import failed: ${e.message}`;
    }
    
    try {
      const { buffer } = await import("micro");
      microStatus = "imported successfully";
    } catch (e) {
      microStatus = `import failed: ${e.message}`;
    }
    
    res.status(200).json({
      message: "Module import test",
      imports: {
        "@slack/web-api": webApiStatus,
        "micro": microStatus
      },
      env: {
        SLACK_BOT_TOKEN: !!process.env.SLACK_BOT_TOKEN,
        SLACK_SIGNING_SECRET: !!process.env.SLACK_SIGNING_SECRET
      }
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
}
