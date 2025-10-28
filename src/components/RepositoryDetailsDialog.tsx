import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, Sparkles, ExternalLink } from "lucide-react";
import { useRepositoryAnalysis } from "@/hooks/useRepositoryAnalysis";
import { ScrollArea } from "@/components/ui/scroll-area";

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
}


export const RepositoryDetailsDialog = ({
  repository,
  open,
  onOpenChange,
}: RepositoryDetailsDialogProps) => {
  const [customPrompt, setCustomPrompt] = useState("");
  const { analyzeRepository, analysis, loading, error, clearAnalysis } = useRepositoryAnalysis();

  const handleAskAI = async () => {
    if (!repository) return;
    
    const queryPrompt = customPrompt.trim();
    
    if (queryPrompt) {
      await analyzeRepository(repository, queryPrompt);
      setCustomPrompt("");
    }
  };

  const handleClose = () => {
    clearAnalysis();
    setCustomPrompt("");
    onOpenChange(false);
  };

  if (!repository) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
        <div className="p-6 pb-4">
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
            </DialogTitle>
            <DialogDescription>
              Analyze repository issues and architecture with AI-powered insights
            </DialogDescription>
          </DialogHeader>
        </div>

        <ScrollArea className="flex-1 px-6 h-[600px]">
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
              <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-lg p-4 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <h4 className="font-semibold flex items-center gap-2 text-primary">
                  <Sparkles className="w-5 h-5" />
                  AI Analysis Results
                </h4>
                <ScrollArea className="max-h-[300px] pr-3">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {analysis}
                    </p>
                  </div>
                </ScrollArea>
              </div>
            )}

            {error && (
              <div className="bg-destructive/10 text-destructive rounded-lg p-4 text-sm">
                {error}
              </div>
            )}

            {/* Ask AI Section */}
            <div className="space-y-4">
              <h4 className="font-semibold">Ask AI about this Repository</h4>
              
              <div className="space-y-3">
                <Textarea
                  placeholder="Ask your question about this repository..."
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
                <Button
                  onClick={handleAskAI}
                  disabled={loading || !customPrompt.trim()}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
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
      </DialogContent>
    </Dialog>
  );
};
