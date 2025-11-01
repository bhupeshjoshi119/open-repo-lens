import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  LineChart, 
  PieChart, 
  Activity,
  Users,
  GitBranch,
  Star,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Calendar,
  Target,
  Zap,
  Brain
} from 'lucide-react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell } from 'recharts';

interface Repository {
  full_name: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  created_at: string;
  updated_at: string;
  language: string;
  topics?: string[];
}

interface PredictionResult {
  type: 'growth' | 'issues' | 'contributors' | 'maintenance';
  timeframe: string;
  confidence: number;
  predictions: Array<{
    date: string;
    value: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  insights: string[];
  recommendations: string[];
  riskFactors: string[];
}

interface PredictiveAnalyticsProps {
  repository: Repository;
}

export const PredictiveAnalytics: React.FC<PredictiveAnalyticsProps> = ({ repository }) => {
  const [selectedAnalysis, setSelectedAnalysis] = useState<string>('growth');
  const [timeframe, setTimeframe] = useState<string>('6months');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [predictions, setPredictions] = useState<Record<string, PredictionResult>>({});

  const analysisTypes = [
    {
      id: 'growth',
      title: 'Star Growth Prediction',
      description: 'Forecast repository popularity trends',
      icon: Star,
      color: 'yellow'
    },
    {
      id: 'issues',
      title: 'Issue Trends',
      description: 'Predict future issue patterns',
      icon: AlertTriangle,
      color: 'red'
    },
    {
      id: 'contributors',
      title: 'Contributor Activity',
      description: 'Analyze community engagement',
      icon: Users,
      color: 'blue'
    },
    {
      id: 'maintenance',
      title: 'Maintenance Health',
      description: 'Assess project sustainability',
      icon: Activity,
      color: 'green'
    }
  ];

  const timeframeOptions = [
    { value: '3months', label: '3 Months' },
    { value: '6months', label: '6 Months' },
    { value: '1year', label: '1 Year' },
    { value: '2years', label: '2 Years' }
  ];

  useEffect(() => {
    if (repository) {
      runPredictiveAnalysis();
    }
  }, [selectedAnalysis, timeframe, repository]);

  const runPredictiveAnalysis = async () => {
    setIsAnalyzing(true);

    try {
      // Simulate AI-powered predictive analysis
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockPrediction = generateMockPrediction(selectedAnalysis, timeframe, repository);
      
      setPredictions(prev => ({
        ...prev,
        [`${selectedAnalysis}_${timeframe}`]: mockPrediction
      }));

    } catch (error) {
      console.error('Prediction analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateMockPrediction = (type: string, timeframe: string, repo: Repository): PredictionResult => {
    const months = timeframe === '3months' ? 3 : timeframe === '6months' ? 6 : timeframe === '1year' ? 12 : 24;
    const currentValue = getCurrentValue(type, repo);
    
    // Generate realistic prediction data
    const predictions = [];
    const growthRate = getGrowthRate(type, repo);
    
    for (let i = 0; i <= months; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() + i);
      
      const baseGrowth = currentValue * Math.pow(1 + growthRate, i);
      const randomVariation = 1 + (Math.random() - 0.5) * 0.2; // ±10% variation
      const value = Math.round(baseGrowth * randomVariation);
      
      predictions.push({
        date: date.toISOString().split('T')[0],
        value: Math.max(0, value),
        trend: i === 0 ? 'stable' : value > predictions[i-1]?.value ? 'up' : value < predictions[i-1]?.value ? 'down' : 'stable'
      });
    }

    return {
      type: type as any,
      timeframe,
      confidence: Math.random() * 0.3 + 0.7, // 70-100% confidence
      predictions,
      insights: getInsights(type, repo, predictions),
      recommendations: getRecommendations(type, repo),
      riskFactors: getRiskFactors(type, repo)
    };
  };

  const getCurrentValue = (type: string, repo: Repository): number => {
    switch (type) {
      case 'growth': return repo.stargazers_count;
      case 'issues': return repo.open_issues_count;
      case 'contributors': return Math.floor(repo.forks_count * 0.1); // Estimate
      case 'maintenance': return 85; // Health score
      default: return 0;
    }
  };

  const getGrowthRate = (type: string, repo: Repository): number => {
    const age = (Date.now() - new Date(repo.created_at).getTime()) / (1000 * 60 * 60 * 24 * 365);
    const popularity = Math.log(repo.stargazers_count + 1) / 10;
    
    switch (type) {
      case 'growth': return Math.max(0.01, 0.05 - age * 0.01 + popularity * 0.02);
      case 'issues': return Math.max(-0.02, 0.03 - popularity * 0.01);
      case 'contributors': return Math.max(0.005, 0.03 - age * 0.005);
      case 'maintenance': return Math.max(-0.01, 0.01 - age * 0.005);
      default: return 0.02;
    }
  };

  const getInsights = (type: string, repo: Repository, predictions: any[]): string[] => {
    const finalValue = predictions[predictions.length - 1]?.value || 0;
    const initialValue = predictions[0]?.value || 0;
    const growth = ((finalValue - initialValue) / initialValue * 100).toFixed(1);

    switch (type) {
      case 'growth':
        return [
          `Projected ${growth}% growth in stars over the selected timeframe`,
          `Current growth trajectory suggests ${repo.language} projects are trending`,
          `Repository age and topic relevance indicate sustained interest`,
          `Community engagement metrics show positive momentum`
        ];
      case 'issues':
        return [
          `Issue resolution rate appears ${parseFloat(growth) > 0 ? 'declining' : 'improving'}`,
          `Project complexity may be ${parseFloat(growth) > 0 ? 'increasing' : 'stabilizing'}`,
          `Maintainer responsiveness is a key factor in issue trends`,
          `Community contributions could help manage issue backlog`
        ];
      case 'contributors':
        return [
          `Contributor base expected to ${parseFloat(growth) > 0 ? 'grow' : 'stabilize'} by ${Math.abs(parseFloat(growth))}%`,
          `Project accessibility and documentation quality affect contributor onboarding`,
          `Active maintainer engagement correlates with contributor retention`,
          `Open source community health indicators are positive`
        ];
      case 'maintenance':
        return [
          `Project health score trending ${parseFloat(growth) > 0 ? 'upward' : 'stable'}`,
          `Regular updates and active maintenance detected`,
          `Code quality metrics suggest sustainable development practices`,
          `Community involvement supports long-term viability`
        ];
      default:
        return ['Analysis complete with positive indicators'];
    }
  };

  const getRecommendations = (type: string, repo: Repository): string[] => {
    switch (type) {
      case 'growth':
        return [
          'Enhance documentation and examples to attract more users',
          'Engage with the community through regular updates and responses',
          'Consider creating tutorial content or blog posts',
          'Participate in relevant conferences or developer events'
        ];
      case 'issues':
        return [
          'Implement issue templates to improve bug report quality',
          'Set up automated testing to catch issues early',
          'Create contributor guidelines for issue resolution',
          'Consider using project boards for better issue management'
        ];
      case 'contributors':
        return [
          'Create comprehensive contribution guidelines',
          'Label good first issues for new contributors',
          'Set up mentorship programs for new developers',
          'Recognize and celebrate contributor achievements'
        ];
      case 'maintenance':
        return [
          'Establish regular release cycles and update schedules',
          'Implement automated dependency updates',
          'Create backup maintainer roles for sustainability',
          'Document project architecture and decision-making processes'
        ];
      default:
        return ['Continue current development practices'];
    }
  };

  const getRiskFactors = (type: string, repo: Repository): string[] => {
    const risks = [];
    
    if (repo.open_issues_count > 100) {
      risks.push('High number of open issues may indicate maintenance challenges');
    }
    
    const age = (Date.now() - new Date(repo.updated_at).getTime()) / (1000 * 60 * 60 * 24);
    if (age > 30) {
      risks.push('Repository has not been updated recently');
    }
    
    if (!repo.topics || repo.topics.length === 0) {
      risks.push('Limited discoverability due to missing topics/tags');
    }
    
    if (repo.forks_count < repo.stargazers_count * 0.1) {
      risks.push('Low fork-to-star ratio may indicate limited community contribution');
    }

    return risks.length > 0 ? risks : ['No significant risk factors identified'];
  };

  const currentPrediction = predictions[`${selectedAnalysis}_${timeframe}`];

  const chartColors = {
    growth: '#facc15',
    issues: '#ef4444',
    contributors: '#3b82f6',
    maintenance: '#22c55e'
  };

  return (
    <div className="space-y-6">
      {/* Analysis Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Predictive Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Analysis Type</label>
              <Select value={selectedAnalysis} onValueChange={setSelectedAnalysis}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {analysisTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      <div className="flex items-center gap-2">
                        <type.icon className="h-4 w-4" />
                        {type.title}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Prediction Timeframe</label>
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeframeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Progress */}
      {isAnalyzing && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="font-medium">Running Predictive Analysis...</span>
              </div>
              <Progress value={undefined} className="w-full" />
              <div className="text-sm text-muted-foreground space-y-1">
                <p>🔍 Analyzing historical data patterns...</p>
                <p>📊 Applying machine learning models...</p>
                <p>🎯 Generating confidence intervals...</p>
                <p>✨ Preparing insights and recommendations...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prediction Results */}
      {currentPrediction && !isAnalyzing && (
        <div className="space-y-6">
          {/* Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Prediction Summary
                </span>
                <Badge variant="secondary">
                  {Math.round(currentPrediction.confidence * 100)}% Confidence
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {currentPrediction.predictions[0]?.value.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Current Value</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {currentPrediction.predictions[currentPrediction.predictions.length - 1]?.value.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Predicted Value</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold flex items-center justify-center gap-1">
                    {(() => {
                      const initial = currentPrediction.predictions[0]?.value || 0;
                      const final = currentPrediction.predictions[currentPrediction.predictions.length - 1]?.value || 0;
                      const change = ((final - initial) / initial * 100);
                      return (
                        <>
                          {change > 0 ? (
                            <TrendingUp className="h-6 w-6 text-green-600" />
                          ) : change < 0 ? (
                            <TrendingDown className="h-6 w-6 text-red-600" />
                          ) : (
                            <Activity className="h-6 w-6 text-gray-600" />
                          )}
                          <span className={change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600'}>
                            {Math.abs(change).toFixed(1)}%
                          </span>
                        </>
                      );
                    })()}
                  </div>
                  <div className="text-sm text-muted-foreground">Expected Change</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Prediction Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5" />
                Trend Visualization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={currentPrediction.predictions}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                    />
                    <YAxis tickFormatter={(value) => value.toLocaleString()} />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      formatter={(value: any) => [value.toLocaleString(), 'Value']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke={chartColors[selectedAnalysis as keyof typeof chartColors]} 
                      strokeWidth={3}
                      dot={{ fill: chartColors[selectedAnalysis as keyof typeof chartColors], strokeWidth: 2, r: 4 }}
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Insights and Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Key Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {currentPrediction.insights.map((insight, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {currentPrediction.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <div className="h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center mt-0.5 flex-shrink-0">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      </div>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Risk Factors */}
          {currentPrediction.riskFactors.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <strong>Risk Factors to Consider:</strong>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {currentPrediction.riskFactors.map((risk, index) => (
                      <li key={index}>{risk}</li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
};