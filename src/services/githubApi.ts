interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics: string[];
  updated_at: string;
  created_at: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  open_issues_count: number;
  license?: { name: string } | null;
}

interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed';
  created_at: string;
  updated_at: string;
  labels: Array<{
    name: string;
    color: string;
  }>;
  user: {
    login: string;
    avatar_url: string;
  };
}

interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      email: string;
      date: string;
    };
  };
  author: {
    login: string;
    avatar_url: string;
  } | null;
}

interface GitHubContributor {
  login: string;
  avatar_url: string;
  contributions: number;
}

class GitHubApiService {
  private baseUrl = 'https://api.github.com';
  private token?: string;

  constructor(token?: string) {
    this.token = token;
  }

  private async makeRequest<T>(endpoint: string): Promise<T> {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'TechHub-App'
    };

    if (this.token) {
      headers['Authorization'] = `token ${this.token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, { headers });
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getRepository(owner: string, repo: string): Promise<GitHubRepository> {
    return this.makeRequest<GitHubRepository>(`/repos/${owner}/${repo}`);
  }

  async getRepositoryIssues(
    owner: string, 
    repo: string, 
    options: {
      state?: 'open' | 'closed' | 'all';
      sort?: 'created' | 'updated' | 'comments';
      direction?: 'asc' | 'desc';
      per_page?: number;
      page?: number;
    } = {}
  ): Promise<GitHubIssue[]> {
    const params = new URLSearchParams();
    
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const endpoint = `/repos/${owner}/${repo}/issues${queryString ? `?${queryString}` : ''}`;
    
    return this.makeRequest<GitHubIssue[]>(endpoint);
  }

  async getRepositoryCommits(
    owner: string, 
    repo: string,
    options: {
      since?: string;
      until?: string;
      per_page?: number;
      page?: number;
    } = {}
  ): Promise<GitHubCommit[]> {
    const params = new URLSearchParams();
    
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const endpoint = `/repos/${owner}/${repo}/commits${queryString ? `?${queryString}` : ''}`;
    
    return this.makeRequest<GitHubCommit[]>(endpoint);
  }

  async getRepositoryContributors(
    owner: string, 
    repo: string,
    options: {
      per_page?: number;
      page?: number;
    } = {}
  ): Promise<GitHubContributor[]> {
    const params = new URLSearchParams();
    
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const endpoint = `/repos/${owner}/${repo}/contributors${queryString ? `?${queryString}` : ''}`;
    
    return this.makeRequest<GitHubContributor[]>(endpoint);
  }

  async getRepositoryLanguages(owner: string, repo: string): Promise<Record<string, number>> {
    return this.makeRequest<Record<string, number>>(`/repos/${owner}/${repo}/languages`);
  }

  async getRepositoryReleases(
    owner: string, 
    repo: string,
    options: {
      per_page?: number;
      page?: number;
    } = {}
  ): Promise<any[]> {
    const params = new URLSearchParams();
    
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const endpoint = `/repos/${owner}/${repo}/releases${queryString ? `?${queryString}` : ''}`;
    
    return this.makeRequest<any[]>(endpoint);
  }

  async searchRepositories(
    query: string,
    options: {
      sort?: 'stars' | 'forks' | 'help-wanted-issues' | 'updated';
      order?: 'desc' | 'asc';
      per_page?: number;
      page?: number;
    } = {}
  ): Promise<{ items: GitHubRepository[]; total_count: number }> {
    const params = new URLSearchParams();
    params.append('q', query);
    
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    return this.makeRequest<{ items: GitHubRepository[]; total_count: number }>(
      `/search/repositories?${params.toString()}`
    );
  }

  // Enhanced analysis methods
  async getRepositoryAnalysisData(owner: string, repo: string) {
    try {
      const [
        repository,
        issues,
        commits,
        contributors,
        languages,
        releases
      ] = await Promise.all([
        this.getRepository(owner, repo),
        this.getRepositoryIssues(owner, repo, { state: 'all', per_page: 100 }),
        this.getRepositoryCommits(owner, repo, { per_page: 100 }),
        this.getRepositoryContributors(owner, repo, { per_page: 100 }),
        this.getRepositoryLanguages(owner, repo),
        this.getRepositoryReleases(owner, repo, { per_page: 10 })
      ]);

      return {
        repository,
        issues,
        commits,
        contributors,
        languages,
        releases,
        analytics: this.calculateAnalytics({
          repository,
          issues,
          commits,
          contributors,
          languages
        })
      };
    } catch (error) {
      console.error('Error fetching repository analysis data:', error);
      throw error;
    }
  }

  private calculateAnalytics(data: {
    repository: GitHubRepository;
    issues: GitHubIssue[];
    commits: GitHubCommit[];
    contributors: GitHubContributor[];
    languages: Record<string, number>;
  }) {
    const { repository, issues, commits, contributors, languages } = data;
    
    // Issue analytics
    const openIssues = issues.filter(issue => issue.state === 'open');
    const closedIssues = issues.filter(issue => issue.state === 'closed');
    const issueResolutionRate = issues.length > 0 ? (closedIssues.length / issues.length) * 100 : 0;
    
    // Commit analytics
    const recentCommits = commits.filter(commit => {
      const commitDate = new Date(commit.commit.author.date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return commitDate > thirtyDaysAgo;
    });
    
    // Contributor analytics
    const activeContributors = contributors.filter(c => c.contributions > 1);
    
    // Language analytics
    const totalBytes = Object.values(languages).reduce((sum, bytes) => sum + bytes, 0);
    const languagePercentages = Object.entries(languages).map(([lang, bytes]) => ({
      language: lang,
      percentage: totalBytes > 0 ? (bytes / totalBytes) * 100 : 0,
      bytes
    })).sort((a, b) => b.percentage - a.percentage);
    
    // Health score calculation
    const healthScore = this.calculateHealthScore({
      repository,
      issueResolutionRate,
      recentCommitCount: recentCommits.length,
      contributorCount: activeContributors.length,
      hasDescription: !!repository.description,
      hasLicense: !!repository.license,
      hasTopics: repository.topics.length > 0
    });

    return {
      issueResolutionRate: Math.round(issueResolutionRate),
      openIssuesCount: openIssues.length,
      closedIssuesCount: closedIssues.length,
      recentCommitCount: recentCommits.length,
      activeContributorCount: activeContributors.length,
      languageBreakdown: languagePercentages,
      healthScore,
      lastCommitDate: commits[0]?.commit.author.date,
      averageIssueAge: this.calculateAverageIssueAge(openIssues),
      contributorDiversity: contributors.length,
      releaseFrequency: data.repository ? this.calculateReleaseFrequency(repository.created_at) : 0
    };
  }

  private calculateHealthScore(factors: {
    repository: GitHubRepository;
    issueResolutionRate: number;
    recentCommitCount: number;
    contributorCount: number;
    hasDescription: boolean;
    hasLicense: boolean;
    hasTopics: boolean;
  }): number {
    let score = 0;
    
    // Issue resolution rate (0-25 points)
    score += Math.min(25, factors.issueResolutionRate * 0.25);
    
    // Recent activity (0-20 points)
    score += Math.min(20, factors.recentCommitCount * 2);
    
    // Community engagement (0-20 points)
    score += Math.min(20, factors.contributorCount * 2);
    
    // Documentation quality (0-15 points)
    if (factors.hasDescription) score += 5;
    if (factors.hasLicense) score += 5;
    if (factors.hasTopics) score += 5;
    
    // Repository maturity (0-10 points)
    const ageInDays = (Date.now() - new Date(factors.repository.created_at).getTime()) / (1000 * 60 * 60 * 24);
    if (ageInDays > 365) score += 5; // Mature project
    if (factors.repository.stargazers_count > 100) score += 5; // Popular project
    
    // Maintenance activity (0-10 points)
    const daysSinceUpdate = (Date.now() - new Date(factors.repository.updated_at).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate < 30) score += 10;
    else if (daysSinceUpdate < 90) score += 5;
    
    return Math.min(100, Math.round(score));
  }

  private calculateAverageIssueAge(openIssues: GitHubIssue[]): number {
    if (openIssues.length === 0) return 0;
    
    const totalAge = openIssues.reduce((sum, issue) => {
      const ageInDays = (Date.now() - new Date(issue.created_at).getTime()) / (1000 * 60 * 60 * 24);
      return sum + ageInDays;
    }, 0);
    
    return Math.round(totalAge / openIssues.length);
  }

  private calculateReleaseFrequency(createdAt: string): number {
    const ageInMonths = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30);
    return ageInMonths > 0 ? Math.round(ageInMonths) : 0;
  }
}

// Export singleton instance
export const githubApi = new GitHubApiService();
export type { GitHubRepository, GitHubIssue, GitHubCommit, GitHubContributor };