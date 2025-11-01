import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Sparkles, 
  Brain, 
  FileText, 
  ArrowLeft,
  Chrome,
  Copy,
  Loader2,
  Wand2,
  MessageSquare,
  PenTool,
  Globe,
  Lightbulb,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import ChromeAiService from '@/services/chromeAiService';
import { ChromeAiStatus } from '@/components/ChromeAiStatus';
import { ChromeAiCompatibilityBanner } from '@/components/ChromeAiCompatibilityBanner';
import { AiErrorType } from '@/types/chromeAi';

interface AiResult {
  content: string;
  processing: boolean;
  error?: string;
}

export const AiToolsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('summarizer');
  const [inputText, setInputText] = useState('');
  const [results, setResults] = useState<Record<string, AiResult>>({});
  const [capabilities, setCapabilities] = useState<any>(null);
  const { toast } = useToast();

  // Sample texts for different tools
  const sampleTexts = {
    summarizer: `Artificial Intelligence (AI) has revolutionized the way we approach software development and data analysis. Machine learning algorithms can now process vast amounts of information, identify patterns, and make predictions with unprecedented accuracy. In the context of web development, AI-powered tools are becoming increasingly sophisticated, offering developers new ways to optimize code, enhance user experiences, and automate repetitive tasks.

The integration of AI into browsers, such as Chrome's built-in AI capabilities powered by Gemini Nano, represents a significant leap forward in making AI accessible to everyday users. These on-device AI models can perform tasks like text summarization, language translation, and content analysis without requiring external API calls, ensuring privacy and reducing latency.

For developers and researchers, this means having powerful AI tools directly available in their workflow, enabling real-time analysis of documentation, code review assistance, and intelligent content processing. The potential applications are vast, from educational tools that simplify complex technical documentation to productivity enhancers that help developers understand and work with large codebases more effectively.`,
    
    rewriter: `This text has some issues with grammer and could be improved. The writing style is not very good and there are awkward phrasings that make it hard to read. AI can help make this better by fixing mistakes and improving the overall quality of the writing.`,
    
    writer: `Write a comprehensive guide about the benefits of using Chrome's built-in AI for web development`,
    
    translator: `Hello! Welcome to TechHub's AI-powered translation feature. This text will be translated into your selected language using Chrome's built-in translation capabilities. The translation maintains context and technical accuracy while being fast and private.`,
    
    prompt: `Explain the concept of machine learning in simple terms that a beginner can understand.`
  };

  useEffect(() => {
    checkCapabilities();
  }, []);

  const checkCapabilities = async () => {
    try {
      const caps = await ChromeAiService.checkAiAvailability();
      setCapabilities(caps);
    } catch (error) {
      console.error('Failed to check AI capabilities:', error);
    }
  };

  const processWithAi = async (tool: string, options: any = {}) => {
    if (!inputText.trim()) {
      toast({
        title: "No input provided",
        description: "Please enter some text to process",
        variant: "destructive"
      });
      return;
    }

    // Check AI availability before processing
    try {
      const capabilities = await ChromeAiService.checkAiAvailability();
      
      // Check if the specific tool is available
      const toolAvailable = 
        (tool === 'summarizer' && capabilities.summarizer) ||
        (tool === 'rewriter' && (capabilities.rewriter || capabilities.promptApi)) ||
        (tool === 'writer' && (capabilities.writer || capabilities.promptApi)) ||
        (tool === 'translator' && capabilities.promptApi) ||
        (tool === 'prompt' && capabilities.promptApi);
      
      if (!toolAvailable) {
        toast({
          title: "AI Feature Not Available",
          description: `The ${tool} feature is not available. Please enable Chrome AI features and restart your browser.`,
          variant: "destructive"
        });
        return;
      }
    } catch (error) {
      console.error('Error checking AI availability:', error);
      toast({
        title: "AI Check Failed",
        description: "Unable to verify AI availability. Please try again.",
        variant: "destructive"
      });
      return;
    }

    setResults(prev => ({
      ...prev,
      [tool]: { content: '', processing: true }
    }));

    try {
      let result = '';
      
      switch (tool) {
        case 'summarizer':
          result = await ChromeAiService.summarizeText(inputText, {
            length: options.length || 'detailed',
            format: options.format || 'paragraph'
          });
          break;
          
        case 'rewriter':
          result = await ChromeAiService.rewriteText(inputText, options.tone || 'neutral');
          break;
          
        case 'writer':
          // Use prompt API for content generation
          if (window.ai?.promptApi) {
            const session = await window.ai.promptApi.create();
            result = await session.prompt(inputText);
          } else {
            throw new Error('Writer API not available');
          }
          break;
          
        case 'translator':
          const translation = await ChromeAiService.translateText(
            inputText, 
            options.targetLanguage || 'es'
          );
          result = translation.translatedText;
          break;
          
        case 'prompt':
          if (window.ai?.promptApi) {
            const session = await window.ai.promptApi.create();
            result = await session.prompt(inputText);
          } else {
            throw new Error('Prompt API not available');
          }
          break;
          
        default:
          throw new Error('Unknown AI tool');
      }

      setResults(prev => ({
        ...prev,
        [tool]: { content: result, processing: false }
      }));

      toast({
        title: "Processing Complete!",
        description: `${tool} has finished processing your text`,
      });

    } catch (error: any) {
      console.error(`${tool} error:`, error);
      
      let errorMessage = 'Processing failed';
      let errorTitle = 'Processing Failed';
      
      // Handle specific error types
      if (error.message === 'not_available' || error.name === AiErrorType.NOT_AVAILABLE) {
        errorTitle = "Chrome AI Not Available";
        errorMessage = "Chrome AI features are not available. Please enable Chrome AI flags and restart your browser.";
      } else if (error.message?.includes('Writer API not available') || error.message?.includes('Prompt API not available')) {
        errorTitle = "AI Feature Not Available";
        errorMessage = "This AI feature is not available in your current browser. Please use Chrome with AI features enabled.";
      } else if (error.name === AiErrorType.PROCESSING_ERROR) {
        errorTitle = "Processing Error";
        errorMessage = "Failed to process your text. Please try again with shorter text or check your Chrome AI settings.";
      } else {
        errorMessage = error.message || 'An unexpected error occurred while processing your text';
      }
      
      setResults(prev => ({
        ...prev,
        [tool]: { 
          content: '', 
          processing: false, 
          error: errorMessage
        }
      }));

      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Text copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy text to clipboard",
        variant: "destructive"
      });
    }
  };

  const loadSampleText = (tool: string) => {
    setInputText(sampleTexts[tool as keyof typeof sampleTexts] || '');
  };

  const aiTools = [
    {
      id: 'summarizer',
      title: 'Text Summarizer',
      description: 'Create concise summaries from long text',
      icon: FileText,
      color: 'blue',
      available: capabilities?.summarizer || capabilities?.promptApi
    },
    {
      id: 'rewriter',
      title: 'Text Rewriter',
      description: 'Improve and rephrase your text',
      icon: PenTool,
      color: 'green',
      available: capabilities?.rewriter || capabilities?.promptApi
    },
    {
      id: 'writer',
      title: 'Content Writer',
      description: 'Generate new content from prompts',
      icon: Wand2,
      color: 'purple',
      available: capabilities?.writer || capabilities?.promptApi
    },
    {
      id: 'translator',
      title: 'Language Translator',
      description: 'Translate text between languages',
      icon: Globe,
      color: 'orange',
      available: capabilities?.promptApi
    },
    {
      id: 'prompt',
      title: 'AI Assistant',
      description: 'General-purpose AI chat interface',
      icon: MessageSquare,
      color: 'pink',
      available: capabilities?.promptApi
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to TechHub
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Brain className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold">AI Tools Studio</h1>
                <Badge variant="secondary">Powered by Chrome AI</Badge>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ChromeAiStatus />
              <Link to="/proofreading">
                <Button variant="outline" size="sm" className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  Proofreading Studio
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Chrome AI Compatibility Banner */}
        <ChromeAiCompatibilityBanner className="mb-6" />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            {aiTools.map((tool) => (
              <TabsTrigger 
                key={tool.id} 
                value={tool.id}
                className="flex items-center gap-2"
                disabled={!tool.available}
              >
                <tool.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tool.title}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {aiTools.map((tool) => (
            <TabsContent key={tool.id} value={tool.id} className="space-y-6">
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-3">
                  <tool.icon className={`h-8 w-8 text-${tool.color}-500`} />
                  <h2 className="text-3xl font-bold">{tool.title}</h2>
                  {!tool.available && (
                    <Badge variant="destructive">Unavailable</Badge>
                  )}
                </div>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  {tool.description}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Input Text</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => loadSampleText(tool.id)}
                        className="gap-2"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Load Sample
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder={`Enter text for ${tool.title.toLowerCase()}...`}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="min-h-[300px] font-mono text-sm"
                    />
                    
                    {/* Tool-specific options */}
                    {tool.id === 'summarizer' && (
                      <div className="flex gap-2">
                        <Select defaultValue="detailed">
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="brief">Brief</SelectItem>
                            <SelectItem value="detailed">Detailed</SelectItem>
                            <SelectItem value="comprehensive">Comprehensive</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select defaultValue="paragraph">
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="paragraph">Paragraph</SelectItem>
                            <SelectItem value="bullets">Bullets</SelectItem>
                            <SelectItem value="outline">Outline</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {tool.id === 'rewriter' && (
                      <Select defaultValue="neutral">
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="formal">Formal</SelectItem>
                          <SelectItem value="neutral">Neutral</SelectItem>
                          <SelectItem value="casual">Casual</SelectItem>
                          <SelectItem value="professional">Professional</SelectItem>
                        </SelectContent>
                      </Select>
                    )}

                    {tool.id === 'translator' && (
                      <Select defaultValue="es">
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="de">German</SelectItem>
                          <SelectItem value="it">Italian</SelectItem>
                          <SelectItem value="pt">Portuguese</SelectItem>
                          <SelectItem value="ja">Japanese</SelectItem>
                          <SelectItem value="ko">Korean</SelectItem>
                          <SelectItem value="zh">Chinese</SelectItem>
                        </SelectContent>
                      </Select>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {inputText.length} characters
                      </span>
                      <Button
                        onClick={() => processWithAi(tool.id)}
                        disabled={!inputText.trim() || results[tool.id]?.processing || !tool.available}
                        className="gap-2"
                      >
                        {results[tool.id]?.processing ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <tool.icon className="h-4 w-4" />
                            Process with AI
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Output Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>AI Result</span>
                      {results[tool.id]?.content && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(results[tool.id].content)}
                            className="gap-2"
                          >
                            <Copy className="h-4 w-4" />
                            Copy
                          </Button>
                        </div>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {results[tool.id]?.processing ? (
                      <div className="flex items-center justify-center min-h-[300px]">
                        <div className="text-center space-y-4">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                          <p className="text-muted-foreground">Processing with AI...</p>
                          <Progress value={undefined} className="w-48" />
                        </div>
                      </div>
                    ) : results[tool.id]?.error ? (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          {results[tool.id].error}
                        </AlertDescription>
                      </Alert>
                    ) : results[tool.id]?.content ? (
                      <div className="bg-muted p-4 rounded-lg min-h-[300px] whitespace-pre-wrap text-sm">
                        {results[tool.id].content}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center min-h-[300px] text-muted-foreground">
                        <div className="text-center">
                          <tool.icon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>AI-processed text will appear here</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Tool-specific tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Tips for {tool.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {tool.id === 'summarizer' && (
                      <>
                        <div>
                          <h4 className="font-medium mb-2">Best Practices</h4>
                          <ul className="space-y-1 text-muted-foreground">
                            <li>• Use clear, well-structured text</li>
                            <li>• Longer texts produce better summaries</li>
                            <li>• Choose appropriate length and format</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Use Cases</h4>
                          <ul className="space-y-1 text-muted-foreground">
                            <li>• Research paper abstracts</li>
                            <li>• Meeting notes</li>
                            <li>• Article summaries</li>
                          </ul>
                        </div>
                      </>
                    )}
                    {tool.id === 'rewriter' && (
                      <>
                        <div>
                          <h4 className="font-medium mb-2">Improvement Areas</h4>
                          <ul className="space-y-1 text-muted-foreground">
                            <li>• Grammar and spelling</li>
                            <li>• Clarity and readability</li>
                            <li>• Tone and style</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Tone Options</h4>
                          <ul className="space-y-1 text-muted-foreground">
                            <li>• Formal: Academic, business</li>
                            <li>• Casual: Friendly, conversational</li>
                            <li>• Professional: Clear, authoritative</li>
                          </ul>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};