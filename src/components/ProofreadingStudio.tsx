import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileText, 
  Download, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Lightbulb,
  TrendingUp,
  FileCheck,
  Loader2
} from 'lucide-react';
import ChromeAiService from '@/services/chromeAiService';
import { ProofreadResult, AiErrorType } from '@/types/chromeAi';
import { generateProofreadingPDF } from '@/utils/pdfGenerator';
import { useToast } from '@/hooks/use-toast';
import UserProfile from '@/components/UserProfile';
import { ChromeAiStatus } from '@/components/ChromeAiStatus';
import { ChromeAiCompatibilityBanner } from '@/components/ChromeAiCompatibilityBanner';

export const ProofreadingStudio: React.FC = () => {
  const [originalText, setOriginalText] = useState('');
  const [result, setResult] = useState<ProofreadResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleProofread = async () => {
    if (!originalText.trim()) {
      toast({
        title: "No text provided",
        description: "Please enter some text to proofread",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      const proofreadResult = await ChromeAiService.proofreadText(originalText);
      setResult(proofreadResult);
      
      toast({
        title: "Proofreading Complete!",
        description: `Found ${proofreadResult.suggestions.length} suggestion${proofreadResult.suggestions.length !== 1 ? 's' : ''}`,
      });
    } catch (error: any) {
      console.error('Proofreading error:', error);
      
      // Handle specific error types
      if (error.name === AiErrorType.NOT_AVAILABLE || error.message?.includes('not available')) {
        toast({
          title: "Chrome AI Not Available",
          description: "Please enable Chrome AI features in chrome://flags and restart your browser. Search for 'Gemini Nano' flags.",
          variant: "destructive",
          duration: 8000,
        });
      } else if (error.name === AiErrorType.PROCESSING_ERROR) {
        toast({
          title: "Processing Error",
          description: "Failed to process your text. Please try again with shorter text or check your Chrome AI settings.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Proofreading Failed",
          description: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportPDF = async () => {
    if (!result) return;

    try {
      await generateProofreadingPDF({
        originalText,
        correctedText: result.correctedText,
        suggestions: result.suggestions,
        metrics: result.metrics
      });

      toast({
        title: "PDF Generated!",
        description: "Your proofreading report has been downloaded",
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: "PDF Generation Failed",
        description: "Failed to generate PDF report",
        variant: "destructive"
      });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'grammar':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'style':
        return <Lightbulb className="h-4 w-4 text-yellow-500" />;
      case 'clarity':
        return <TrendingUp className="h-4 w-4 text-blue-500" />;
      default:
        return <FileCheck className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-primary animate-pulse" />
            <h1 className="text-3xl font-bold">AI Proofreading Studio</h1>
            <Badge variant="secondary" className="ml-2">
              Experimental
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <ChromeAiStatus />
            <UserProfile />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            Advanced grammar checking with side-by-side comparison and detailed PDF reports
          </p>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = '/'}
            >
              ← Back to Home
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = '/chrome-ai-demo'}
            >
              View All AI Features
            </Button>
          </div>
        </div>
      </div>

      {/* Chrome AI Compatibility Banner */}
      <ChromeAiCompatibilityBanner className="mb-6" />

      <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Centered Profile/Action Button - Visible on large screens */}
        <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="bg-background border-2 border-primary rounded-full p-2 shadow-lg">
            <Button
              size="lg"
              onClick={handleProofread}
              disabled={isProcessing || !originalText.trim()}
              className="rounded-full h-16 w-16 p-0"
            >
              {isProcessing ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : (
                <Sparkles className="h-8 w-8" />
              )}
            </Button>
          </div>
        </div>

        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Original Text
            </CardTitle>
            <CardDescription>
              Enter or paste your text for proofreading
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="The Model Context Protocol is an open standard, open-source framework introduced by Anthropic in November 2024 to standardize the way artificial intelligence systems like large language models integrate and share data with external tools, systems, and data sources."
              value={originalText}
              onChange={(e) => setOriginalText(e.target.value)}
              className="min-h-[400px] font-mono text-sm"
            />
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {originalText.length} characters, {originalText.split(/\s+/).filter(w => w).length} words
              </span>
              <Button 
                onClick={handleProofread}
                disabled={isProcessing || !originalText.trim()}
                className="gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Proofread with AI
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Corrected Text
            </CardTitle>
            <CardDescription>
              AI-powered corrections and improvements
            </CardDescription>
          </CardHeader>
          <CardContent>
            {result ? (
              <>
                <div className="bg-muted p-4 rounded-lg min-h-[400px] font-mono text-sm whitespace-pre-wrap">
                  {result.correctedText}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex gap-2">
                    <Badge variant="outline" className="gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {result.metrics.grammarIssues} Grammar
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <Lightbulb className="h-3 w-3" />
                      {result.metrics.styleIssues} Style
                    </Badge>
                  </div>
                  <Button 
                    onClick={handleExportPDF}
                    variant="outline"
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export PDF
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center min-h-[400px] text-muted-foreground">
                <div className="text-center">
                  <FileCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Corrected text will appear here</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Analysis</CardTitle>
            <CardDescription>
              Comprehensive breakdown of corrections and suggestions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="metrics" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="metrics">Metrics</TabsTrigger>
                <TabsTrigger value="suggestions">
                  Suggestions ({result.suggestions.length})
                </TabsTrigger>
                <TabsTrigger value="comparison">Comparison</TabsTrigger>
              </TabsList>

              <TabsContent value="metrics" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">
                        Readability Score
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className={`text-3xl font-bold ${getScoreColor(result.metrics.readabilityScore)}`}>
                        {result.metrics.readabilityScore}/100
                      </div>
                      <Progress 
                        value={result.metrics.readabilityScore} 
                        className="mt-2"
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">
                        Grammar Issues
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-red-600">
                        {result.metrics.grammarIssues}
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Issues found and corrected
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">
                        Style Improvements
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-yellow-600">
                        {result.metrics.styleIssues}
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Suggestions applied
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="suggestions" className="space-y-4">
                {result.suggestions.length > 0 ? (
                  result.suggestions.map((suggestion, index) => (
                    <Alert key={index} className="border-l-4 border-l-primary/20">
                      <div className="flex items-start gap-4">
                        {getSuggestionIcon(suggestion.type)}
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="capitalize font-medium">
                              {suggestion.type} Issue
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              #{index + 1}
                            </span>
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                                Original Text:
                              </label>
                              <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 p-3 rounded-md">
                                <span className="font-mono text-sm line-through text-red-700 dark:text-red-300">
                                  {suggestion.original}
                                </span>
                              </div>
                            </div>
                            
                            <div>
                              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                                Suggested Improvement:
                              </label>
                              <div className="bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 p-3 rounded-md">
                                <span className="font-mono text-sm text-green-700 dark:text-green-300 font-medium">
                                  {suggestion.suggested}
                                </span>
                              </div>
                            </div>
                            
                            {suggestion.explanation && (
                              <div>
                                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                                  Explanation:
                                </label>
                                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-3 rounded-md">
                                  <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                                    {suggestion.explanation}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Alert>
                  ))
                ) : (
                  <Alert>
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription>
                      No issues found! Your text looks great.
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>

              <TabsContent value="comparison" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-red-200 dark:border-red-800">
                      <FileText className="h-5 w-5 text-red-600" />
                      <h3 className="font-semibold text-lg text-red-700 dark:text-red-300">
                        Original Text
                      </h3>
                      <Badge variant="destructive" className="ml-auto">
                        Before
                      </Badge>
                    </div>
                    <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 p-4 rounded-lg min-h-[300px]">
                      <pre className="font-mono text-sm text-red-800 dark:text-red-200 whitespace-pre-wrap leading-relaxed">
                        {originalText}
                      </pre>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-green-200 dark:border-green-800">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <h3 className="font-semibold text-lg text-green-700 dark:text-green-300">
                        Corrected Text
                      </h3>
                      <Badge variant="default" className="ml-auto bg-green-600">
                        After
                      </Badge>
                    </div>
                    <div className="bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 p-4 rounded-lg min-h-[300px]">
                      <pre className="font-mono text-sm text-green-800 dark:text-green-200 whitespace-pre-wrap leading-relaxed font-medium">
                        {result.correctedText}
                      </pre>
                    </div>
                  </div>
                </div>
                
                {/* Summary of Changes */}
                <div className="bg-muted/50 border rounded-lg p-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Summary of Changes
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {result.metrics.grammarIssues}
                      </div>
                      <div className="text-muted-foreground">Grammar Issues Fixed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {result.metrics.styleIssues}
                      </div>
                      <div className="text-muted-foreground">Style Improvements</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {result.metrics.readabilityScore}
                      </div>
                      <div className="text-muted-foreground">Readability Score</div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
