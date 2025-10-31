// Environment detection and configuration utilities

export const getEnvironment = () => {
  // Check if we're in development mode
  if (import.meta.env.DEV) {
    return 'development';
  }
  
  // Check if we're on Vercel (production or preview)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // Production domain
    if (hostname === 'reposcan-one.vercel.app') {
      return 'production';
    }
    
    // Vercel preview deployments (*.vercel.app)
    if (hostname.endsWith('.vercel.app')) {
      return 'production';
    }
    
    // Local development
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.')) {
      return 'development';
    }
  }
  
  // Server-side or unknown environment - default to production
  return 'production';
};

export const getRedirectUri = () => {
  // Always use environment variable if set - this ensures consistency
  const envRedirectUri = import.meta.env.VITE_GITHUB_REDIRECT_URI;
  if (envRedirectUri) {
    return envRedirectUri;
  }
  
  // Fallback to dynamic detection only if env var is not set
  if (typeof window === 'undefined') {
    // Server-side rendering fallback
    return 'https://reposcan-one.vercel.app/auth/callback';
  }
  
  const hostname = window.location.hostname;
  
  // Exact production domain match
  if (hostname === 'reposcan-one.vercel.app') {
    return 'https://reposcan-one.vercel.app/auth/callback';
  }
  
  // Local development (localhost with any port)
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:8080/auth/callback';
  }
  
  // For any other domain, default to production URL
  // This prevents issues with unconfigured domains
  return 'https://reposcan-one.vercel.app/auth/callback';
};

export const getBaseUrl = () => {
  const env = getEnvironment();
  
  if (env === 'production') {
    return 'https://reposcan-one.vercel.app';
  }
  
  // Development
  const protocol = window.location.protocol;
  const host = window.location.host;
  return `${protocol}//${host}`;
};