import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, Sparkles, ExternalLink, Lightbulb, Target, Brain, Zap } from "lucide-react";
import { useRepositoryAnalysis } from "@/hooks/useRepositoryAnalysis";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

const PRESET_PROMPTS = [
  {
    id: "surprising-issues",
    icon: Sparkles,
    title: "Surprising & Overlooked Issues",
    description: "Reveal deep architectural lessons or design tradeoffs",
    prompt: "Show me the most surprising or overlooked issues — the ones that reveal deep architectural lessons or design tradeoffs."
  },
  {
    id: "interview-insights",
    icon: Brain,
    title: "Issue-to-Interview Mapper",
    description: "Map issues to system design concepts",
    prompt: "Identify open issues that could inspire system design interview questions. For each, explain what concept it highlights — like consistency, partitioning, caching, or fault tolerance — and how I could use it as a learning or discussion point."
  },
  {
    id: "high-value-prep",
    icon: Target,
    title: "High-Value Interview Prep",
    description: "Real-world interview challenges",
    prompt: "Show me the most interesting unresolved issues that align with real-world interview challenges — e.g., scalability bottlenecks, architecture redesign suggestions, or critiques of design trade-offs. Also, explain what interview insight each issue teaches."
  },
  {
    id: "improvement-potential",
    icon: Zap,
    title: "Biggest Improvement Potential",
    description: "Issues that could spark major improvements",
    prompt: "Which open issues have the potential to spark the biggest improvements or controversies in this repo?"
  },
  {
    id: "clever-debates",
    icon: Lightbulb,
    title: "Clever Debates & Discussions",
    description: "Educational or brilliant debates",
    prompt: "Find issues that show clever debates between contributors — something educational or unexpectedly brilliant."
  }
];

export const RepositoryDetailsDialog = ({
  repository,
  open,
  onOpenChange,
}: RepositoryDetailsDialogProps) => {
  const [customPrompt, setCustomPrompt] = useState("");
  const { analyzeRepository, analysis, loading, error, clearAnalysis } = useRepositoryAnalysis();

  const handleAskAI = async (prompt?: string) => {
    if (!repository) return;
    
    const queryPrompt = prompt || customPrompt.trim();
    
    if (queryPrompt) {
      await analyzeRepository(repository, queryPrompt);
      setCustomPrompt("");
    } else {
      // If no prompt at all, do a default summary
      await analyzeRepository(repository);
    }
  };

  const handlePresetClick = (prompt: string) => {
    handleAskAI(prompt);
  };

  const handleClose = () => {
    clearAnalysis();
    setCustomPrompt("");
    onOpenChange(false);
  };

  if (!repository) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
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

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
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
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  AI Analysis
                </h4>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {analysis}
                  </p>
                </div>
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
              
              <Tabs defaultValue="presets" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="presets">Preset Prompts</TabsTrigger>
                  <TabsTrigger value="custom">Custom Question</TabsTrigger>
                </TabsList>
                
                <TabsContent value="presets" className="space-y-3 mt-4">
                  <div className="grid gap-3">
                    {PRESET_PROMPTS.map((preset) => {
                      const Icon = preset.icon;
                      return (
                        <Card 
                          key={preset.id}
                          className="cursor-pointer hover:bg-accent/50 transition-colors"
                          onClick={() => !loading && handlePresetClick(preset.prompt)}
                        >
                          <CardHeader className="p-4">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <Icon className="w-4 h-4" />
                              {preset.title}
                            </CardTitle>
                            <CardDescription className="text-xs">
                              {preset.description}
                            </CardDescription>
                          </CardHeader>
                        </Card>
                      );
                    })}
                  </div>
                </TabsContent>
                
                <TabsContent value="custom" className="space-y-3 mt-4">
                  <Textarea
                    placeholder="Ask a custom question about this repository. E.g., What are the main dependencies? Is this suitable for production?"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    className="min-h-[100px]"
                    disabled={loading}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                        handleAskAI();
                      }
                    }}
                  />
                  <Button
                    onClick={() => handleAskAI()}
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
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
