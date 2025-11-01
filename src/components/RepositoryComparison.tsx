import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { 
  Star, 
  GitBranch, 
  Bug, 
  TrendingUp,
  FileText,
  X,
  Trophy,
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

interface RepositoryComparisonProps {
  selectedRepos?: Repository[];
  repositories?: Repository[];
  onRemove?: (id: number) => void;
  onClear?: () => void;
  className?: string;
}

export const RepositoryComparison: React.FC<RepositoryComparisonProps> = ({
  selectedRepos = [],
  repositories = [],
  onRemove,
  onClear,
  className = ''
}) => {
  const repos = selectedRepos.length > 0 ? selectedRepos : repositories;
  
  if (!repos || repos.length < 2) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center text-muted-foreground">
          <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Select at least 2 repositories to compare</p>
        </CardContent>
      </Card>
    );
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

  const getWinner = (values: number[]): number => {
    const maxValue = Math.max(...values);
    return values.indexOf(maxValue);
  };

  const metrics = [
    {
      key: 'stargazers_count',
      label: 'Stars',
      icon: Star,
      getValue: (repo: Repository) => repo.stargazers_count,
      format: (value: number) => value.toLocaleString()
    },
    {
      key: 'forks_count',
      label: 'Forks',
      icon: GitBranch,
      getValue: (repo: Repository) => repo.forks_count,
      format: (value: number) => value.toLocaleString()
    },
    {
      key: 'open_issues_count',
      label: 'Open Issues',
      icon: Bug,
      getValue: (repo: Repository) => repo.open_issues_count,
      format: (value: number) => value.toLocaleString(),
      lowerIsBetter: true
    },
    {
      key: 'health_score',
      label: 'Health Score',
      icon: TrendingUp,
      getValue: (repo: Repository) => calculateHealthScore(repo),
      format: (value: number) => `${value}/100`
    }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Repository Comparison ({repos.length} repos)
            </div>
            {onClear && repos.length > 0 && (
              <Button
                onClick={onClear}
                variant="ghost"
                size="sm"
                className="text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 focus:ring-2 focus:ring-destructive/20 focus:ring-offset-2"
                aria-label="Clear all repositories from comparison"
              >
                Clear All
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {repos.slice(0, 3).map((repo, index) => {
              const healthScore = calculateHealthScore(repo);
              const isTopPerformer = index === 0; // Assuming first is best for demo
              
              return (
                <Card key={repo.id} className={`p-4 relative ${isTopPerformer ? 'ring-2 ring-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950' : ''}`}>
                  {onRemove && (
                    <button
                      onClick={() => onRemove(repo.id)}
                      className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-destructive/10 hover:text-destructive transition-all duration-200 focus:ring-2 focus:ring-destructive/20 focus:ring-offset-2 group"
                      aria-label={`Remove ${repo.full_name} from comparison`}
                    >
                      <X className="w-3 h-3 transition-transform duration-200 group-hover:scale-110" />
                    </button>
                  )}
                  {isTopPerformer && (
                    <div className="absolute top-2 left-2">
                      <Trophy className="w-4 h-4 text-yellow-600" />
                    </div>
                  )}
                  <div className="space-y-2 mt-2">
                    <h3 className="font-semibold text-sm truncate pr-6">{repo.full_name}</h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      {repo.language && (
                        <Badge variant="secondary" className="text-xs">
                          {repo.language}
                        </Badge>
                      )}
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          healthScore >= 80 ? 'border-green-500 text-green-700' :
                          healthScore >= 60 ? 'border-blue-500 text-blue-700' :
                          'border-orange-500 text-orange-700'
                        }`}
                      >
                        Health: {healthScore}/100
                      </Badge>
                      {isTopPerformer && (
                        <Badge className="text-xs bg-yellow-500 text-yellow-900">
                          Top Pick
                        </Badge>
                      )}
                    </div>
                    <Progress 
                      value={healthScore} 
                      className="h-2"
                    />
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="space-y-4">
            {metrics.map((metric) => {
              const values = repos.map(metric.getValue);
              const winnerIndex = metric.lowerIsBetter 
                ? values.indexOf(Math.min(...values))
                : getWinner(values);

              return (
                <div key={metric.key} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <metric.icon className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{metric.label}</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {repos.slice(0, 3).map((repo, index) => {
                      const value = metric.getValue(repo);
                      const isWinner = index === winnerIndex && repos.length > 1;
                      
                      return (
                        <div
                          key={repo.id}
                          className={`p-3 rounded-lg border ${
                            isWinner 
                              ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' 
                              : 'bg-muted/30'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground truncate">
                              {repo.full_name.split('/')[1]}
                            </span>
                            {isWinner && (
                              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                Best
                              </Badge>
                            )}
                          </div>
                          <div className="text-lg font-semibold">
                            {metric.format(value)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* AI Recommendations - Surprise Feature! */}
          {repos.length >= 2 && (
            <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-purple-600" />
                <h4 className="font-semibold text-purple-900 dark:text-purple-100">AI Recommendations</h4>
              </div>
              <div className="space-y-2 text-sm">
                {generateAIRecommendations(repos).map((rec, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                    <p className="text-purple-800 dark:text-purple-200">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// AI-powered recommendation generator - Surprise feature!
const generateAIRecommendations = (repos: Repository[]): string[] => {
  const recommendations: string[] = [];
  
  // Analyze health scores
  const healthScores = repos.map(repo => {
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
  });
  
  const bestRepo = repos[healthScores.indexOf(Math.max(...healthScores))];
  const avgHealth = healthScores.reduce((a, b) => a + b, 0) / healthScores.length;
  
  // Generate contextual recommendations
  if (avgHealth >= 80) {
    recommendations.push(`🌟 Excellent portfolio! ${bestRepo.full_name} shows outstanding community engagement.`);
  } else if (avgHealth >= 60) {
    recommendations.push(`✅ Solid repositories. Consider increasing activity in lower-performing repos.`);
  } else {
    recommendations.push(`🔧 Focus on improving documentation and regular updates to boost repository health.`);
  }
  
  // Language diversity analysis
  const languages = [...new Set(repos.map(r => r.language).filter(Boolean))];
  if (languages.length >= 3) {
    recommendations.push(`🚀 Great language diversity! Your ${languages.join(', ')} skills show versatility.`);
  } else if (languages.length === 1) {
    recommendations.push(`💡 Consider exploring complementary technologies to diversify your skill set.`);
  }
  
  // Community engagement analysis
  const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
  const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);
  
  if (totalStars > totalForks * 3) {
    recommendations.push(`⭐ High star-to-fork ratio indicates strong project appeal. Great work!`);
  } else if (totalForks > totalStars) {
    recommendations.push(`🔀 High fork activity suggests practical, useful projects that developers want to build upon.`);
  }
  
  // Issue management insight
  const avgIssueRatio = repos.reduce((sum, repo) => sum + (repo.open_issues_count / Math.max(repo.stargazers_count, 1)), 0) / repos.length;
  if (avgIssueRatio < 0.1) {
    recommendations.push(`🎯 Excellent issue management! Your repositories maintain clean issue queues.`);
  } else if (avgIssueRatio > 0.3) {
    recommendations.push(`📋 Consider dedicating time to address open issues to improve repository health.`);
  }
  
  return recommendations.slice(0, 3); // Return top 3 recommendations
};