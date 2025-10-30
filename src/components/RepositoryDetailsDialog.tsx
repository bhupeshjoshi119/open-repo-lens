import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, Sparkles, ExternalLink, FileText, Image, TrendingUp } from "lucide-react";
import { useRepositoryAnalysis } from "@/hooks/useRepositoryAnalysis";
import { ScrollArea } from "@/components/ui/scroll-area";
import { IssueAnalysisDisplay } from "./IssueAnalysisDisplay";
import { PDFReportGenerator } from "./PDFReportGenerator";
import { AnalysisSidebar } from "./AnalysisSidebar";

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
            <ScrollArea className="flex-1 p-6">
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

                {/* Analysis Display */}
                {analysis && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-5 h-5 text-primary" />
                      <h4 className="font-semibold text-primary">
                        {isComprehensive ? "Comprehensive Issue Analysis" : "AI Analysis Results"}
                      </h4>
                    </div>
                    
                    {isComprehensive ? (
                      <IssueAnalysisDisplay analysis={analysis} />
                    ) : (
                      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-lg p-4">
                        <ScrollArea className="max-h-[300px] pr-3">
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <p className="whitespace-pre-wrap text-sm leading-relaxed">
                              {analysis}
                            </p>
                          </div>
                        </ScrollArea>
                      </div>
                    )}
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

                {/* Ask AI Section */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Ask AI about this Repository</h4>
                  
                  {/* Comprehensive Analysis Button */}
                  <Button
                    onClick={handleComprehensiveAnalysis}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
                    size="lg"
                  >
                    {loading && isComprehensive ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing All Issues...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4 mr-2" />
                        Generate Comprehensive Issue Documentation
                      </>
                    )}
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">Or ask a custom question</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Ask your question about this repository..."
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      className="min-h-[80px] resize-none"
                      disabled={loading}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                          handleAskAI();
                        }
                      }}
                    />
                    <Button
                      onClick={handleAskAI}
                      disabled={loading || !customPrompt.trim()}
                      className="w-full"
                      size="lg"
                      variant="outline"
                    >
                      {loading && !isComprehensive ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Ask AI
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
