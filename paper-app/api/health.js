export default function handler(req, res) {
  res.status(200).json({
    status: "ok",
    message: "Health check",
    timestamp: new Date().toISOString(),
    path: req.url,
    method: req.method
  });
} 