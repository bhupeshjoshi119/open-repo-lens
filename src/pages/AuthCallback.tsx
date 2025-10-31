import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { githubAuth } from '@/services/githubAuth';
import { githubApi } from '@/services/githubApi';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        setError(`GitHub OAuth error: ${error}`);
        return;
      }

      if (!code) {
        setError('No authorization code received');
        return;
      }

      // Exchange code for token
      const accessToken = await githubAuth.exchangeCodeForToken(code);
      
      // Set token in auth service
      githubAuth.setAccessToken(accessToken);
      
      // Set token in API service
      githubApi.setToken(accessToken);
      
      // Refresh user data
      await refreshUser();
      
      // Redirect to home page
      navigate('/', { replace: true });
    } catch (error) {
      console.error('OAuth callback error:', error);
      setError(error instanceof Error ? error.message : 'Authentication failed');
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-destructive">Authentication Error</h1>
          <p className="text-muted-foreground">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        <h1 className="text-2xl font-bold">Authenticating...</h1>
        <p className="text-muted-foreground">Please wait while we complete your GitHub login.</p>
      </div>
    </div>
  );
};

export default AuthCallback;