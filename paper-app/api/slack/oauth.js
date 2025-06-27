export default async function handler(req, res) {
    console.log("🔓 OAuth hit with query:", req.query);
  
    if (!req.query.code) {
      return res.status(400).send("Missing ?code param from Slack");
    }
  
    return res.status(200).send("OAuth flow started (code received)");
  }
  