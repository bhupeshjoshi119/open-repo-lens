import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import ChromeAiService from '../services/chromeAiService';
import { 
  Brain, 
  Sparkles, 
  TrendingUp, 
  Users, 
  Code2, 
  BookOpen,
  Target,
  Loader2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

interface Repository {
  id: number;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  created_at: string;
  updated_at: string;
  topics?: string[];
  license?: { name: string } | null;
}

interface AiRepositoryAnalyzerProps {
  repository: Repository;
  className?: string;
}

interface RepositoryAnalysis {
  codeQuality: string;
  maturityLevel: string;
  communityEngagement: string;
  useCases: string[];
  learningOpportunities: string[];
  contributionPotential: string;
  technologyStack: string;
  healthScore: number;
  summary: string;
}

export const AiRepositoryAnalyzer: React.FC<AiRepositoryAnalyzerProps> = ({
  repository,
  className = ''
}) => {
  const [analysis, setAnalysis] = useState<RepositoryAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [capabilities, setCapabilities] = useState<any>(null);

  React.useEffect(() => {
    const checkCapabilities = async () => {
      try {
        const caps = await ChromeAiService.checkAiAvailability();
        setCapabilities(caps);
      } catch (err) {
        console.error('Failed to check AI capabilities:', err);
      }
    };
    checkCapabilities();
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!repository) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await ChromeAiService.analyzeRepository(repository);
      setAnalysis(result);
    } catch (err: any) {
      console.error('Analysis failed:', err);
      setError(ChromeAiService.getErrorMessage(err.message) || 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  }, [repository]);

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Attention';
  };

  const [repositoryUrl, setRepositoryUrl] = React.useState('');
  const [isLoadingRepo, setIsLoadingRepo] = React.useState(false);

  const handleAnalyzeByUrl = async () => {
    if (!repositoryUrl.trim()) return;
    
    setIsLoadingRepo(true);
    try {
      // Extract owner/repo from URL
      const match = repositoryUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (!match) {
        setError('Invalid GitHub URL. Please use format: https://github.com/owner/repo');
        return;
      }

      const [, owner, repoName] = match;
      
      // Fetch repository data from GitHub API
      const response = await fetch(`https://api.github.com/repos/${owner}/${repoName}`);
      if (!response.ok) {
        throw new Error('Repository not found');
      }
      
      const repoData = await response.json();
      
      // Analyze the fetched repository
      const result = await ChromeAiService.analyzeRepository(repoData);
      setAnalysis(result);
      setError(null);
    } catch (err: any) {
      console.error('Failed to analyze repository:', err);
      setError(err.message || 'Failed to load repository');
    } finally {
      setIsLoadingRepo(false);
    }
  };

  if (!capabilities) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Checking AI capabilities...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!capabilities.promptApi && !capabilities.writer) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <AlertCircle className="h-8 w-8 mx-auto text-yellow-500" />
            <p className="text-sm text-muted-foreground">
              Chrome AI features are not available in this browser.
            </p>
            <p className="text-xs text-muted-foreground">
              Please use Chrome with AI features enabled for repository analysis.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Repository Analysis
            <Badge variant="secondary" className="ml-auto">
              Powered by Chrome AI
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!analysis && !isAnalyzing && (
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <Sparkles className="h-12 w-12 mx-auto text-primary" />
                <h3 className="font-semibold">Get AI-Powered Insights</h3>
                <p className="text-sm text-muted-foreground">
                  Analyze this repository using Chrome's built-in AI to get detailed insights about 
                  code quality, community engagement, and learning opportunities.
                </p>
              </div>
              
              {repository ? (
                <Button onClick={handleAnalyze} className="w-full">
                  <Brain className="h-4 w-4 mr-2" />
                  Analyze Repository
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Enter GitHub Repository URL</label>
                    <Input
                      type="text"
                      placeholder="https://github.com/owner/repository"
                      value={repositoryUrl}
                      onChange={(e) => setRepositoryUrl(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAnalyzeByUrl()}
                    />
                  </div>
                  <Button 
                    onClick={handleAnalyzeByUrl} 
                    className="w-full"
                    disabled={!repositoryUrl.trim() || isLoadingRepo}
                  >
                    {isLoadingRepo ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Brain className="h-4 w-4 mr-2" />
                    )}
                    {isLoadingRepo ? 'Loading...' : 'Analyze Repository'}
                  </Button>
                </div>
              )}
            </div>
          )}

          {isAnalyzing && (
            <div className="space-y-4">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  AI is analyzing the repository...
                </p>
              </div>
              <Progress value={66} className="w-full" />
            </div>
          )}

          {error && (
            <div className="text-center space-y-2">
              <AlertCircle className="h-8 w-8 mx-auto text-red-500" />
              <p className="text-sm text-red-600">{error}</p>
              <Button onClick={handleAnalyze} variant="outline" size="sm">
                Try Again
              </Button>
            </div>
          )}

          {analysis && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="insights">Insights</TabsTrigger>
                <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                {/* Health Score */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center space-y-2">
                      <div className={`text-3xl font-bold ${getHealthScoreColor(analysis.healthScore)}`}>
                        {analysis.healthScore}/100
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Repository Health Score
                      </div>
                      <Badge variant={analysis.healthScore >= 80 ? "default" : analysis.healthScore >= 60 ? "secondary" : "destructive"}>
                        {getHealthScoreLabel(analysis.healthScore)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2">
                        <Code2 className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">Code Quality</span>
                      </div>
                      <div className="mt-1">
                        <Badge variant="outline">{analysis.codeQuality}</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">Maturity</span>
                      </div>
                      <div className="mt-1">
                        <Badge variant="outline">{analysis.maturityLevel}</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-purple-500" />
                        <span className="text-sm font-medium">Community</span>
                      </div>
                      <div className="mt-1">
                        <Badge variant="outline">{analysis.communityEngagement}</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-orange-500" />
                        <span className="text-sm font-medium">Contribution</span>
                      </div>
                      <div className="mt-1">
                        <Badge variant="outline">{analysis.contributionPotential}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="insights" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">AI Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {analysis.summary}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Technology Stack</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="secondary">{analysis.technologyStack}</Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Use Cases</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {analysis.useCases.map((useCase, index) => (
                        <Badge key={index} variant="outline">
                          {useCase}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="opportunities" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <BookOpen className="h-4 w-4" />
                      Learning Opportunities
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {analysis.learningOpportunities.map((opportunity, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{opportunity}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center space-y-2">
                      <Button 
                        onClick={handleAnalyze} 
                        variant="outline" 
                        size="sm"
                        disabled={isAnalyzing}
                      >
                        {isAnalyzing ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Sparkles className="h-4 w-4 mr-2" />
                        )}
                        Re-analyze Repository
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};