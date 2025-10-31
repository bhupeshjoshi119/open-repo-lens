// Vercel API Route for GitHub OAuth token exchange
// This replaces the Vite proxy in production

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    // Get environment variables (these are server-side only)
    const clientId = process.env.VITE_GITHUB_CLIENT_ID;
    const clientSecret = process.env.VITE_GITHUB_CLIENT_SECRET;
    const redirectUri = process.env.VITE_GITHUB_REDIRECT_URI;

    if (!clientId || !clientSecret) {
      console.error('Missing GitHub OAuth credentials');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Exchange code for access token with GitHub
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'TechHub-OAuth-App',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!response.ok) {
      console.error('GitHub API error:', response.status, response.statusText);
      return res.status(response.status).json({ 
        error: 'GitHub API request failed' 
      });
    }

    const data = await response.json();

    if (data.error) {
      console.error('GitHub OAuth error:', data);
      return res.status(400).json({ 
        error: data.error_description || data.error 
      });
    }

    // Return the access token
    return res.status(200).json({
      access_token: data.access_token,
      token_type: data.token_type,
      scope: data.scope
    });

  } catch (error) {
    console.error('OAuth token exchange error:', error);
    return res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
}