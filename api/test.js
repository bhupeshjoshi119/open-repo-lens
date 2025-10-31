// Simple test endpoint to verify Vercel API routes are working

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const hasEnvVars = !!(
    process.env.VITE_GITHUB_CLIENT_ID && 
    process.env.VITE_GITHUB_CLIENT_SECRET && 
    process.env.VITE_GITHUB_REDIRECT_URI
  );

  return res.status(200).json({
    message: 'API routes are working!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    hasGitHubEnvVars: hasEnvVars,
    clientIdPresent: !!process.env.VITE_GITHUB_CLIENT_ID,
    clientSecretPresent: !!process.env.VITE_GITHUB_CLIENT_SECRET,
    redirectUriPresent: !!process.env.VITE_GITHUB_REDIRECT_URI
  });
}