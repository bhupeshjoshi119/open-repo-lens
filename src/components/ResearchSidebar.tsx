import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CustomScrollArea } from "@/components/ui/custom-scrollbar";

import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ResearchSimplifier } from "./ResearchSimplifier";
import { ChromeAiStatus } from "./ChromeAiStatus";
import { 
  ChevronLeft, 
  ChevronRight, 
  Sparkles,
  Brain,
  FileText,
  Languages,
  CheckCircle,
  HelpCircle,
  Download,
  Upload,
  Zap,
  Target,
  Lightbulb,
  BookOpen,
  Search,
  AlertCircle,
  TrendingUp,
  BarChart3,
  Chrome
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAiTextProcessor } from "@/hooks/useAiTextProcessor";

interface ResearchSidebarProps {
  className?: string;
}

export const ResearchSidebar = ({ className }: ResearchSidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showResearchSimplifier, setShowResearchSimplifier] = useState(false);
  const [activeQuickAction, setActiveQuickAction] = useState<string | null>(null);
  
  const { capabilities, isProcessing } = useAiTextProcessor();

  const quickActions = [
    {
      id: 'research-simplifier',
      icon: Sparkles,
      label: 'Research Simplifier',
      description: 'AI-powered text processing',
      action: () => setShowResearchSimplifier(true),
      available: capabilities?.promptApi || capabilities?.summarizer,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'error-analysis',
      icon: AlertCircle,
      label: 'Error Analysis',
      description: 'Identify and fix issues',
      action: () => {
        setActiveQuickAction('error-analysis');
        setShowResearchSimplifier(true);
      },
      available: capabilities?.promptApi,
      color: 'from-red-500 to-orange-500'
    },
    {
      id: 'document-summary',
      icon: FileText,
      label: 'Quick Summary',
      description: 'Summarize any content',
      action: () => {
        setActiveQuickAction('summary');
        setShowResearchSimplifier(true);
      },
      available: capabilities?.summarizer,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'translation',
      icon: Languages,
      label: 'Translate',
      description: 'Multi-language support',
      action: () => {
        setActiveQuickAction('translate');
        setShowResearchSimplifier(true);
      },
      available: capabilities?.translator,
      color: 'from-green-500 to-emerald-500'
    }
  ];

  const aiFeatures = [
    {
      icon: Brain,
      label: 'Text Simplification',
      status: capabilities?.writer ? 'Ready' : 'Unavailable',
      description: 'Make complex text easier to understand'
    },
    {
      icon: CheckCircle,
      label: 'Proofreading',
      status: capabilities?.writer ? 'Ready' : 'Unavailable',
      description: 'Grammar and style improvements'
    },
    {
      icon: HelpCircle,
      label: 'Study Questions',
      status: capabilities?.promptApi ? 'Ready' : 'Unavailable',
      description: 'Generate quiz questions'
    },
    {
      icon: BookOpen,
      label: 'Research Analysis',
      status: capabilities?.promptApi ? 'Ready' : 'Unavailable',
      description: 'Deep content analysis'
    }
  ];

  const researchStats = [
    { label: 'AI Features', value: Object.values(capabilities || {}).filter(Boolean).length, total: 4 },
    { label: 'Processing', value: isProcessing ? 1 : 0, total: 1 },
    { label: 'Available Tools', value: quickActions.filter(a => a.available).length, total: quickActions.length }
  ];

  return (
    <>
      <div 
        className={cn(
          "fixed right-0 top-0 z-30 h-full bg-background/95 backdrop-blur-sm border-l border-border transition-all duration-300 ease-in-out",
          // Responsive visibility and sizing
          "hidden md:block lg:block xl:block",
          // Responsive width based on screen size and collapsed state
          isCollapsed 
            ? "w-12 md:w-14 lg:w-16" 
            : "w-72 md:w-80 lg:w-80 xl:w-96",
          // Better mobile handling
          "max-w-[90vw] md:max-w-none",
          className
        )}
      >
        {/* Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute -left-4 top-6 z-50 h-8 w-8 rounded-full border bg-background shadow-md hover:shadow-lg transition-all duration-200"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>

        {/* Sidebar Content */}
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-border">
            {!isCollapsed ? (
              <div className="flex items-center gap-2">
                <Brain className="h-6 w-6 text-primary" />
                <h2 className="font-semibold text-lg">Research Tools</h2>
              </div>
            ) : (
              <div className="flex justify-center">
                <Brain className="h-6 w-6 text-primary" />
              </div>
            )}
          </div>

          {/* Content */}
          <CustomScrollArea className="flex-1 px-2 py-4">
            <div className="space-y-6">
              {/* Chrome AI Status */}
              {!isCollapsed && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Chrome AI Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {researchStats.map((stat, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">{stat.label}</span>
                        <Badge variant={stat.value > 0 ? "default" : "secondary"} className="text-xs">
                          {stat.value}/{stat.total}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              <div>
                {!isCollapsed && (
                  <h3 className="px-2 mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Quick Actions
                  </h3>
                )}
                
                <div className="space-y-2">
                  {quickActions.map((action) => (
                    <Button
                      key={action.id}
                      variant="ghost"
                      className={cn(
                        "w-full h-auto p-3 hover:bg-accent/50 transition-all duration-200",
                        isCollapsed && "justify-center px-2",
                        !action.available && "opacity-50"
                      )}
                      onClick={action.action}
                      disabled={!action.available}
                    >
                      <div className={cn(
                        "flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r",
                        action.color,
                        !isCollapsed && "mr-3"
                      )}>
                        <action.icon className="h-4 w-4 text-white" />
                      </div>
                      
                      {!isCollapsed && (
                        <div className="flex-1 text-left min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="truncate text-sm font-medium">
                              {action.label}
                            </div>
                            {action.available && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                Ready
                              </Badge>
                            )}
                          </div>
                          <div className="truncate text-xs text-muted-foreground">
                            {action.description}
                          </div>
                        </div>
                      )}
                    </Button>
                  ))}
                </div>
              </div>

              {!isCollapsed && <Separator />}

              {/* AI Features */}
              <div>
                {!isCollapsed && (
                  <h3 className="px-2 mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    AI Features
                  </h3>
                )}
                
                <div className="space-y-1">
                  {aiFeatures.map((feature, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex items-center p-2 rounded-lg transition-colors duration-200",
                        isCollapsed && "justify-center",
                        feature.status === 'Ready' ? "bg-green-50 dark:bg-green-950/20" : "bg-gray-50 dark:bg-gray-950/20"
                      )}
                    >
                      <feature.icon className={cn(
                        "h-4 w-4",
                        feature.status === 'Ready' ? "text-green-600 dark:text-green-400" : "text-gray-400",
                        !isCollapsed && "mr-3"
                      )} />
                      
                      {!isCollapsed && (
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium truncate">
                              {feature.label}
                            </span>
                            <Badge 
                              variant={feature.status === 'Ready' ? "default" : "secondary"}
                              className="ml-2 text-xs"
                            >
                              {feature.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {feature.description}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {!isCollapsed && <Separator />}

              {/* Research Insights */}
              {!isCollapsed && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Research Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-xs text-muted-foreground">
                      <p className="mb-2">
                        <strong>Tip:</strong> Use "Error Analysis" to automatically detect issues in your research content.
                      </p>
                      <p>
                        <strong>Chrome AI:</strong> {capabilities?.promptApi ? 'Available' : 'Enable Chrome AI features for enhanced processing'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </CustomScrollArea>

          {/* Footer */}
          {!isCollapsed && (
            <div className="p-4 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setShowResearchSimplifier(true)}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Open Research Hub
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Research Simplifier Dialog */}
      <Dialog open={showResearchSimplifier} onOpenChange={setShowResearchSimplifier}>
        <DialogContent className="max-w-6xl max-h-[90vh] w-[95vw]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Chrome AI Research Hub
              {activeQuickAction && (
                <Badge variant="outline" className="ml-2">
                  {activeQuickAction === 'error-analysis' ? 'Error Analysis Mode' : 
                   activeQuickAction === 'summary' ? 'Summary Mode' : 
                   activeQuickAction === 'translate' ? 'Translation Mode' : 'Standard Mode'}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          <CustomScrollArea className="mt-4 max-h-[75vh]">
            <ResearchSimplifier 
              onTextProcessed={(result) => {
                console.log('Text processed:', result);
                setActiveQuickAction(null);
              }}
            />
          </CustomScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};