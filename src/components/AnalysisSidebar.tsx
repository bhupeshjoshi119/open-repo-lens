import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AnalyticsDashboard } from "./AnalyticsDashboard";
import { 
  FileText, 
  BarChart3, 
  Users, 
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
      description: "Comprehensive issue documentation",
      icon: FileText,
      action: onComprehensiveAnalysis,
      disabled: loading,
      variant: "default" as const,
      primary: true
    },
    {
      title: "Download PDF",
      description: "Export detailed report",
      icon: Download,
      action: onGenerateReport,
      disabled: !analysis || loading,
      variant: "outline" as const
    },
    {
      title: "Image Analysis",
      description: "Analyze repository images",
      icon: Eye,
      action: onImageAnalysis,
      disabled: loading,
      variant: "outline" as const
    },
    {
      title: "Predictive Analytics",
      description: "Future trends and insights",
      icon: TrendingUp,
      action: onPredictiveAnalysis,
      disabled: loading,
      variant: "outline" as const
    },
    {
      title: "Analytics Dashboard",
      description: "Comprehensive metrics view",
      icon: PieChart,
      action: () => setDashboardOpen(true),
      disabled: loading,
      variant: "outline" as const
    }
  ];

  return (
    <div className={cn("w-80 border-r border-border bg-muted/30", className)}>
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-lg mb-2">Analysis Tools</h3>
        <p className="text-sm text-muted-foreground">
          Quick access to repository insights and tools
        </p>
      </div>

      <ScrollArea className="flex-1 h-[calc(100vh-200px)]">
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
                    "w-full justify-start h-auto p-3 text-left",
                    action.primary && "bg-gradient-to-r from-primary to-accent hover:opacity-90"
                  )}
                  onClick={action.action}
                  disabled={action.disabled}
                >
                  <action.icon className="w-4 h-4 mr-3 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{action.title}</div>
                    <div className="text-xs text-muted-foreground truncate">
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

          {/* Health Score Visualization */}
          {healthScore && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                Repository Health
              </h4>
              <Card className="p-4 bg-gradient-to-br from-primary/10 to-accent/10">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {healthScore}
                  </div>
                  <div className="text-sm text-muted-foreground mb-3">
                    Health Score
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-500"
                      style={{ width: `${healthScore}%` }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    {healthScore >= 80 ? "Excellent" : 
                     healthScore >= 60 ? "Good" : 
                     healthScore >= 40 ? "Fair" : "Needs Attention"}
                  </div>
                </div>
              </Card>
            </div>
          )}

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
      </ScrollArea>

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