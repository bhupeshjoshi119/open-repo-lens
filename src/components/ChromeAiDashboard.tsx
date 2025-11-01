import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Chrome,
  Brain,
  Zap,
  Shield,
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Sparkles,
  TrendingUp,
  Users,
  Globe,
  FileText,
  PenTool,
  MessageSquare,
  Image as ImageIcon,
  BarChart3,
  Settings,
  Download,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import ChromeAiService from '@/services/chromeAiService';
import { AiCapabilities } from '@/types/chromeAi';
import { useToast } from '@/hooks/use-toast';

interface UsageStats {
  totalOperations: number;
  successRate: number;
  averageProcessingTime: number;
  mostUsedFeature: string;
  dailyUsage: Array<{
    date: string;
    operations: number;
  }>;
}

export const ChromeAiDashboard: React.FC = () => {
  const [capabilities, setCapabilities] = useState<AiCapabilities | null>(null);
  const [loading, setLoading] = useState(true);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const caps = await ChromeAiService.checkAiAvailability();
      setCapabilities(caps);
      
      // Load usage statistics (mock data for now)
      setUsageStats({
        totalOperations: 1247,
        successRate: 94.2,
        averageProcessingTime: 1.8,
        mostUsedFeature: 'Text Summarization',
        dailyUsage: generateMockUsageData()
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast({
        title: "Dashboard Error",
        description: "Failed to load Chrome AI dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateMockUsageData = () => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        operations: Math.floor(Math.random() * 50) + 10
      });
    }
    return data;
  };

  const aiFeatures = [
    {
      id: 'promptApi',
      name: 'Prompt API',
      description: 'General-purpose AI text processing',
      icon: MessageSquare,
      available: capabilities?.promptApi || false,
      usageCount: 423,
      link: '/ai-tools'
    },
    {
      id: 'summarizer',
      name: 'Text Summarizer',
      description: 'Intelligent text summarization',
      icon: FileText,
      available: capabilities?.summarizer || false,
      usageCount: 312,
      link: '/ai-tools'
    },
    {
      id: 'writer',
      name: 'Content Writer',
      description: 'AI-powered content generation',
      icon: PenTool,
      available: capabilities?.writer || false,
      usageCount: 189,
      link: '/ai-tools'
    },
    {
      id: 'rewriter',
      name: 'Text Rewriter',
      description: 'Improve and rephrase text',
      icon: RefreshCw,
      available: capabilities?.rewriter || false,
      usageCount: 267,
      link: '/ai-tools'
    },
    {
      id: 'proofreader',
      name: 'Proofreader',
      description: 'Grammar and style checking',
      icon: Sparkles,
      available: capabilities?.proofreader || false,
      usageCount: 156,
      link: '/proofreading'
    }
  ];

  const getStatusIcon = (available: boolean) => {
    return available ? (
      <CheckCircle2 className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getOverallHealthScore = () => {
    if (!capabilities) return 0;
    const availableFeatures = aiFeatures.filter(f => f.available).length;
    return Math.round((availableFeatures / aiFeatures.length) * 100);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Chrome className="h-8 w-8 text-primary" />
            Chrome AI Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitor and manage your Chrome AI capabilities and usage
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadDashboardData} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.open('chrome://flags', '_blank')}
            className="gap-2"
          >
            <Settings className="h-4 w-4" />
            Chrome Flags
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="usage">Usage Stats</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Health Score</p>
                    <p className="text-2xl font-bold">{getOverallHealthScore()}%</p>
                  </div>
                  <Activity className="h-8 w-8 text-green-500" />
                </div>
                <Progress value={getOverallHealthScore()} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Available Features</p>
                    <p className="text-2xl font-bold">
                      {aiFeatures.filter(f => f.available).length}/{aiFeatures.length}
                    </p>
                  </div>
                  <Brain className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Operations</p>
                    <p className="text-2xl font-bold">{usageStats?.totalOperations.toLocaleString()}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                    <p className="text-2xl font-bold">{usageStats?.successRate}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link to="/ai-tools">
                  <Button className="w-full gap-2 h-16">
                    <Brain className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">AI Tools Studio</div>
                      <div className="text-xs opacity-80">Text processing tools</div>
                    </div>
                  </Button>
                </Link>
                
                <Link to="/proofreading">
                  <Button variant="outline" className="w-full gap-2 h-16">
                    <Sparkles className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">Proofreading Studio</div>
                      <div className="text-xs opacity-80">Grammar & style checking</div>
                    </div>
                  </Button>
                </Link>
                
                <Link to="/chrome-ai-demo">
                  <Button variant="outline" className="w-full gap-2 h-16">
                    <Chrome className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">Feature Demo</div>
                      <div className="text-xs opacity-80">Explore all capabilities</div>
                    </div>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Chrome AI APIs</span>
                <Badge variant={capabilities ? "default" : "destructive"}>
                  {capabilities ? "Available" : "Unavailable"}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Local Processing</span>
                <Badge variant="default">Active</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Privacy Protection</span>
                <Badge variant="default">Enabled</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Model Status</span>
                <Badge variant={capabilities ? "default" : "secondary"}>
                  {capabilities ? "Gemini Nano Ready" : "Not Available"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aiFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.id} className={`transition-all duration-200 ${feature.available ? 'hover:shadow-lg' : 'opacity-60'}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5" />
                        <CardTitle className="text-base">{feature.name}</CardTitle>
                      </div>
                      {getStatusIcon(feature.available)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Usage Count:</span>
                      <span className="font-medium">{feature.usageCount}</span>
                    </div>
                    
                    <Link to={feature.link}>
                      <Button 
                        variant={feature.available ? "default" : "secondary"} 
                        size="sm" 
                        className="w-full"
                        disabled={!feature.available}
                      >
                        {feature.available ? "Use Feature" : "Unavailable"}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Feature Availability Alert */}
          {aiFeatures.filter(f => !f.available).length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <strong>Some features are unavailable:</strong>
                  <p className="text-sm">
                    To enable all Chrome AI features, please ensure you're using Chrome with AI capabilities enabled. 
                    Visit chrome://flags and enable the Gemini Nano flags, then restart your browser.
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          {usageStats && (
            <>
              {/* Usage Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Most Used Feature</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{usageStats.mostUsedFeature}</p>
                    <p className="text-sm text-muted-foreground">This week</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Avg. Processing Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{usageStats.averageProcessingTime}s</p>
                    <p className="text-sm text-muted-foreground">Per operation</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Daily Average</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {Math.round(usageStats.dailyUsage.reduce((sum, day) => sum + day.operations, 0) / usageStats.dailyUsage.length)}
                    </p>
                    <p className="text-sm text-muted-foreground">Operations per day</p>
                  </CardContent>
                </Card>
              </div>

              {/* Daily Usage Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Daily Usage (Last 7 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {usageStats.dailyUsage.map((day, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="w-20 text-sm text-muted-foreground">
                          {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </div>
                        <div className="flex-1">
                          <Progress value={(day.operations / 50) * 100} className="h-2" />
                        </div>
                        <div className="w-12 text-sm font-medium text-right">
                          {day.operations}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Chrome AI Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Chrome AI settings are managed through Chrome flags. Changes require a browser restart to take effect.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Prompt API for Gemini Nano</h4>
                    <p className="text-sm text-muted-foreground">Enable general AI text processing</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open('chrome://flags/#prompt-api-for-gemini-nano', '_blank')}
                    className="gap-2"
                  >
                    Configure
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Summarization API</h4>
                    <p className="text-sm text-muted-foreground">Enable text summarization features</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open('chrome://flags/#summarization-api-for-gemini-nano', '_blank')}
                    className="gap-2"
                  >
                    Configure
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Writer API</h4>
                    <p className="text-sm text-muted-foreground">Enable content generation features</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open('chrome://flags/#writer-api-for-gemini-nano', '_blank')}
                    className="gap-2"
                  >
                    Configure
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Proofreader API</h4>
                    <p className="text-sm text-muted-foreground">Enable grammar and style checking</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open('chrome://flags/#proofreader-api-for-gemini-nano', '_blank')}
                    className="gap-2"
                  >
                    Configure
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Privacy & Security</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>✓ All AI processing happens locally in your browser</p>
                  <p>✓ No data is sent to external servers</p>
                  <p>✓ Your text and files never leave your device</p>
                  <p>✓ No API keys or accounts required</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};