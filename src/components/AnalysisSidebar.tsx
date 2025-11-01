import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CustomScrollArea } from "@/components/ui/custom-scrollbar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AnalyticsDashboard } from "./AnalyticsDashboard";
import { 
  FileText, 
  BarChart3, 
  GitBranch, 
  Bug, 
  Star, 
  Eye,
  Download,
  Sparkles,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Code2,
  PieChart
} from "lucide-react";
import { cn } from "@/lib/utils";

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

interface AnalysisSidebarProps {
  repository: Repository;
  analysis: string | null;
  onGenerateReport: () => void;
  onComprehensiveAnalysis: () => void;
  onImageAnalysis: () => void;
  onPredictiveAnalysis: () => void;
  loading: boolean;
  className?: string;
}

// Calculate repository health score based on various metrics
const calculateHealthScore = (repo: Repository): number => {
  let score = 0;
  
  // Activity score (40 points max)
  const daysSinceUpdate = Math.floor((Date.now() - new Date(repo.updated_at).getTime()) / (1000 * 60 * 60 * 24));
  if (daysSinceUpdate <= 7) score += 40;
  else if (daysSinceUpdate <= 30) score += 30;
  else if (daysSinceUpdate <= 90) score += 20;
  else if (daysSinceUpdate <= 365) score += 10;
  
  // Popularity score (30 points max)
  if (repo.stargazers_count >= 1000) score += 30;
  else if (repo.stargazers_count >= 100) score += 25;
  else if (repo.stargazers_count >= 10) score += 15;
  else if (repo.stargazers_count >= 1) score += 5;
  
  // Community engagement (20 points max)
  if (repo.forks_count >= 100) score += 20;
  else if (repo.forks_count >= 10) score += 15;
  else if (repo.forks_count >= 1) score += 10;
  
  // Issue management (10 points max)
  const issueRatio = repo.open_issues_count / Math.max(repo.stargazers_count, 1);
  if (issueRatio <= 0.1) score += 10;
  else if (issueRatio <= 0.3) score += 7;
  else if (issueRatio <= 0.5) score += 5;
  
  return Math.min(100, Math.max(0, score));
};

