import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResearchSimplifier } from '@/components/ResearchSimplifier';
import { AiRepositoryAnalyzer } from '@/components/AiRepositoryAnalyzer';
import { ChromeAiStatus } from '@/components/ChromeAiStatus';
import { 
  Sparkles, 
  Brain, 
  Code2, 
  FileText, 
  Languages,
  CheckCircle,
  HelpCircle,
  ArrowLeft,
  Chrome,
  Zap,
  Target,
  BookOpen
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Sample repository for demo
const sampleRepository = {
  id: 1,
  full_name: 'facebook/react',
  description: 'A declarative, efficient, and flexible JavaScript library for building user interfaces.',
  html_url: 'https://github.com/facebook/react',
  language: 'JavaScript',
  stargazers_count: 220000,
  forks_count: 45000,
  open_issues_count: 800,
  created_at: '2013-05-24T16:15:54Z',
  updated_at: '2024-01-15T10:30:00Z',
  topics: ['javascript', 'react', 'frontend', 'ui', 'library'],
  license: { name: 'MIT License' }
};

const sampleText = `
Artificial Intelligence (AI) has revolutionized the way we approach software development and data analysis. 
Machine learning algorithms can now process vast amounts of information, identify patterns, and make predictions 
with unprecedented accuracy. In the context of web development, AI-powered tools are becoming increasingly 
sophisticated, offering developers new ways to optimize code, enhance user experiences, and automate repetitive tasks.

The integration of AI into browsers, such as Chrome's built-in AI capabilities powered by Gemini Nano, 
represents a significant leap forward in making AI accessible to everyday users. These on-device AI models 
can perform tasks like text summarization, language translation, and content analysis without requiring 
external API calls, ensuring privacy and reducing latency.

For developers and researchers, this means having powerful AI tools directly available in their workflow, 
enabling real-time analysis of documentation, code review assistance, and intelligent content processing. 
The potential applications are vast, from educational tools that simplify complex technical documentation 
to productivity enhancers that help developers understand and work with large codebases more effectively.
`;

export const ChromeAiDemo: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState<string>('overview');

  const demoFeatures = [
    {
      id: 'repository-analysis',
      title: 'AI Repository Analysis',
      description: 'Analyze GitHub repositories with AI-powered insights',
      icon: Code2,
      color: 'blue'
    },
    {
      id: 'text-processing',
      title: 'Research Simplifier',
      description: 'Process and simplify complex text content',
      icon: FileText,
      color: 'green'
    },
    {
      id: 'translation',
      title: 'Language Translation',
      description: 'Translate content between multiple languages',
      icon: Languages,
      color: 'purple'
    },
    {
      id: 'proofreading',
      title: 'Text Proofreading',
      description: 'Improve grammar and writing quality',
      icon: CheckCircle,
      color: 'orange'
    },
    {
      id: 'study-questions',
      title: 'Study Questions',
      description: 'Generate educational content and quizzes',
      icon: HelpCircle,
      color: 'pink'
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
                <Chrome className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold">Chrome AI Demo</h1>
                <Badge variant="secondary">Powered by Gemini Nano</Badge>
              </div>
            </div>
            <ChromeAiStatus />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeDemo} onValueChange={setActiveDemo}>
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="repository-analysis">Repository AI</TabsTrigger>
            <TabsTrigger value="text-processing">Text Processing</TabsTrigger>
            <TabsTrigger value="translation">Translation</TabsTrigger>
            <TabsTrigger value="proofreading">Proofreading</TabsTrigger>
            <TabsTrigger value="study-questions">Study Tools</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-primary/10 border border-primary/20">
                <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                <span className="text-lg font-semibold text-primary">
                  Chrome AI Integration Demo
                </span>
              </div>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Experience the power of Chrome's built-in AI capabilities integrated into TechHub. 
                All processing happens locally in your browser for privacy and speed.
              </p>
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {demoFeatures.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Card 
                    key={feature.id}
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                    onClick={() => setActiveDemo(feature.id)}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Icon className={`h-5 w-5 text-${feature.color}-500`} />
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full mt-4"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDemo(feature.id);
                        }}
                      >
                        Try Demo
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Chrome AI Status */}
            <ChromeAiStatus showDetails className="max-w-2xl mx-auto" />

            {/* Getting Started */}
            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Getting Started with Chrome AI
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <Target className="h-4 w-4 text-green-500" />
                      Requirements
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Chrome browser (latest version)</li>
                      <li>• Chrome AI features enabled</li>
                      <li>• Gemini Nano model available</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <Zap className="h-4 w-4 text-blue-500" />
                      Features
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Local AI processing (privacy-first)</li>
                      <li>• No external API calls required</li>
                      <li>• Real-time text analysis</li>
                      <li>• Multi-language support</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="repository-analysis" className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">AI Repository Analysis</h2>
              <p className="text-muted-foreground">
                Analyze GitHub repositories with AI-powered insights and recommendations
              </p>
            </div>
            <AiRepositoryAnalyzer repository={sampleRepository} />
          </TabsContent>

          <TabsContent value="text-processing" className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Research Simplifier</h2>
              <p className="text-muted-foreground">
                Process and simplify complex text content using Chrome AI
              </p>
            </div>
            <ResearchSimplifier initialText={sampleText} />
          </TabsContent>

          <TabsContent value="translation" className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Language Translation</h2>
              <p className="text-muted-foreground">
                Translate content between multiple languages using Chrome's Translator API
              </p>
            </div>
            <ResearchSimplifier 
              initialText="Hello, this is a sample text for translation. Chrome AI can translate this into multiple languages while preserving the meaning and context."
            />
          </TabsContent>

          <TabsContent value="proofreading" className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold">Text Proofreading</h2>
              <p className="text-muted-foreground">
                Improve grammar, style, and clarity using Chrome's Writer API
              </p>
              <div className="flex justify-center">
                <Link to="/proofreading">
                  <Button className="gap-2" size="lg">
                    <Sparkles className="h-5 w-5" />
                    Open Advanced Proofreading Studio
                    <Badge variant="secondary" className="ml-2">Experimental</Badge>
                  </Button>
                </Link>
              </div>
            </div>
            <ResearchSimplifier 
              initialText="This is a sample text with some grammer mistakes and awkward phrasing that can be improved. The AI will help identify issues and suggest better alternatives for clearer communication."
            />
          </TabsContent>

          <TabsContent value="study-questions" className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Study Question Generator</h2>
              <p className="text-muted-foreground">
                Generate educational content and quiz questions from any text
              </p>
            </div>
            <ResearchSimplifier 
              initialText="Machine learning is a subset of artificial intelligence that focuses on algorithms that can learn and make decisions from data. It includes supervised learning (with labeled data), unsupervised learning (finding patterns in unlabeled data), and reinforcement learning (learning through trial and error with rewards)."
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};