import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, Sparkles, ExternalLink, FileText, TrendingUp } from "lucide-react";
import { useRepositoryAnalysis } from "@/hooks/useRepositoryAnalysis";
import { CustomScrollArea } from "@/components/ui/custom-scrollbar";
import { IssueAnalysisDisplay } from "./IssueAnalysisDisplay";
import { PDFReportGenerator } from "./PDFReportGenerator";
import { AnalysisSidebar } from "./AnalysisSidebar";
import { GitHubReportViewer } from "./GitHubReportViewer";
import { AiRepositoryAnalyzer } from "./AiRepositoryAnalyzer";

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

interface RepositoryDetailsDialogProps {
  repository: Repository | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImageAnalysisClick?: () => void;
  onPredictiveAnalysisClick?: () => void;
}


export const RepositoryDetailsDialog = ({
  repository,
  open,
  onOpenChange,
  onImageAnalysisClick,
  onPredictiveAnalysisClick,
}: RepositoryDetailsDialogProps) => {
  const [customPrompt, setCustomPrompt] = useState("");
  const [isComprehensive, setIsComprehensive] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const { analyzeRepository, analysis, loading, error, clearAnalysis } = useRepositoryAnalysis();

  const handleAskAI = async () => {
    if (!repository) return;
    
    const queryPrompt = customPrompt.trim();
    
    if (queryPrompt) {
      setIsComprehensive(false);
      await analyzeRepository(repository, queryPrompt);
      setCustomPrompt("");
    }
  };

  const handleComprehensiveAnalysis = async () => {
    if (!repository) return;
    setIsComprehensive(true);
    await analyzeRepository(repository);
  };

  const handleClose = () => {
    clearAnalysis();
    setCustomPrompt("");
    setIsComprehensive(false);
    setShowSidebar(true);
    onOpenChange(false);
  };



  const handleGenerateReport = async () => {
    if (!repository || !analysis) return;
    
    // Import the PDF generation function dynamically
    const { generateAdvancedPDFReport } = await import("@/utils/pdfGenerator");
    await generateAdvancedPDFReport(repository, analysis);
  };

  const handleImageAnalysis = () => {
    if (onImageAnalysisClick) {
      onImageAnalysisClick();
      handleClose();
    }
  };

  const handlePredictiveAnalysis = () => {
    if (onPredictiveAnalysisClick) {
      onPredictiveAnalysisClick();
      handleClose();
    }
  };

  if (!repository) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] flex flex-col p-0">
        <div className="p-6 pb-4 border-b border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <span className="truncate">{repository.full_name}</span>
              <Button
                variant="ghost"
                size="icon"
                asChild
                className="shrink-0"
              >
                <a href={repository.html_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSidebar(!showSidebar)}
                className="ml-auto"
              >
                {showSidebar ? "Hide Sidebar" : "Show Sidebar"}
              </Button>
            </DialogTitle>
            <DialogDescription>
              Analyze repository issues and architecture with AI-powered insights
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          {showSidebar && (
            <AnalysisSidebar
              repository={repository}
              analysis={analysis}
              onGenerateReport={handleGenerateReport}
              onComprehensiveAnalysis={handleComprehensiveAnalysis}
              onImageAnalysis={handleImageAnalysis}
              onPredictiveAnalysis={handlePredictiveAnalysis}
              loading={loading}
            />
          )}

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="px-6 pt-4 pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-primary">Repository Analysis</h3>
              </div>
            </div>

            <CustomScrollArea className="flex-1 p-6">
              <div className="space-y-6 pr-3 pb-6">
                {/* Repository Info */}
                <div className="space-y-3">
                  {repository.description && (
                    <p className="text-muted-foreground">{repository.description}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-2">
                    {repository.language && (
                      <Badge variant="secondary">{repository.language}</Badge>
                    )}
                    <Badge variant="outline">⭐ {repository.stargazers_count}</Badge>
                    <Badge variant="outline">🔀 {repository.forks_count}</Badge>
                    {repository.license && (
                      <Badge variant="outline">{repository.license.name}</Badge>
                    )}
                  </div>

                  {repository.topics && repository.topics.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {repository.topics.map((topic) => (
                        <Badge key={topic} variant="secondary" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Chrome AI Repository Analyzer */}
                <AiRepositoryAnalyzer repository={repository} className="mb-6" />

                {/* Analysis Display */}
                {analysis && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        <h4 className="font-semibold text-primary">
                          {isComprehensive ? "Comprehensive Repository Analysis" : "AI Analysis Results"}
                        </h4>
                      </div>
                      <Badge variant="secondary" className="bg-gradient-to-r from-primary/10 to-accent/10">
                        Analysis Complete
                      </Badge>
                    </div>
                    
                    <GitHubReportViewer 
                      analysis={analysis} 
                      repository={repository}
                    />
                  </div>
                )}

                {error && (
                  <div className="bg-destructive/10 text-destructive rounded-lg p-4 text-sm">
                    {error}
                  </div>
                )}

                {/* PDF Report Generator */}
                {analysis && (
                  <PDFReportGenerator
                    repository={repository}
                    analysis={analysis}
                    className="mb-6"
                  />
                )}

                {/* Enhanced AI Analysis Section */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-lg">AI-Powered Repository Analysis</h4>
                    {analysis && (
                      <Badge variant="outline" className="text-xs">
                        Last analyzed: {new Date().toLocaleDateString()}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Quick Analysis Insights */}
                  {!analysis && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Code Quality</span>
                        </div>
                        <p className="text-xs text-blue-700 dark:text-blue-300">Analyze code structure, patterns, and best practices</p>
                      </div>
                      
                      <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-green-900 dark:text-green-100">Performance</span>
                        </div>
                        <p className="text-xs text-green-700 dark:text-green-300">Identify bottlenecks and optimization opportunities</p>
                      </div>
                      
                      <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border border-purple-200 dark:border-purple-800">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-4 h-4 text-purple-600" />
                          <span className="text-sm font-medium text-purple-900 dark:text-purple-100">Architecture</span>
                        </div>
                        <p className="text-xs text-purple-700 dark:text-purple-300">Review system design and architectural decisions</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Comprehensive Analysis Button */}
                  <Button
                    onClick={handleComprehensiveAnalysis}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-200 shadow-md hover:shadow-lg focus:ring-2 focus:ring-primary/20 focus:ring-offset-2"
                    size="lg"
                    aria-label={analysis ? "Refresh repository analysis" : "Start comprehensive repository analysis"}
                  >
                    {loading && isComprehensive ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-3 animate-spin" aria-hidden="true" />
                        <span>Analyzing Repository...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-3" aria-hidden="true" />
                        <span>{analysis ? "Refresh Analysis" : "Start Comprehensive Analysis"}</span>
                      </>
                    )}
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">Custom Analysis</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                      Ask specific questions about this repository's code, architecture, or issues:
                    </div>
                    <Textarea
                      placeholder="e.g., 'What are the main security vulnerabilities?', 'How can I improve performance?', 'What's the code quality score?'"
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      className="min-h-[100px] resize-none"
                      disabled={loading}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                          handleAskAI();
                        }
                      }}
                    />
                    <div className="flex gap-3">
                      <Button
                        onClick={handleAskAI}
                        disabled={loading || !customPrompt.trim()}
                        className="flex-1 border-primary/20 hover:bg-primary/5 hover:border-primary/30 transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:ring-offset-2"
                        size="lg"
                        variant="outline"
                        aria-label="Submit custom analysis question"
                      >
                        {loading && !isComprehensive ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                            <span>Analyzing...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" aria-hidden="true" />
                            <span>Ask AI</span>
                          </>
                        )}
                      </Button>
                      {customPrompt && (
                        <Button
                          onClick={() => setCustomPrompt("")}
                          variant="ghost"
                          size="lg"
                          disabled={loading}
                          className="px-6 hover:bg-muted/50 transition-colors duration-200 focus:ring-2 focus:ring-muted focus:ring-offset-2"
                          aria-label="Clear custom prompt"
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      💡 Tip: Press Cmd/Ctrl + Enter to submit quickly
                    </div>
                  </div>
                </div>
              </div>
            </CustomScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
