import { useState, useEffect } from 'react';
import { githubAuth } from '@/services/githubAuth';
import { useAuth } from '@/contexts/AuthContext';

interface Repository {
  id: number;
  name: string;
  full_name: string;
  description?: string | null;
  html_url: string;
  stargazers_count?: number;
  forks_count?: number;
  language?: string | null;
  topics?: string[];
  updated_at: string;
  created_at: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  open_issues_count?: number;
  license?: { name: string } | null;
  private: boolean;
}

export const useUserRepositories = () => {
  const { isAuthenticated } = useAuth();
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserRepositories = async (options: {
    visibility?: 'all' | 'public' | 'private';
    sort?: 'created' | 'updated' | 'pushed' | 'full_name';
    direction?: 'asc' | 'desc';
  } = {}) => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      setError(null);
      
      const repos = await githubAuth.getUserRepositories(options);
      setRepositories(repos as Repository[]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch repositories';
      setError(errorMessage);
      console.error('Error fetching user repositories:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserOrganizations = async () => {
    if (!isAuthenticated) return;

    try {
      const orgs = await githubAuth.getUserOrganizations();
      setOrganizations(orgs);
    } catch (err) {
      console.error('Error fetching organizations:', err);
    }
  };

  const fetchOrgRepositories = async (org: string, options: {
    type?: 'all' | 'public' | 'private' | 'forks' | 'sources' | 'member';
    sort?: 'created' | 'updated' | 'pushed' | 'full_name';
    direction?: 'asc' | 'desc';
  } = {}) => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      setError(null);
      
      const repos = await githubAuth.getOrgRepositories(org, options);
      setRepositories(repos as Repository[]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch organization repositories';
      setError(errorMessage);
      console.error('Error fetching org repositories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserRepositories();
      fetchUserOrganizations();
    }
  }, [isAuthenticated]);

  return {
    repositories,
    organizations,
    loading,
    error,
    fetchUserRepositories,
    fetchOrgRepositories,
    refetch: fetchUserRepositories,
  };
};