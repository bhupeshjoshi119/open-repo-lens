import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { CustomScrollArea } from './ui/custom-scrollbar';
import { ContentInput } from './ContentInput';
import { LanguageSelector } from './LanguageSelector';
import { useAiTextProcessor } from '../hooks/useAiTextProcessor';
import ChromeAiService from '../services/chromeAiService';
import { 
  ProcessedText, 
  ContentMetadata, 
  ProcessingOperation,
  SummaryOptions,
  ComplexityLevel,
  QuestionType 
} from '../types/chromeAi';
import { 
  Brain, 
  FileText, 
  Languages, 
  CheckCircle, 
  HelpCircle, 
  Download,
  Loader2,
  AlertCircle,
  Sparkles,
  FileJson,
  FileText as FileTextIcon
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';

interface ResearchSimplifierProps {
  initialText?: string;
  onTextProcessed?: (result: ProcessedText) => void;
  className?: string;
}

export const ResearchSimplifier: React.FC<ResearchSimplifierProps> = ({
  initialText,
  onTextProcessed,
  className = ''
}) => {
  const [currentContent, setCurrentContent] = useState(initialText || '');
  const [contentMetadata, setContentMetadata] = useState<ContentMetadata | null>(null);
  const [selectedOperations, setSelectedOperations] = useState<ProcessingOperation[]>([]);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('input');
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [detectedLanguage, setDetectedLanguage] = useState<string>('en');
  const { toast } = useToast();

  const {
    capabilities,
    isProcessing,
    error,
    processedResults,
    processText,
    summarizeText,
    simplifyText,
    translateText,
    proofreadText,
    generateStudyQuestions,
    clearResults,
    clearError
  } = useAiTextProcessor();

  const handleContentLoaded = useCallback(async (content: string, metadata: ContentMetadata) => {
    setCurrentContent(content);
    setContentMetadata(metadata);
    setActiveTab('operations');
    clearResults();
    clearError();
    
    // Detect language
    try {
      const detected = await ChromeAiService.detectLanguage(content);
      setDetectedLanguage(detected);
    } catch (err) {
      console.error('Language detection failed:', err);
    }
  }, [clearResults, clearError]);

  const handleOperationToggle = useCallback((operation: ProcessingOperation) => {
    setSelectedOperations(prev => 
      prev.includes(operation)
        ? prev.filter(op => op !== operation)
        : [...prev, operation]
    );
  }, []);

  const handleProcessText = useCallback(async () => {
    if (!currentContent.trim() || selectedOperations.length === 0) return;

    try {
      setProcessingProgress(0);
      setActiveTab('results');

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const results = await processText(currentContent, selectedOperations);
      
      clearInterval(progressInterval);
      setProcessingProgress(100);
      
      if (onTextProcessed) {
        onTextProcessed(results);
      }
    } catch (err) {
      console.error('Processing failed:', err);
      // Error is already handled by the hook
    }
  }, [currentContent, selectedOperations, processText, onTextProcessed]);

  const handleErrorResearch = useCallback(async () => {
    if (!currentContent.trim()) return;

    const errorResearchPrompt = `Analyze this content for potential errors, issues, or problems. Identify:
1. Technical errors or bugs
2. Logical inconsistencies
3. Missing information
4. Potential improvements
5. Best practices violations

Content to analyze:
${currentContent}`;

    try {
      setActiveTab('results');
      const results = await processText(errorResearchPrompt, ['summarize', 'generate-questions']);
      
      if (onTextProcessed) {
        onTextProcessed(results);
      }
    } catch (err) {
      console.error('Error research failed:', err);
    }
  }, [currentContent, processText, onTextProcessed]);

  const operationOptions = [
    {
      id: 'summarize' as ProcessingOperation,
      label: 'Summarize',
      description: 'Create a concise summary of the content',
      icon: FileText,
      available: capabilities?.summarizer || capabilities?.promptApi
    },
    {
      id: 'simplify' as ProcessingOperation,
      label: 'Simplify',
      description: 'Make complex text easier to understand',
      icon: Brain,
      available: capabilities?.writer || capabilities?.promptApi
    },
    {
      id: 'translate' as ProcessingOperation,
      label: 'Translate',
      description: 'Translate to different languages',
      icon: Languages,
      available: capabilities?.promptApi
    },
    {
      id: 'proofread' as ProcessingOperation,
      label: 'Proofread',
      description: 'Check grammar and improve writing',
      icon: CheckCircle,
      available: capabilities?.writer || capabilities?.promptApi
    },
    {
      id: 'rewrite' as ProcessingOperation,
      label: 'Rewrite Text',
      description: 'Rewrite and improve text style',
      icon: CheckCircle,
      available: capabilities?.rewriter || capabilities?.promptApi
    },
    {
      id: 'generate-questions' as ProcessingOperation,
      label: 'Study Questions',
      description: 'Generate questions for studying',
      icon: HelpCircle,
      available: capabilities?.promptApi || capabilities?.writer
    }
  ];

  const exportResults = useCallback(async (format: 'json' | 'jsonl' | 'pdf' | 'all' = 'all') => {
    if (!processedResults) return;

    const { 
      exportAsAITrainingJSON, 
      exportAsJSONL, 
      exportAsPDFReport,
      downloadJSON,
      downloadJSONL,
      exportAllFormats
    } = await import('../utils/aiTrainingExport');

    const baseName = `ai-processing-${Date.now()}`;

    try {
      switch (format) {
        case 'json':
          const jsonData = exportAsAITrainingJSON(processedResults, {
            contentType: contentMetadata?.type || 'text',
            processingOperations: Object.keys(processedResults).filter(k => k !== 'original')
          });
          downloadJSON(jsonData, `${baseName}-training-data.json`);
          break;
          
        case 'jsonl':
          const jsonlData = exportAsJSONL(processedResults);
          downloadJSONL(jsonlData, `${baseName}-training-data.jsonl`);
          break;
          
        case 'pdf':
          await exportAsPDFReport(processedResults, 'AI Processing Report');
          break;
          
        case 'all':
          await exportAllFormats(processedResults, baseName);
          break;
      }
      
      toast({
        title: "Export Successful",
        description: `Results exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export results. Please try again.",
        variant: "destructive",
      });
    }
  }, [processedResults, contentMetadata]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* AI Capabilities Status */}
      {capabilities && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Chrome AI Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge variant={capabilities.promptApi ? "default" : "secondary"}>
                Prompt API: {capabilities.promptApi ? 'Available' : 'Unavailable'}
              </Badge>
              <Badge variant={capabilities.summarizer ? "default" : "secondary"}>
                Summarizer: {capabilities.summarizer ? 'Available' : 'Unavailable'}
              </Badge>
              <Badge variant={capabilities.promptApi ? "default" : "secondary"}>
                Translator: {capabilities.promptApi ? 'Available' : 'Unavailable'}
              </Badge>
              <Badge variant={capabilities.writer ? "default" : "secondary"}>
                Writer: {capabilities.writer ? 'Available' : 'Unavailable'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
              <Button variant="ghost" size="sm" onClick={clearError}>
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="input">Input Content</TabsTrigger>
          <TabsTrigger value="operations" disabled={!currentContent}>
            Select Operations
          </TabsTrigger>
          <TabsTrigger value="results" disabled={!processedResults}>
            View Results
          </TabsTrigger>
        </TabsList>

        <TabsContent value="input" className="space-y-4">
          <ContentInput
            onContentLoaded={handleContentLoaded}
            supportedFormats={['pdf', 'txt', 'html', 'md']}
            maxSize={10 * 1024 * 1024}
          />
          
          {currentContent && (
            <Card>
              <CardHeader>
                <CardTitle>Current Content</CardTitle>
                {contentMetadata && (
                  <div className="flex gap-2">
                    <Badge>{contentMetadata.type}</Badge>
                    <Badge variant="outline">{contentMetadata.source}</Badge>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="max-h-40 overflow-y-auto bg-gray-50 p-3 rounded text-sm">
                  {currentContent.substring(0, 500)}
                  {currentContent.length > 500 && '...'}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {currentContent.length} characters
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="operations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Select AI Operations</CardTitle>
              <p className="text-sm text-gray-600">
                Choose which AI operations to apply to your content
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {operationOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = selectedOperations.includes(option.id);
                  const isAvailable = option.available;

                  return (
                    <Card
                      key={option.id}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'ring-2 ring-primary' : ''
                      } ${!isAvailable ? 'opacity-50' : ''}`}
                      onClick={() => isAvailable && handleOperationToggle(option.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Icon className="h-5 w-5 mt-1" />
                          <div className="flex-1">
                            <h3 className="font-medium">{option.label}</h3>
                            <p className="text-sm text-gray-600">{option.description}</p>
                            {!isAvailable && (
                              <Badge variant="secondary" className="mt-2">
                                Not Available
                              </Badge>
                            )}
                          </div>
                          {isSelected && (
                            <CheckCircle className="h-5 w-5 text-primary" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    {selectedOperations.length} operation(s) selected
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleErrorResearch}
                      disabled={!currentContent.trim() || isProcessing}
                      variant="outline"
                      className="flex items-center gap-2 h-9 min-h-[2.25rem] max-h-[2.25rem]"
                      size="default"
                      style={{ height: '2.25rem' }}
                    >
                      <AlertCircle className="h-4 w-4" />
                      Error Research
                    </Button>
                    <Button
                      onClick={handleProcessText}
                      disabled={selectedOperations.length === 0 || isProcessing}
                      className="flex items-center gap-2 h-9 min-h-[2.25rem] max-h-[2.25rem]"
                      size="default"
                      style={{ height: '2.25rem' }}
                    >
                      {isProcessing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                      {isProcessing ? 'Processing...' : 'Process Content'}
                    </Button>
                  </div>
                </div>
                
                {currentContent && (
                  <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                    <strong>Quick Actions:</strong> Use "Error Research" to automatically analyze content for issues, 
                    or select specific operations above for custom processing.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {isProcessing && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Processing content...</span>
                    <span>{processingProgress}%</span>
                  </div>
                  <Progress value={processingProgress} />
                </div>
              </CardContent>
            </Card>
          )}

          {processedResults && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Processing Results</h2>
                <div className="flex gap-2">
                  <Button onClick={() => exportResults('pdf')} variant="outline" size="sm">
                    <FileTextIcon className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                  <Button onClick={() => exportResults('json')} variant="outline" size="sm">
                    <FileJson className="h-4 w-4 mr-2" />
                    JSON
                  </Button>
                  <Button onClick={() => exportResults('jsonl')} variant="outline" size="sm">
                    <FileJson className="h-4 w-4 mr-2" />
                    JSONL
                  </Button>
                  <Button onClick={() => exportResults('all')} variant="default" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export All
                  </Button>
                </div>
              </div>

              {processedResults.summary && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      {processedResults.summary}
                    </div>
                  </CardContent>
                </Card>
              )}

              {processedResults.simplified && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      Simplified Text
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      {processedResults.simplified}
                    </div>
                  </CardContent>
                </Card>
              )}

              {processedResults.translated && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Languages className="h-5 w-5" />
                      Translation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      {processedResults.translated}
                    </div>
                  </CardContent>
                </Card>
              )}

              {processedResults.rewrite && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Rewritten Text
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      {processedResults.rewrite}
                    </div>
                  </CardContent>
                </Card>
              )}

              {processedResults.proofread && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Proofreading Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="prose max-w-none">
                        {processedResults.proofread.correctedText}
                      </div>
                      {processedResults.proofread.suggestions && 
                       processedResults.proofread.suggestions.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Suggestions:</h4>
                          <div className="space-y-2">
                            {processedResults.proofread.suggestions.map((suggestion, index) => (
                              <div key={index} className="p-2 bg-gray-50 rounded">
                                <Badge className="mb-1">{suggestion.type}</Badge>
                                <p className="text-sm">{suggestion.explanation}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {processedResults.studyQuestions && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <HelpCircle className="h-5 w-5" />
                      Study Questions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {processedResults.studyQuestions.map((question, index) => (
                        <div key={question.id || index} className="p-4 border rounded">
                          <div className="flex gap-2 mb-2">
                            <Badge>{question.type}</Badge>
                            <Badge variant="outline">{question.difficulty}</Badge>
                          </div>
                          <h4 className="font-medium mb-2">{question.question}</h4>
                          {question.options && (
                            <ul className="list-disc list-inside space-y-1 text-sm">
                              {question.options.map((option, optIndex) => (
                                <li key={optIndex}>{option}</li>
                              ))}
                            </ul>
                          )}
                          {question.explanation && (
                            <p className="text-sm text-gray-600 mt-2">
                              <strong>Explanation:</strong> {question.explanation}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};