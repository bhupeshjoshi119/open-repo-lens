import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, Sparkles, ExternalLink, FileText, Upload, Image as ImageIcon, Download } from "lucide-react";
import { useRepositoryAnalysis } from "@/hooks/useRepositoryAnalysis";
import { useImageAnalysis } from "@/hooks/useImageAnalysis";
import { ScrollArea } from "@/components/ui/scroll-area";
import { IssueAnalysisDisplay } from "./IssueAnalysisDisplay";
import { useToast } from "@/hooks/use-toast";
import { exportAnalysisToPDF } from "@/lib/pdfExport";

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
  const [isComprehensive, setIsComprehensive] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isImageAnalysis, setIsImageAnalysis] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { analyzeRepository, analysis, loading, error, clearAnalysis } = useRepositoryAnalysis();
  const { analyzeImage, analysis: imageAnalysis, loading: imageLoading, error: imageError, clearAnalysis: clearImageAnalysis } = useImageAnalysis();
  const { toast } = useToast();
  
  const currentAnalysis = isImageAnalysis ? imageAnalysis : analysis;
  const currentLoading = loading || imageLoading;
  const currentError = error || imageError;

  const handleAskAI = async () => {
    if (!repository) return;
    
    const queryPrompt = customPrompt.trim();
    
    if (queryPrompt) {
      setIsComprehensive(false);
      const result = await analyzeRepository(repository, queryPrompt);
      setCustomPrompt("");
      
      if (error) {
        toast({
          title: "Analysis Failed",
          description: error,
          variant: "destructive",
        });
      }
    }
  };

  const handleComprehensiveAnalysis = async () => {
    if (!repository) return;
    setIsComprehensive(true);
    const result = await analyzeRepository(repository);
    
    if (error) {
      toast({
        title: "Analysis Failed",
        description: error,
        variant: "destructive",
      });
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeImage = async () => {
    if (!repository || !selectedImage) return;
    
    setIsImageAnalysis(true);
    setIsComprehensive(false);
    const result = await analyzeImage(selectedImage, repository.full_name);
    
    if (imageError) {
      toast({
        title: "Analysis Failed",
        description: imageError,
        variant: "destructive",
      });
    }
  };

  const handleExportImageAnalysisToPDF = async () => {
    if (!imageAnalysis || !repository) return;
    
    try {
      exportAnalysisToPDF({
        repositoryName: repository.full_name,
        analysis: imageAnalysis
      });
      
      toast({
        title: "PDF Exported",
        description: "Screenshot analysis has been exported to PDF",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export PDF",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    clearAnalysis();
    clearImageAnalysis();
    setCustomPrompt("");
    setIsComprehensive(false);
    setIsImageAnalysis(false);
    setSelectedImage(null);
    setImagePreview(null);
    onOpenChange(false);
  };

  if (!repository) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <div className="p-6 pb-4 shrink-0">
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

        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="space-y-6 px-6 pr-9 pb-6">
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
            {currentAnalysis && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h4 className="font-semibold text-primary">
                      {isImageAnalysis ? "Issue Screenshot Analysis" : isComprehensive ? "Comprehensive Issue Analysis" : "AI Analysis Results"}
                    </h4>
                  </div>
                  {isImageAnalysis && (
                    <Button
                      onClick={handleExportImageAnalysisToPDF}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Export PDF
                    </Button>
                  )}
                </div>
                
                {isComprehensive ? (
                  <IssueAnalysisDisplay analysis={currentAnalysis} repositoryName={repository.full_name} />
                ) : (
                  <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-lg p-4">
                    <ScrollArea className="max-h-[300px] pr-3">
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">
                          {currentAnalysis}
                        </p>
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>
            )}

            {currentError && (
              <div className="bg-destructive/10 text-destructive rounded-lg p-4 text-sm">
                {currentError}
              </div>
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
                  disabled={currentLoading}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      handleAskAI();
                    }
                  }}
                />
                <Button
                  onClick={handleAskAI}
                  disabled={currentLoading || !customPrompt.trim()}
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

              {/* Image Analysis Section */}
              <div className="space-y-3 pt-4 border-t">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Analyze Issue Screenshot
                </h4>
                <p className="text-xs text-muted-foreground">
                  Upload a screenshot of a GitHub issue to get AI-powered solution and export to PDF
                </p>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                
                {imagePreview ? (
                  <div className="space-y-3">
                    <div className="relative border rounded-lg overflow-hidden">
                      <img 
                        src={imagePreview} 
                        alt="Issue screenshot preview" 
                        className="w-full h-48 object-contain bg-muted"
                      />
                      <Button
                        size="sm"
                        variant="secondary"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setSelectedImage(null);
                          setImagePreview(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                    <Button
                      onClick={handleAnalyzeImage}
                      disabled={imageLoading || !selectedImage}
                      className="w-full"
                      size="lg"
                    >
                      {imageLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Analyzing Screenshot...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Analyze Screenshot
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={currentLoading}
                    variant="outline"
                    className="w-full"
                    size="lg"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Issue Screenshot
                  </Button>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
