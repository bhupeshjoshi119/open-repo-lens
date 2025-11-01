import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Star,
  GitBranch,
  Bug,
  Clock,
  Sparkles,
  Target
} from 'lucide-react';

interface Repository {
  id: number;
  full_name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  created_at: string;
  updated_at: string;
  topics?: string[];
  license?: { name: string } | null;
}

interface RepositoryHealthDashboardProps {
  repositories: Repository[];
  className?: string;
}

export const RepositoryHealthDashboard: React.FC<RepositoryHealthDashboardProps> = ({
  repositories,
  className = ''
}) => {
  if (!repositories || repositories.length === 0) {
    return null;
  }

  const calculateHealthScore = (repo: Repository): number => {
    let score = 0;
    const daysSinceUpdate = Math.floor((Date.now() - new Date(repo.updated_at).getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceUpdate <= 7) score += 40;
    else if (daysSinceUpdate <= 30) score += 30;
    else if (daysSinceUpdate <= 90) score += 20;
    else if (daysSinceUpdate <= 365) score += 10;
    
    if (repo.stargazers_count >= 1000) score += 30;
    else if (repo.stargazers_count >= 100) score += 25;
    else if (repo.stargazers_count >= 10) score += 15;
    else if (repo.stargazers_count >= 1) score += 5;
    
    if (repo.forks_count >= 100) score += 20;
    else if (repo.forks_count >= 10) score += 15;
    else if (repo.forks_count >= 1) score += 10;
    
    const issueRatio = repo.open_issues_count / Math.max(repo.stargazers_count, 1);
    if (issueRatio <= 0.1) score += 10;
    else if (issueRatio <= 0.3) score += 7;
    else if (issueRatio <= 0.5) score += 5;
    
    return Math.min(100, Math.max(0, score));
  };

  const healthScores = repositories.map(calculateHealthScore);
  const averageHealth = healthScores.reduce((a, b) => a + b, 0) / healthScores.length;
  const totalStars = repositories.reduce((sum, repo) => sum + repo.stargazers_count, 0);
  const totalForks = repositories.reduce((sum, repo) => sum + repo.forks_count, 0);
  const totalIssues = repositories.reduce((sum, repo) => sum + repo.open_issues_count, 0);
  
  const healthTrend = averageHealth >= 80 ? 'excellent' : averageHealth >= 60 ? 'good' : 'needs-attention';
  const getTrendIcon = () => {
    if (healthTrend === 'excellent') return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (healthTrend === 'good') return <Minus className="w-4 h-4 text-blue-500" />;
    return <TrendingDown className="w-4 h-4 text-orange-500" />;
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-blue-600 bg-blue-50 border-blue-200';
    return 'text-orange-600 bg-orange-50 border-orange-200';
  };

  const topPerformer = repositories[healthScores.indexOf(Math.max(...healthScores))];
  const needsAttention = repositories[healthScores.indexOf(Math.min(...healthScores))];

  return (
    <Card className={`${className} bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20 animate-in fade-in slide-in-from-bottom-4 duration-700`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            <span>Portfolio Health Dashboard</span>
          </div>
          <Badge variant="outline" className={`${getHealthColor(averageHealth)} animate-in fade-in slide-in-from-right-2 duration-500 delay-300`}>
            {Math.round(averageHealth)}/100
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Health */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Overall Health</span>
            <div className="flex items-center gap-1">
              {getTrendIcon()}
              <span className="capitalize">{healthTrend.replace('-', ' ')}</span>
            </div>
          </div>
          <Progress value={averageHealth} className="h-2 animate-in slide-in-from-left duration-1000 delay-500" />
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center p-3 rounded-lg bg-background/50 border">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Star className="w-3 h-3 text-yellow-500" />
              <span className="text-xs text-muted-foreground">Stars</span>
            </div>
            <div className="font-semibold text-sm">{totalStars.toLocaleString()}</div>
          </div>
          
          <div className="text-center p-3 rounded-lg bg-background/50 border">
            <div className="flex items-center justify-center gap-1 mb-1">
              <GitBranch className="w-3 h-3 text-blue-500" />
              <span className="text-xs text-muted-foreground">Forks</span>
            </div>
            <div className="font-semibold text-sm">{totalForks.toLocaleString()}</div>
          </div>
          
          <div className="text-center p-3 rounded-lg bg-background/50 border">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Bug className="w-3 h-3 text-red-500" />
              <span className="text-xs text-muted-foreground">Issues</span>
            </div>
            <div className="font-semibold text-sm">{totalIssues.toLocaleString()}</div>
          </div>
          
          <div className="text-center p-3 rounded-lg bg-background/50 border">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Target className="w-3 h-3 text-purple-500" />
              <span className="text-xs text-muted-foreground">Repos</span>
            </div>
            <div className="font-semibold text-sm">{repositories.length}</div>
          </div>
        </div>

        {/* Top Performer & Needs Attention */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-3 h-3 text-green-600" />
              <span className="text-xs font-medium text-green-800 dark:text-green-200">Top Performer</span>
            </div>
            <div className="text-sm font-semibold text-green-900 dark:text-green-100 truncate">
              {topPerformer.full_name.split('/')[1]}
            </div>
            <div className="text-xs text-green-700 dark:text-green-300">
              Health: {calculateHealthScore(topPerformer)}/100
            </div>
          </div>
          
          {healthScores.some(score => score < 60) && (
            <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-3 h-3 text-orange-600" />
                <span className="text-xs font-medium text-orange-800 dark:text-orange-200">Needs Attention</span>
              </div>
              <div className="text-sm font-semibold text-orange-900 dark:text-orange-100 truncate">
                {needsAttention.full_name.split('/')[1]}
              </div>
              <div className="text-xs text-orange-700 dark:text-orange-300">
                Health: {calculateHealthScore(needsAttention)}/100
              </div>
            </div>
          )}
        </div>

        {/* AI Insight */}
        <div className="p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-3 h-3 text-purple-600" />
            <span className="text-xs font-medium text-purple-800 dark:text-purple-200">AI Insight</span>
          </div>
          <p className="text-xs text-purple-700 dark:text-purple-300">
            {averageHealth >= 80 
              ? "🌟 Excellent portfolio health! Your repositories show strong community engagement and regular maintenance."
              : averageHealth >= 60
              ? "✅ Good portfolio foundation. Consider increasing activity in lower-performing repositories."
              : "🔧 Focus on improving documentation, addressing issues, and maintaining regular update schedules."
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
};