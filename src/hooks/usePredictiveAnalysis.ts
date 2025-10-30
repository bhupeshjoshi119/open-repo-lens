import { useState } from "react";

interface ChartDataPoint {
  period: string;
  value: number;
  predicted?: number;
}

interface KeyMetric {
  label: string;
  value: string;
  trend: 'up' | 'down' | 'stable';
}

interface Insight {
  type: 'positive' | 'negative' | 'neutral';
  title: string;
  description: string;
}

interface PredictionResult {
  chartData?: ChartDataPoint[];
  chartType?: 'line' | 'bar';
  confidence?: number;
  dataPoints?: number;
  keyMetrics?: KeyMetric[];
  insights?: Insight[];
  recommendations?: string[];
}

export const usePredictiveAnalysis = () => {
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runPredictiveAnalysis = async (
    repository: any,
    analysisType: string,
    timeframe: string
  ) => {
    setLoading(true);
    setError(null);
    setPrediction(null);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Fetch repository data from GitHub API
      const repoResponse = await fetch(`https://api.github.com/repos/${repository.full_name}`);
      const repoData = await repoResponse.json();

      if (!repoResponse.ok) {
        throw new Error("Repository not found or inaccessible");
      }

      // Generate prediction based on analysis type
      const result = await generatePrediction(repoData, analysisType, timeframe);
      setPrediction(result);

    } catch (err) {
      console.error("Predictive analysis error:", err);
      setError(err instanceof Error ? err.message : "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return {
    runPredictiveAnalysis,
    prediction,
    loading,
    error
  };
};

const generatePrediction = async (
  repoData: any,
  analysisType: string,
  timeframe: string
): Promise<PredictionResult> => {
  const timeframeMonths = {
    '3months': 3,
    '6months': 6,
    '1year': 12,
    '2years': 24
  }[timeframe] || 6;

  // Generate historical data points
  const historicalPoints = generateHistoricalData(repoData, analysisType, timeframeMonths);
  
  // Generate predictions
  const predictions = generateFuturePredictions(historicalPoints, timeframeMonths);
  
  // Combine historical and predicted data
  const chartData = [...historicalPoints, ...predictions];

  // Calculate confidence based on data consistency
  const confidence = calculateConfidence(historicalPoints);

  // Generate insights
  const insights = generateInsights(repoData, analysisType, historicalPoints, predictions);

  // Generate recommendations
  const recommendations = generateRecommendations(repoData, analysisType, insights);

  // Generate key metrics
  const keyMetrics = generateKeyMetrics(repoData, analysisType, predictions);

  return {
    chartData,
    chartType: analysisType === 'contributors' ? 'bar' : 'line',
    confidence,
    dataPoints: historicalPoints.length,
    keyMetrics,
    insights,
    recommendations
  };
};

const generateHistoricalData = (
  repoData: any,
  analysisType: string,
  months: number
): ChartDataPoint[] => {
  const data: ChartDataPoint[] = [];
  const now = new Date();
  
  for (let i = months; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const period = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    
    let value = 0;
    
    switch (analysisType) {
      case 'growth':
        // Simulate star growth with some randomness
        const baseStars = repoData.stargazers_count || 0;
        const monthlyGrowth = Math.max(1, baseStars * 0.02 * (1 + Math.random() * 0.5));
        value = Math.round(baseStars - (monthlyGrowth * i) + (Math.random() * monthlyGrowth * 0.3));
        break;
        
      case 'issues':
        // Simulate issue trends
        const baseIssues = repoData.open_issues_count || 0;
        value = Math.round(baseIssues + (Math.random() - 0.5) * 20);
        break;
        
      case 'contributors':
        // Simulate contributor activity
        value = Math.round(5 + Math.random() * 15);
        break;
        
      case 'maintenance':
        // Simulate maintenance health score
        value = Math.round(60 + Math.random() * 30);
        break;
    }
    
    data.push({ period, value: Math.max(0, value) });
  }
  
  return data;
};

const generateFuturePredictions = (
  historical: ChartDataPoint[],
  months: number
): ChartDataPoint[] => {
  const predictions: ChartDataPoint[] = [];
  const now = new Date();
  
  // Calculate trend from historical data
  const recentValues = historical.slice(-3).map(d => d.value);
  const trend = recentValues.length > 1 
    ? (recentValues[recentValues.length - 1] - recentValues[0]) / recentValues.length
    : 0;
  
  const lastValue = historical[historical.length - 1]?.value || 0;
  
  for (let i = 1; i <= Math.min(months, 6); i++) {
    const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const period = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    
    // Apply trend with some randomness and decay
    const trendDecay = Math.pow(0.9, i); // Trend becomes less reliable over time
    const predicted = Math.round(lastValue + (trend * i * trendDecay) + (Math.random() - 0.5) * 10);
    
    predictions.push({ 
      period, 
      value: lastValue, // Keep historical value for continuity
      predicted: Math.max(0, predicted)
    });
  }
  
  return predictions;
};

const calculateConfidence = (historical: ChartDataPoint[]): number => {
  if (historical.length < 3) return 0.3;
  
  // Calculate variance in the data
  const values = historical.map(d => d.value);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
  const coefficient = variance / mean;
  
  // Lower coefficient of variation = higher confidence
  return Math.max(0.4, Math.min(0.95, 1 - coefficient / 100));
};

const generateInsights = (
  repoData: any,
  analysisType: string,
  historical: ChartDataPoint[],
  predictions: ChartDataPoint[]
): Insight[] => {
  const insights: Insight[] = [];
  
  // Analyze trend
  const recentTrend = historical.slice(-3);
  const isIncreasing = recentTrend[recentTrend.length - 1].value > recentTrend[0].value;
  const isStable = Math.abs(recentTrend[recentTrend.length - 1].value - recentTrend[0].value) < 5;
  
  switch (analysisType) {
    case 'growth':
      if (isIncreasing) {
        insights.push({
          type: 'positive',
          title: 'Positive Growth Trend',
          description: 'Repository shows consistent growth in stars and engagement'
        });
      } else if (isStable) {
        insights.push({
          type: 'neutral',
          title: 'Stable Growth',
          description: 'Growth has plateaued, consider new marketing strategies'
        });
      } else {
        insights.push({
          type: 'negative',
          title: 'Declining Interest',
          description: 'Recent decline in stars suggests need for renewed engagement'
        });
      }
      break;
      
    case 'issues':
      const avgIssues = historical.reduce((a, b) => a + b.value, 0) / historical.length;
      if (avgIssues > 50) {
        insights.push({
          type: 'negative',
          title: 'High Issue Volume',
          description: 'Consider prioritizing issue resolution and community management'
        });
      } else {
        insights.push({
          type: 'positive',
          title: 'Manageable Issue Load',
          description: 'Issue volume is within reasonable bounds for project size'
        });
      }
      break;
      
    case 'contributors':
      insights.push({
        type: 'neutral',
        title: 'Contributor Activity',
        description: 'Regular contributor engagement indicates healthy project community'
      });
      break;
      
    case 'maintenance':
      const avgHealth = historical.reduce((a, b) => a + b.value, 0) / historical.length;
      if (avgHealth > 80) {
        insights.push({
          type: 'positive',
          title: 'Excellent Maintenance',
          description: 'Project shows strong maintenance practices and code quality'
        });
      } else if (avgHealth > 60) {
        insights.push({
          type: 'neutral',
          title: 'Good Maintenance',
          description: 'Maintenance is adequate but has room for improvement'
        });
      } else {
        insights.push({
          type: 'negative',
          title: 'Maintenance Concerns',
          description: 'Consider improving documentation, testing, and code review processes'
        });
      }
      break;
  }
  
  return insights;
};

const generateRecommendations = (
  repoData: any,
  analysisType: string,
  insights: Insight[]
): string[] => {
  const recommendations: string[] = [];
  
  switch (analysisType) {
    case 'growth':
      recommendations.push(
        "Increase social media presence and community engagement",
        "Consider writing technical blog posts about the project",
        "Participate in relevant conferences and meetups",
        "Improve documentation and onboarding experience"
      );
      break;
      
    case 'issues':
      recommendations.push(
        "Implement issue templates to improve quality",
        "Set up automated labeling and triage processes",
        "Create contributor guidelines for issue resolution",
        "Consider using project boards for better organization"
      );
      break;
      
    case 'contributors':
      recommendations.push(
        "Create good first issue labels for newcomers",
        "Implement mentorship programs for new contributors",
        "Recognize and celebrate contributor achievements",
        "Improve code review processes and feedback quality"
      );
      break;
      
    case 'maintenance':
      recommendations.push(
        "Set up automated testing and CI/CD pipelines",
        "Implement code quality checks and linting",
        "Create comprehensive documentation and examples",
        "Establish regular release schedules and changelogs"
      );
      break;
  }
  
  return recommendations;
};

const generateKeyMetrics = (
  repoData: any,
  analysisType: string,
  predictions: ChartDataPoint[]
): KeyMetric[] => {
  const metrics: KeyMetric[] = [];
  
  const lastPrediction = predictions[predictions.length - 1];
  const currentValue = predictions[0]?.value || 0;
  const predictedValue = lastPrediction?.predicted || currentValue;
  
  const change = predictedValue - currentValue;
  const changePercent = currentValue > 0 ? Math.round((change / currentValue) * 100) : 0;
  
  switch (analysisType) {
    case 'growth':
      metrics.push(
        {
          label: 'Predicted Stars',
          value: predictedValue.toLocaleString(),
          trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
        },
        {
          label: 'Growth Rate',
          value: `${changePercent > 0 ? '+' : ''}${changePercent}%`,
          trend: changePercent > 0 ? 'up' : changePercent < 0 ? 'down' : 'stable'
        }
      );
      break;
      
    case 'issues':
      metrics.push(
        {
          label: 'Predicted Issues',
          value: predictedValue.toString(),
          trend: change < 0 ? 'up' : change > 0 ? 'down' : 'stable' // Fewer issues is better
        },
        {
          label: 'Issue Trend',
          value: `${change > 0 ? '+' : ''}${change}`,
          trend: change < 0 ? 'up' : change > 0 ? 'down' : 'stable'
        }
      );
      break;
      
    case 'contributors':
      metrics.push(
        {
          label: 'Active Contributors',
          value: predictedValue.toString(),
          trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
        }
      );
      break;
      
    case 'maintenance':
      metrics.push(
        {
          label: 'Health Score',
          value: `${predictedValue}/100`,
          trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
        }
      );
      break;
  }
  
  return metrics;
};