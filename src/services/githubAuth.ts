import { Octokit } from '@octokit/rest';
import { getRedirectUri } from '@/utils/environment';

interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
}

class GitHubAuthService {
  private clientId: string;
  private octokit: Octokit | null = null;

  constructor() {
    this.clientId = import.meta.env.VITE_GITHUB_CLIENT_ID || '';
    console.log('🚀 GitHubAuthService initialized - Build:', new Date().toISOString());
  }

  // Get redirect URI - always use environment variable for consistency
  private getRedirectUri(): string {
    return getRedirectUri();
  }

  // Generate GitHub OAuth URL
  getAuthUrl(): string {
    const redirectUri = this.getRedirectUri();
    
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: redirectUri,
      scope: 'repo,user:email,read:org', // repo scope for private repos
      state: this.generateState(),
    });

    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  // Exchange code for access token
  async exchangeCodeForToken(code: string): Promise<string> {
    console.log('🔧 OAuth Fix v2.0 - Using API route for token exchange');
    
    // Use the API route for both development and production
    const response = await fetch('/api/github/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      console.error('API route failed:', response.status, response.statusText);
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to exchange code for token');
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error_description || data.error);
    }
    
    console.log('✅ Token exchange successful via API route');
    return data.access_token;
  }

  // Set access token and initialize Octokit
  setAccessToken(token: string): void {
    this.octokit = new Octokit({
      auth: token,
    });
    
    // Store token in localStorage for persistence
    localStorage.setItem('github_access_token', token);
  }

  // Get stored access token
  getStoredToken(): string | null {
    return localStorage.getItem('github_access_token');
  }

  // Initialize with stored token
  initializeWithStoredToken(): boolean {
    const token = this.getStoredToken();
    if (token) {
      this.setAccessToken(token);
      return true;
    }
    return false;
  }

  // Get authenticated user info
  async getAuthenticatedUser(): Promise<GitHubUser> {
    if (!this.octokit) {
      throw new Error('Not authenticated');
    }

    const { data } = await this.octokit.rest.users.getAuthenticated();
    return data as GitHubUser;
  }

  // Get user's repositories (including private ones)
  async getUserRepositories(options: {
    visibility?: 'all' | 'public' | 'private';
    sort?: 'created' | 'updated' | 'pushed' | 'full_name';
    direction?: 'asc' | 'desc';
    per_page?: number;
    page?: number;
  } = {}) {
    if (!this.octokit) {
      throw new Error('Not authenticated');
    }

    const { data } = await this.octokit.rest.repos.listForAuthenticatedUser({
      visibility: options.visibility || 'all',
      sort: options.sort || 'updated',
      direction: options.direction || 'desc',
      per_page: options.per_page || 30,
      page: options.page || 1,
    });

    return data;
  }

  // Get organization repositories
  async getOrgRepositories(org: string, options: {
    type?: 'all' | 'public' | 'private' | 'forks' | 'sources' | 'member';
    sort?: 'created' | 'updated' | 'pushed' | 'full_name';
    direction?: 'asc' | 'desc';
    per_page?: number;
    page?: number;
  } = {}) {
    if (!this.octokit) {
      throw new Error('Not authenticated');
    }

    const { data } = await this.octokit.rest.repos.listForOrg({
      org,
      type: options.type || 'all',
      sort: options.sort || 'updated',
      direction: options.direction || 'desc',
      per_page: options.per_page || 30,
      page: options.page || 1,
    });

    return data;
  }

  // Get user's organizations
  async getUserOrganizations() {
    if (!this.octokit) {
      throw new Error('Not authenticated');
    }

    const { data } = await this.octokit.rest.orgs.listForAuthenticatedUser();
    return data;
  }

  // Check if user has access to a repository
  async checkRepositoryAccess(owner: string, repo: string): Promise<boolean> {
    if (!this.octokit) {
      return false;
    }

    try {
      await this.octokit.rest.repos.get({ owner, repo });
      return true;
    } catch (error) {
      return false;
    }
  }

  // Get Octokit instance for direct API calls
  getOctokit(): Octokit | null {
    return this.octokit;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.octokit !== null;
  }

  // Logout
  logout(): void {
    this.octokit = null;
    localStorage.removeItem('github_access_token');
  }

  // Generate random state for OAuth security
  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
}

export const githubAuth = new GitHubAuthService();
export type { GitHubUser };