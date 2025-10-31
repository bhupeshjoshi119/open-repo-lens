// Simple proxy for GitHub OAuth token exchange during development
// In production, you should implement this on your backend server

export function githubOAuthProxy() {
  return {
    name: 'github-oauth-proxy',
    configureServer(server) {
      // Get environment variables from process.env (server-side)
      const clientId = process.env.VITE_GITHUB_CLIENT_ID;
      const clientSecret = process.env.VITE_GITHUB_CLIENT_SECRET;
      const redirectUri = process.env.VITE_GITHUB_REDIRECT_URI;

      server.middlewares.use('/api/github/oauth/token', async (req, res, next) => {
        if (req.method !== 'POST') {
          return next();
        }

        // Handle CORS preflight
        if (req.method === 'OPTIONS') {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
          res.statusCode = 200;
          res.end();
          return;
        }

        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });

        req.on('end', async () => {
          try {
            const { code } = JSON.parse(body);
            
            console.log('Exchanging code for token...', { 
              code: code?.substring(0, 10) + '...',
              clientId: clientId?.substring(0, 10) + '...',
              redirectUri 
            });
            
            const requestBody = {
              client_id: clientId,
              client_secret: clientSecret,
              code,
              redirect_uri: redirectUri,
            };
            
            console.log('Request body:', { 
              ...requestBody, 
              client_secret: clientSecret ? '[REDACTED]' : 'MISSING',
              client_id: requestBody.client_id?.substring(0, 10) + '...'
            });
            
            const response = await fetch('https://github.com/login/oauth/access_token', {
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'User-Agent': 'TechHub-OAuth-App',
              },
              body: JSON.stringify(requestBody),
            });

            const data = await response.json();
            console.log('GitHub response status:', response.status);
            console.log('GitHub response:', { ...data, access_token: data.access_token ? '[REDACTED]' : undefined });
            
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'POST');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
            
            if (data.error) {
              console.error('GitHub OAuth error:', data);
              res.statusCode = 400;
              res.end(JSON.stringify({ error: data.error_description || data.error }));
            } else {
              res.end(JSON.stringify(data));
            }
          } catch (error) {
            console.error('Proxy error:', error);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Internal server error: ' + error.message }));
          }
        });
      });
    }
  };
}