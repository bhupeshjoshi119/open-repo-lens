import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  Users,
  GitBranch,
  Star,
  Bug,
  Clock,
  Code2,
  Activity,
  AlertCircle,
  CheckCircle2,
  BarChart3,
  PieChart,
  Calendar,
  Target,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
} from "recharts";

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

interface AnalyticsDashboardProps {
  repository: Repository;
  analysis: string | null;
  className?: string;
}

export const AnalyticsDashboard = ({
  repository,
  analysis,
  className,
}: AnalyticsDashboardProps) => {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    // Calculate repository metrics
    const calculateMetrics = () => {
      const repoAge = Math.floor(
        (Date.now() - new Date(repository.created_at).getTime()) /
          (1000 * 60 * 60 * 24)
      );
      const lastUpdate = Math.floor(
        (Date.now() - new Date(repository.updated_at).getTime()) /
          (1000 * 60 * 60 * 24)
      );

      // Extract health score from analysis
      const healthScoreMatch = analysis?.match(/health score[:\s]+(\d+)/i);
      const healthScore = healthScoreMatch
        ? parseInt(healthScoreMatch[1])
        : calculateHealthScore();

      // Generate trend data (mock data for demonstration)
      const trendData = generateTrendData();
      const languageData = generateLanguageData();
      const activityData = generateActivityData();

      return {
        repoAge,
        lastUpdate,
        healthScore,
        trendData,
        languageData,
        activityData,
        engagement: calculateEngagement(),
        quality: calculateQuality(),
        maintenance: calculateMaintenance(),
      };
    };

    setMetrics(calculateMetrics());
  }, [repository, analysis]);

  const calculateHealthScore = (): number => {
    let score = 0;

    // Stars factor (0-25 points)
    if (repository.stargazers_count > 10000) score += 25;
    else if (repository.stargazers_count > 1000) score += 20;
    else if (repository.stargazers_count > 100) score += 15;
    else if (repository.stargazers_count > 10) score += 10;
    else score += 5;

    // Activity factor (0-25 points)
    const daysSinceUpdate = Math.floor(
      (Date.now() - new Date(repository.updated_at).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    if (daysSinceUpdate < 7) score += 25;
    else if (daysSinceUpdate < 30) score += 20;
    else if (daysSinceUpdate < 90) score += 15;
    else if (daysSinceUpdate < 365) score += 10;
    else score += 5;

    // Issues factor (0-25 points)
    const issueRatio =
      repository.open_issues_count / Math.max(repository.stargazers_count, 1);
    if (issueRatio < 0.01) score += 25;
    else if (issueRatio < 0.05) score += 20;
    else if (issueRatio < 0.1) score += 15;
    else if (issueRatio < 0.2) score += 10;
    else score += 5;

    // Documentation factor (0-25 points)
    if (repository.description) score += 10;
    if (repository.license) score += 10;
    if (repository.topics && repository.topics.length > 0) score += 5;

    return Math.min(100, score);
  };

  const calculateEngagement = () => {
    const forkRatio =
      repository.forks_count / Math.max(repository.stargazers_count, 1);
    return {
      score: Math.min(
        100,
        Math.round(forkRatio * 100 + repository.stargazers_count / 100)
      ),
      trend: forkRatio > 0.1 ? "up" : "stable",
      level: forkRatio > 0.2 ? "High" : forkRatio > 0.1 ? "Medium" : "Low",
    };
  };

  const calculateQuality = () => {
    const hasLicense = !!repository.license;
    const hasDescription = !!repository.description;
    const hasTopics = repository.topics && repository.topics.length > 0;

    let score = 0;
    if (hasLicense) score += 30;
    if (hasDescription) score += 30;
    if (hasTopics) score += 20;
    if (repository.stargazers_count > 100) score += 20;

    return {
      score: Math.min(100, score),
      factors: { hasLicense, hasDescription, hasTopics },
    };
  };

  const calculateMaintenance = () => {
    const daysSinceUpdate = Math.floor(
      (Date.now() - new Date(repository.updated_at).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    let score = 100;

    if (daysSinceUpdate > 365) score = 20;
    else if (daysSinceUpdate > 180) score = 40;
    else if (daysSinceUpdate > 90) score = 60;
    else if (daysSinceUpdate > 30) score = 80;

    return {
      score,
      lastUpdate: daysSinceUpdate,
      status: score > 80 ? "Active" : score > 60 ? "Moderate" : "Inactive",
    };
  };

  const generateTrendData = () => {
    const data = [];
    const baseStars = repository.stargazers_count;

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);

      // Simulate growth trend
      const growth = Math.max(
        0,
        baseStars - baseStars * 0.1 * i + Math.random() * baseStars * 0.05
      );

      data.push({
        month: date.toLocaleDateString("en-US", { month: "short" }),
        stars: Math.round(growth),
        forks: Math.round(growth * 0.1),
        issues: Math.round(Math.random() * 50 + 10),
      });
    }

    return data;
  };

  const generateLanguageData = () => {
    const languages = [
      {
        name: repository.language || "JavaScript",
        value: 65,
        color: "#3b82f6",
      },
      { name: "CSS", value: 20, color: "#10b981" },
      { name: "HTML", value: 10, color: "#f59e0b" },
      { name: "Other", value: 5, color: "#6b7280" },
    ];

    return languages;
  };

  const generateActivityData = () => {
    const data = [];

    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      data.push({
        date: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        commits: Math.round(Math.random() * 10),
        issues: Math.round(Math.random() * 5),
        prs: Math.round(Math.random() * 3),
      });
    }

    return data.slice(-7); // Last 7 days
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "trends", label: "Trends", icon: TrendingUp },
    { id: "quality", label: "Quality", icon: Target },
    { id: "activity", label: "Activity", icon: Activity },
  ];

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-muted p-1 rounded-lg">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab(tab.id)}
            className="flex-1"
          >
            <tab.icon className="w-4 h-4 mr-2" />
            {tab.label}
          </Button>
        ))}
      </div>

      <ScrollArea className="h-[500px]">
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Health Score */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Repository Health</h3>
                <Badge
                  variant={
                    metrics.healthScore >= 80
                      ? "default"
                      : metrics.healthScore >= 60
                      ? "secondary"
                      : "destructive"
                  }
                >
                  {metrics.healthScore}/100
                </Badge>
              </div>
              <Progress value={metrics.healthScore} className="h-3 mb-2" />
              <p className="text-sm text-muted-foreground">
                {metrics.healthScore >= 80
                  ? "Excellent repository health"
                  : metrics.healthScore >= 60
                  ? "Good repository health"
                  : "Repository needs attention"}
              </p>
            </Card>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium">Stars</span>
                </div>
                <div className="text-2xl font-bold">
                  {repository.stargazers_count.toLocaleString()}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingUp className="w-3 h-3" />
                  Growing
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <GitBranch className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">Forks</span>
                </div>
                <div className="text-2xl font-bold">
                  {repository.forks_count.toLocaleString()}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingUp className="w-3 h-3" />
                  Active
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Bug className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium">Issues</span>
                </div>
                <div className="text-2xl font-bold">
                  {repository.open_issues_count}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <AlertCircle className="w-3 h-3" />
                  Open
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium">Updated</span>
                </div>
                <div className="text-2xl font-bold">{metrics.lastUpdate}d</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <CheckCircle2 className="w-3 h-3" />
                  Recent
                </div>
              </Card>
            </div>

            {/* Engagement Score */}
            <Card className="p-4">
              <h4 className="font-medium mb-3">Community Engagement</h4>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Engagement Level</span>
                <Badge variant="outline">{metrics.engagement.level}</Badge>
              </div>
              <Progress value={metrics.engagement.score} className="h-2" />
            </Card>
          </div>
        )}

        {activeTab === "trends" && (
          <div className="space-y-6">
            {/* Growth Trend Chart */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Growth Trends</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metrics.trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="stars"
                      stroke="#3b82f6"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="forks"
                      stroke="#10b981"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Language Distribution */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                Language Distribution
              </h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Tooltip />
                    <RechartsPieChart
                      data={metrics.languageData}
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                    >
                      {metrics.languageData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </RechartsPieChart>
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {metrics.languageData.map((lang: any) => (
                  <div key={lang.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: lang.color }}
                    />
                    <span className="text-sm">
                      {lang.name} ({lang.value}%)
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {activeTab === "quality" && (
          <div className="space-y-6">
            {/* Quality Score */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Code Quality Score</h3>
              <div className="flex items-center justify-between mb-4">
                <span>Overall Quality</span>
                <Badge
                  variant={
                    metrics.quality.score >= 80 ? "default" : "secondary"
                  }
                >
                  {metrics.quality.score}/100
                </Badge>
              </div>
              <Progress value={metrics.quality.score} className="h-3" />
            </Card>

            {/* Quality Factors */}
            <Card className="p-6">
              <h4 className="font-medium mb-4">Quality Factors</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      className={`w-4 h-4 ${
                        metrics.quality.factors.hasLicense
                          ? "text-green-500"
                          : "text-gray-400"
                      }`}
                    />
                    <span className="text-sm">License</span>
                  </div>
                  <Badge
                    variant={
                      metrics.quality.factors.hasLicense
                        ? "default"
                        : "secondary"
                    }
                  >
                    {metrics.quality.factors.hasLicense ? "Present" : "Missing"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      className={`w-4 h-4 ${
                        metrics.quality.factors.hasDescription
                          ? "text-green-500"
                          : "text-gray-400"
                      }`}
                    />
                    <span className="text-sm">Description</span>
                  </div>
                  <Badge
                    variant={
                      metrics.quality.factors.hasDescription
                        ? "default"
                        : "secondary"
                    }
                  >
                    {metrics.quality.factors.hasDescription
                      ? "Present"
                      : "Missing"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      className={`w-4 h-4 ${
                        metrics.quality.factors.hasTopics
                          ? "text-green-500"
                          : "text-gray-400"
                      }`}
                    />
                    <span className="text-sm">Topics</span>
                  </div>
                  <Badge
                    variant={
                      metrics.quality.factors.hasTopics
                        ? "default"
                        : "secondary"
                    }
                  >
                    {metrics.quality.factors.hasTopics ? "Present" : "Missing"}
                  </Badge>
                </div>
              </div>
            </Card>

            {/* Maintenance Status */}
            <Card className="p-6">
              <h4 className="font-medium mb-4">Maintenance Status</h4>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Maintenance Level</span>
                <Badge
                  variant={
                    metrics.maintenance.score >= 80 ? "default" : "secondary"
                  }
                >
                  {metrics.maintenance.status}
                </Badge>
              </div>
              <Progress
                value={metrics.maintenance.score}
                className="h-2 mb-2"
              />
              <p className="text-xs text-muted-foreground">
                Last updated {metrics.maintenance.lastUpdate} days ago
              </p>
            </Card>
          </div>
        )}

        {activeTab === "activity" && (
          <div className="space-y-6">
            {/* Recent Activity Chart */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                Recent Activity (Last 7 Days)
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics.activityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="commits" fill="#3b82f6" />
                    <Bar dataKey="issues" fill="#ef4444" />
                    <Bar dataKey="prs" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded" />
                  <span className="text-sm">Commits</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded" />
                  <span className="text-sm">Issues</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded" />
                  <span className="text-sm">Pull Requests</span>
                </div>
              </div>
            </Card>

            {/* Activity Summary */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-500">
                  {metrics.activityData.reduce(
                    (sum: number, day: any) => sum + day.commits,
                    0
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Commits
                </div>
              </Card>

              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-red-500">
                  {metrics.activityData.reduce(
                    (sum: number, day: any) => sum + day.issues,
                    0
                  )}
                </div>
                <div className="text-sm text-muted-foreground">New Issues</div>
              </Card>

              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-green-500">
                  {metrics.activityData.reduce(
                    (sum: number, day: any) => sum + day.prs,
                    0
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  Pull Requests
                </div>
              </Card>
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
