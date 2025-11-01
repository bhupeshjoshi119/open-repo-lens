import { useState } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, FileText, Edit3, Wand2, Brain, Loader2, Copy, Check } from "lucide-react";

const AITools = () => {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiAvailable, setApiAvailable] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);
  const [summaryType, setSummaryType] = useState<"tl;dr" | "key-points" | "teaser" | "headline">("tl;dr");
  const [summaryLength, setSummaryLength] = useState<"short" | "medium" | "long">("medium");
  const [tone, setTone] = useState<"formal" | "neutral" | "casual">("neutral");
  const [format, setFormat] = useState<"plain-text" | "markdown">("plain-text");
  const { toast } = useToast();

  const checkAPIAvailability = async () => {
    const apis = {
      summarizer: 'ai' in window && 'summarizer' in (window as any).ai,
      writer: 'ai' in window && 'writer' in (window as any).ai,
      rewriter: 'ai' in window && 'rewriter' in (window as any).ai,
      languageModel: 'ai' in window && 'languageModel' in (window as any).ai,
    };
    setApiAvailable(apis);
    return apis;
  };

  useState(() => {
    checkAPIAvailability();
  });

  const handleSummarize = async () => {
    if (!inputText.trim()) {
      toast({
        title: "No text to summarize",
        description: "Please enter some text first",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setOutputText("");
    
    try {
      const apis = await checkAPIAvailability();
      
      if (!apis.summarizer) {
        throw new Error("Summarizer API is not available. Enable Chrome AI experimental features.");
      }

      const canSummarize = await (window as any).ai.summarizer.capabilities();
      
      if (canSummarize.available === "no") {
        throw new Error("Summarizer is not available on this device");
      }

      const summarizer = await (window as any).ai.summarizer.create({
        type: summaryType,
        length: summaryLength,
        format: format,
      });

      const summary = await summarizer.summarize(inputText);
      setOutputText(summary);
      
      toast({
        title: "Summary generated!",
        description: "Your text has been summarized successfully",
      });
    } catch (error) {
      console.error("Summarization error:", error);
      toast({
        title: "Summarization failed",
        description: error instanceof Error ? error.message : "Please enable Chrome AI features",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRewrite = async () => {
    if (!inputText.trim()) {
      toast({
        title: "No text to rewrite",
        description: "Please enter some text first",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setOutputText("");
    
    try {
      const apis = await checkAPIAvailability();
      
      if (!apis.rewriter) {
        throw new Error("Rewriter API is not available. Enable Chrome AI experimental features.");
      }

      const rewriter = await (window as any).ai.rewriter.create({
        tone: tone,
        format: format,
      });

      const rewritten = await rewriter.rewrite(inputText);
      setOutputText(rewritten);
      
      toast({
        title: "Text rewritten!",
        description: "Your text has been rewritten successfully",
      });
    } catch (error) {
      console.error("Rewriting error:", error);
      toast({
        title: "Rewriting failed",
        description: error instanceof Error ? error.message : "Please enable Chrome AI features",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWrite = async (context: string) => {
    if (!context.trim()) {
      toast({
        title: "No context provided",
        description: "Please enter a writing prompt or context",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setOutputText("");
    
    try {
      const apis = await checkAPIAvailability();
      
      if (!apis.writer) {
        throw new Error("Writer API is not available. Enable Chrome AI experimental features.");
      }

      const writer = await (window as any).ai.writer.create({
        tone: tone,
        format: format,
      });

      const written = await writer.write(context);
      setOutputText(written);
      
      toast({
        title: "Content generated!",
        description: "New content has been written successfully",
      });
    } catch (error) {
      console.error("Writing error:", error);
      toast({
        title: "Writing failed",
        description: error instanceof Error ? error.message : "Please enable Chrome AI features",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrompt = async () => {
    if (!inputText.trim()) {
      toast({
        title: "No prompt provided",
        description: "Please enter a prompt first",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setOutputText("");
    
    try {
      const apis = await checkAPIAvailability();
      
      if (!apis.languageModel) {
        throw new Error("Prompt API is not available. Enable Chrome AI experimental features.");
      }

      const session = await (window as any).ai.languageModel.create();
      const result = await session.prompt(inputText);
      setOutputText(result);
      
      toast({
        title: "Response generated!",
        description: "AI has responded to your prompt",
      });
    } catch (error) {
      console.error("Prompt error:", error);
      toast({
        title: "Prompt failed",
        description: error instanceof Error ? error.message : "Please enable Chrome AI features",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (outputText) {
      navigator.clipboard.writeText(outputText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        description: "Copied to clipboard!",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-border bg-gradient-to-br from-background via-background to-secondary/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsla(239,84%,67%,0.15),transparent_50%)]" />
        
        <div className="relative container mx-auto px-4 py-12 sm:py-16">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-secondary/50 backdrop-blur-sm border border-border">
              <Brain className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Chrome Built-in AI</span>
            </div>
            
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                AI-Powered
              </span>
              <br />
              Text Processing Tools
            </h1>
            
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl">
              On-device AI processing with Chrome's Gemini Nano. Summarize, rewrite, and generate content instantly.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Tabs defaultValue="summarize" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-8">
            <TabsTrigger value="summarize" className="gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Summarize</span>
            </TabsTrigger>
            <TabsTrigger value="rewrite" className="gap-2">
              <Edit3 className="w-4 h-4" />
              <span className="hidden sm:inline">Rewrite</span>
            </TabsTrigger>
            <TabsTrigger value="write" className="gap-2">
              <Wand2 className="w-4 h-4" />
              <span className="hidden sm:inline">Write</span>
            </TabsTrigger>
            <TabsTrigger value="prompt" className="gap-2">
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Prompt</span>
            </TabsTrigger>
          </TabsList>

          {/* Summarize Tab */}
          <TabsContent value="summarize" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Text Summarizer
                  {apiAvailable.summarizer && <Badge variant="outline" className="ml-auto">Available</Badge>}
                </CardTitle>
                <CardDescription>
                  Condense long text into key points or brief summaries using on-device AI
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Summary Type</label>
                    <Select value={summaryType} onValueChange={(v: any) => setSummaryType(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tl;dr">TL;DR</SelectItem>
                        <SelectItem value="key-points">Key Points</SelectItem>
                        <SelectItem value="teaser">Teaser</SelectItem>
                        <SelectItem value="headline">Headline</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Length</label>
                    <Select value={summaryLength} onValueChange={(v: any) => setSummaryLength(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="short">Short</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="long">Long</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Format</label>
                    <Select value={format} onValueChange={(v: any) => setFormat(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="plain-text">Plain Text</SelectItem>
                        <SelectItem value="markdown">Markdown</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Input Text</label>
                  <Textarea
                    placeholder="Paste or type the text you want to summarize..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="min-h-[200px] resize-y"
                  />
                </div>

                <Button 
                  onClick={handleSummarize} 
                  disabled={loading || !inputText.trim()}
                  className="w-full sm:w-auto"
                >
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {loading ? "Summarizing..." : "Summarize Text"}
                </Button>

                {outputText && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Summary</label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={copyToClipboard}
                        className="gap-2"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? "Copied!" : "Copy"}
                      </Button>
                    </div>
                    <div className="p-4 rounded-lg bg-secondary/50 border border-border whitespace-pre-wrap">
                      {outputText}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rewrite Tab */}
          <TabsContent value="rewrite" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit3 className="w-5 h-5" />
                  Text Rewriter
                  {apiAvailable.rewriter && <Badge variant="outline" className="ml-auto">Available</Badge>}
                </CardTitle>
                <CardDescription>
                  Rephrase and improve your text while maintaining its meaning
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tone</label>
                    <Select value={tone} onValueChange={(v: any) => setTone(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="formal">Formal</SelectItem>
                        <SelectItem value="neutral">Neutral</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Format</label>
                    <Select value={format} onValueChange={(v: any) => setFormat(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="plain-text">Plain Text</SelectItem>
                        <SelectItem value="markdown">Markdown</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Input Text</label>
                  <Textarea
                    placeholder="Paste or type the text you want to rewrite..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="min-h-[200px] resize-y"
                  />
                </div>

                <Button 
                  onClick={handleRewrite} 
                  disabled={loading || !inputText.trim()}
                  className="w-full sm:w-auto"
                >
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {loading ? "Rewriting..." : "Rewrite Text"}
                </Button>

                {outputText && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Rewritten Text</label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={copyToClipboard}
                        className="gap-2"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? "Copied!" : "Copy"}
                      </Button>
                    </div>
                    <div className="p-4 rounded-lg bg-secondary/50 border border-border whitespace-pre-wrap">
                      {outputText}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Write Tab */}
          <TabsContent value="write" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="w-5 h-5" />
                  Content Writer
                  {apiAvailable.writer && <Badge variant="outline" className="ml-auto">Available</Badge>}
                </CardTitle>
                <CardDescription>
                  Generate new content based on your prompt or context
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tone</label>
                    <Select value={tone} onValueChange={(v: any) => setTone(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="formal">Formal</SelectItem>
                        <SelectItem value="neutral">Neutral</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Format</label>
                    <Select value={format} onValueChange={(v: any) => setFormat(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="plain-text">Plain Text</SelectItem>
                        <SelectItem value="markdown">Markdown</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Writing Prompt</label>
                  <Textarea
                    placeholder="Describe what you want to write about..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="min-h-[200px] resize-y"
                  />
                </div>

                <Button 
                  onClick={() => handleWrite(inputText)} 
                  disabled={loading || !inputText.trim()}
                  className="w-full sm:w-auto"
                >
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {loading ? "Writing..." : "Generate Content"}
                </Button>

                {outputText && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Generated Content</label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={copyToClipboard}
                        className="gap-2"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? "Copied!" : "Copy"}
                      </Button>
                    </div>
                    <div className="p-4 rounded-lg bg-secondary/50 border border-border whitespace-pre-wrap">
                      {outputText}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Prompt Tab */}
          <TabsContent value="prompt" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  AI Prompt
                  {apiAvailable.languageModel && <Badge variant="outline" className="ml-auto">Available</Badge>}
                </CardTitle>
                <CardDescription>
                  Chat with on-device AI using custom prompts for any task
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Your Prompt</label>
                  <Textarea
                    placeholder="Ask anything or provide a task for the AI..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="min-h-[200px] resize-y"
                  />
                </div>

                <Button 
                  onClick={handlePrompt} 
                  disabled={loading || !inputText.trim()}
                  className="w-full sm:w-auto"
                >
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {loading ? "Processing..." : "Send Prompt"}
                </Button>

                {outputText && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">AI Response</label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={copyToClipboard}
                        className="gap-2"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? "Copied!" : "Copy"}
                      </Button>
                    </div>
                    <div className="p-4 rounded-lg bg-secondary/50 border border-border whitespace-pre-wrap">
                      {outputText}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Info Card */}
        <Card className="mt-8 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">How to Enable Chrome AI Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>To use these features, you need Chrome with built-in AI enabled:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Use Chrome Dev or Canary (version 127+)</li>
              <li>Navigate to <code className="px-1 py-0.5 bg-secondary rounded text-xs">chrome://flags</code></li>
              <li>Enable "Prompt API for Gemini Nano"</li>
              <li>Enable "Summarization API for Gemini Nano"</li>
              <li>Enable "Writer API for Gemini Nano"</li>
              <li>Enable "Rewriter API for Gemini Nano"</li>
              <li>Restart Chrome</li>
            </ol>
            <p className="pt-2">
              These APIs run completely on-device using Gemini Nano, ensuring privacy and fast responses.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AITools;
