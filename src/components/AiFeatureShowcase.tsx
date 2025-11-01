import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Brain, 
  FileText, 
  PenTool, 
  Globe, 
  MessageSquare,
  Image as ImageIcon,
  TrendingUp,
  Zap,
  Chrome,
  ArrowRight,
  CheckCircle2,
  Star
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AiFeatureShowcase: React.FC = () => {
  const aiFeatures = [
    {
      id: 'proofreading',
      title: 'AI Proofreading Studio',
      description: 'Advanced grammar checking with side-by-side comparison and detailed PDF reports',
      icon: Sparkles,
      color: 'from-purple-500 to-pink-500',
      link: '/proofreading',
      badge: 'Experimental',
      features: [
        'Real-time grammar checking',
        'Side-by-side comparison',
        'Professional PDF export',
        'Detailed explanations'
      ]
    },
    {
      id: 'ai-tools',
      title: 'AI Tools Studio',
      description: 'Complete suite of text processing tools powered by Chrome AI',
      icon: Brain,
      color: 'from-blue-500 to-cyan-500',
      link: '/ai-tools',
      badge: 'New',
      features: [
        'Text summarization',
        'Content rewriting',
        'Language translation',
        'AI chat assistant'
      ]
    },
    {
      id: 'image-analysis',
      title: 'AI Image Analysis',
      description: 'Analyze images with object detection and technical insights',
      icon: ImageIcon,
      color: 'from-green-500 to-emerald-500',
      link: '/ai-tools',
      badge: 'Beta',
      features: [
        'Object detection',
        'Image classification',
        'Technical metadata',
        'Privacy-first processing'
      ]
    },
    {
      id: 'predictive',
      title: 'Predictive Analytics',
      description: 'Forecast repository trends and growth patterns',
      icon: TrendingUp,
      color: 'from-orange-500 to-red-500',
      link: '/chrome-ai-demo',
      badge: 'Advanced',
      features: [
        'Growth prediction',
        'Issue trend analysis',
        'Contributor forecasting',
        'Health assessment'
      ]
    }
  ];

  const capabilities = [
    {
      icon: Chrome,
      title: 'Chrome AI Powered',
      description: 'Built on Chrome\'s Gemini Nano for local processing'
    },
    {
      icon: Zap,
      title: 'Privacy First',
      description: 'All processing happens locally in your browser'
    },
    {
      icon: CheckCircle2,
      title: 'No API Keys',
      description: 'No external services or authentication required'
    },
    {
      icon: Star,
      title: 'Professional Quality',
      description: 'Enterprise-grade AI tools for developers'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
          <Sparkles className="h-6 w-6 text-primary animate-pulse" />
          <span className="text-lg font-semibold text-primary">
            AI-Powered Development Tools
          </span>
        </div>
        <h2 className="text-3xl font-bold">
          Supercharge Your Workflow with Chrome AI
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Experience cutting-edge AI tools that run entirely in your browser. 
          From advanced proofreading to predictive analytics, enhance your productivity with privacy-first AI.
        </p>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {aiFeatures.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card 
              key={feature.id}
              className="group hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${feature.color} shadow-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {feature.badge}
                  </Badge>
                </div>
                <CardTitle className="text-xl group-hover:text-primary transition-colors">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
                
                <div className="space-y-2">
                  {feature.features.map((feat, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                <Link to={feature.link}>
                  <Button className="w-full group-hover:bg-primary/90 transition-colors gap-2">
                    Try {feature.title}
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Capabilities Section */}
      <Card className="bg-gradient-to-r from-muted/50 to-muted/30 border-0">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Why Choose Our AI Tools?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {capabilities.map((capability, index) => {
              const Icon = capability.icon;
              return (
                <div key={index} className="text-center space-y-3">
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">{capability.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {capability.description}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Access */}
      <div className="flex flex-wrap justify-center gap-4">
        <Link to="/ai-tools">
          <Button size="lg" className="gap-2">
            <Brain className="h-5 w-5" />
            Explore All AI Tools
          </Button>
        </Link>
        <Link to="/proofreading">
          <Button variant="outline" size="lg" className="gap-2">
            <Sparkles className="h-5 w-5" />
            Try Proofreading Studio
          </Button>
        </Link>
        <Link to="/chrome-ai-demo">
          <Button variant="outline" size="lg" className="gap-2">
            <Chrome className="h-5 w-5" />
            View Chrome AI Demo
          </Button>
        </Link>
      </div>
    </div>
  );
};