export const AnalysisSidebar = ({
  repository,
  analysis,
  onGenerateReport,
  onComprehensiveAnalysis,
  onImageAnalysis,
  onPredictiveAnalysis,
  loading,
  className
}: AnalysisSidebarProps) => {
  const [activeSection, setActiveSection] = useState<string>("overview");
  const [dashboardOpen, setDashboardOpen] = useState(false);

  // Calculate repository metrics
  const repoAge = Math.floor((Date.now() - new Date(repository.created_at).getTime()) / (1000 * 60 * 60 * 24));
  const lastUpdate = Math.floor((Date.now() - new Date(repository.updated_at).getTime()) / (1000 * 60 * 60 * 24));
  
  // Extract health score from analysis if available
  const healthScoreMatch = analysis?.match(/health score[:\s]+(\d+)/i);
  const healthScore = healthScoreMatch ? parseInt(healthScoreMatch[1]) : null;

  const sidebarSections = [
    {
      id: "overview",
      title: "Overview",
      icon: Eye,
      items: [
        { label: "Repository Age", value: `${repoAge} days`, icon: Clock },
        { label: "Last Updated", value: `${lastUpdate} days ago`, icon: Clock },
        { label: "Language", value: repository.language || "N/A", icon: Code2 },
        { label: "License", value: repository.license?.name || "None", icon: FileText }
      ]
    },
    {
      id: "metrics",
      title: "Key Metrics",
      icon: BarChart3,
      items: [
        { label: "Stars", value: repository.stargazers_count.toLocaleString(), icon: Star },
        { label: "Forks", value: repository.forks_count.toLocaleString(), icon: GitBranch },
        { label: "Open Issues", value: repository.open_issues_count.toLocaleString(), icon: Bug },
        { label: "Topics", value: repository.topics?.length.toString() || "0", icon: FileText }
      ]
    },
    {
      id: "analysis",
      title: "AI Analysis",
      icon: Sparkles,
      items: analysis ? [
        { label: "Status", value: "Complete", icon: CheckCircle2 },
        ...(healthScore ? [{ label: "Health Score", value: `${healthScore}/100`, icon: TrendingUp }] : []),
        { label: "Report Ready", value: "Yes", icon: FileText }
      ] : [
        { label: "Status", value: "Pending", icon: AlertCircle },
        { label: "Report Ready", value: "No", icon: FileText }
      ]
    }
  ];

  const quickActions = [
    {
      title: "Generate Analysis",
      description: "AI-powered repository insights",
      icon: Sparkles,
      action: onComprehensiveAnalysis,
      disabled: loading,
      variant: "default" as const,
      primary: true
    },
    {
      title: "Download PDF Report",
      description: "Export comprehensive analysis",
      icon: Download,
      action: onGenerateReport,
      disabled: !analysis || loading,
      variant: "outline" as const
    },
    {
      title: "Analytics Dashboard",
      description: "Interactive metrics & charts",
      icon: PieChart,
      action: () => setDashboardOpen(true),
      disabled: loading,
      variant: "outline" as const
    },
    {
      title: "Image Analysis",
      description: "Analyze repository visuals",
      icon: Eye,
      action: onImageAnalysis,
      disabled: loading,
      variant: "outline" as const
    },
    {
      title: "Predictive Insights",
      description: "Future trends & forecasts",
      icon: TrendingUp,
      action: onPredictiveAnalysis,
      disabled: loading,
      variant: "outline" as const
    }
  ];

  return (
    <div className={cn("w-80 border-r border-border bg-muted/30", className)}>
      <div className="p-4 border-b border-border bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-lg">Repository Analysis</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          AI-powered insights and comprehensive analysis tools
        </p>
      </div>

      <CustomScrollArea className="flex-1 h-[calc(100vh-200px)]">
        <div className="p-4 space-y-6">
          {/* Quick Actions */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
              Quick Actions
            </h4>
            <div className="space-y-2">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant}
                  className={cn(
                    "w-full justify-start h-auto p-4 text-left transition-all duration-200 group",
                    action.primary 
                      ? "bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-md hover:shadow-lg focus:ring-2 focus:ring-primary/20 focus:ring-offset-2" 
                      : "hover:bg-accent/50 border-border/50 hover:border-border focus:ring-2 focus:ring-accent/20 focus:ring-offset-2"
                  )}
                  onClick={action.action}
                  disabled={action.disabled}
                  aria-label={`${action.title}: ${action.description}`}
                >
                  <action.icon className={cn(
                    "w-5 h-5 mr-3 shrink-0 transition-transform duration-200",
                    "group-hover:scale-110",
                    action.primary ? "text-white" : "text-muted-foreground group-hover:text-foreground"
                  )} />
                  <div className="flex-1 min-w-0">
                    <div className={cn(
                      "font-medium text-sm transition-colors duration-200",
                      action.primary ? "text-white" : "text-foreground"
                    )}>
                      {action.title}
                    </div>
                    <div className={cn(
                      "text-xs truncate transition-colors duration-200",
                      action.primary ? "text-white/80" : "text-muted-foreground group-hover:text-muted-foreground/80"
                    )}>
                      {action.description}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Repository Sections */}
          {sidebarSections.map((section, sectionIndex) => (
            <div key={section.id} className="space-y-3">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start p-2 h-auto",
                  activeSection === section.id && "bg-accent"
                )}
                onClick={() => setActiveSection(activeSection === section.id ? "" : section.id)}
              >
                <section.icon className="w-4 h-4 mr-2" />
                <span className="font-medium">{section.title}</span>
              </Button>

              {activeSection === section.id && (
                <Card className="p-3 bg-background/50">
                  <div className="space-y-2">
                    {section.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <item.icon className="w-3 h-3 text-muted-foreground" />
                          <span className="text-muted-foreground">{item.label}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {item.value}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {sectionIndex < sidebarSections.length - 1 && <Separator />}
            </div>
          ))}

          {/* Repository Health Score */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
              Repository Health
            </h4>
            <Card className="p-4 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {healthScore || calculateHealthScore(repository)}
                </div>
                <div className="text-sm text-muted-foreground mb-3">
                  Health Score
                </div>
                <div className="w-full bg-muted rounded-full h-3 mb-3">
                  <div 
                    className="bg-gradient-to-r from-primary to-accent h-3 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${healthScore || calculateHealthScore(repository)}%` }}
                  />
                </div>
                <div className="text-xs font-medium">
                  {(healthScore || calculateHealthScore(repository)) >= 80 ? "🌟 Excellent" : 
                   (healthScore || calculateHealthScore(repository)) >= 60 ? "✅ Good" : 
                   (healthScore || calculateHealthScore(repository)) >= 40 ? "⚠️ Fair" : "🔧 Needs Attention"}
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  Based on activity, issues, and community engagement
                </div>
              </div>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
              Quick Insights
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <Card className="p-3 text-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {Math.round((repository.stargazers_count / Math.max(repoAge, 1)) * 365)}
                </div>
                <div className="text-xs text-blue-700 dark:text-blue-300">Stars/Year</div>
              </Card>
              <Card className="p-3 text-center bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
                <div className="text-lg font-bold text-green-600 dark:text-green-400">
                  {repository.open_issues_count === 0 ? "0%" : Math.round((repository.open_issues_count / (repository.stargazers_count + 1)) * 100)}
                </div>
                <div className="text-xs text-green-700 dark:text-green-300">Issue Ratio</div>
              </Card>
            </div>
          </div>

          {/* Topics */}
          {repository.topics && repository.topics.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                Topics
              </h4>
              <div className="flex flex-wrap gap-1">
                {repository.topics.slice(0, 8).map((topic) => (
                  <Badge key={topic} variant="outline" className="text-xs">
                    {topic}
                  </Badge>
                ))}
                {repository.topics.length > 8 && (
                  <Badge variant="outline" className="text-xs">
                    +{repository.topics.length - 8} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </CustomScrollArea>

      {/* Analytics Dashboard Dialog */}
      <Dialog open={dashboardOpen} onOpenChange={setDashboardOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Analytics Dashboard - {repository.full_name}
            </DialogTitle>
          </DialogHeader>
          <AnalyticsDashboard 
            repository={repository} 
            analysis={analysis}
            className="mt-4"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};