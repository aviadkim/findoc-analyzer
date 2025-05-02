// Health check endpoint for Docker and Kubernetes
export default function handler(req, res) {
  // Return a simple 200 OK response
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
}
