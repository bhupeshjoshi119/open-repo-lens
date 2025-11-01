import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain,
  Sparkles,
  FileText,
  PenTool,
  Globe,
  MessageSquare,
  Image as ImageIcon,
  TrendingUp,
  BarChart3,
  Chrome,
  ChevronDown,
  ExternalLink,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AiNavigationMenuProps {
  variant?: 'button' | 'floating' | 'header';
  className?: string;
}

export const AiNavigationMenu: React.FC<AiNavigationMenuProps> = ({ 
  variant = 'button',
  className = '' 
}) => {
  const aiFeatures = [
    {
      id: 'ai-tools',
      title: 'AI Tools Studio',
      description: 'Complete suite of text processing tools',
      icon: Brain,
      link: '/ai-tools',
      badge: 'Popular',
      color: 'text-blue-500'
    },
    {
      id: 'proofreading',
      title: 'Proofreading Studio',
      description: 'Advanced grammar and style checking',
      icon: Sparkles,
      link: '/proofreading',
      badge: 'Experimental',
      color: 'text-purple-500'
    },
    {
      id: 'chrome-ai-demo',
      title: 'Chrome AI Demo',
      description: 'Explore all Chrome AI capabilities',
      icon: Chrome,
      link: '/chrome-ai-demo',
      badge: 'Demo',
      color: 'text-green-500'
    },
    {
      id: 'ai-dashboard',
      title: 'AI Dashboard',
      description: 'Monitor AI usage and capabilities',
      icon: BarChart3,
      link: '/ai-dashboard',
      badge: 'New',
      color: 'text-orange-500'
    }
  ];

  const quickTools = [
    {
      id: 'summarizer',
      title: 'Text Summarizer',
      icon: FileText,
      link: '/ai-tools?tab=summarizer'
    },
    {
      id: 'rewriter',
      title: 'Text Rewriter',
      icon: PenTool,
      link: '/ai-tools?tab=rewriter'
    },
    {
      id: 'translator',
      title: 'Translator',
      icon: Globe,
      link: '/ai-tools?tab=translator'
    },
    {
      id: 'chat',
      title: 'AI Assistant',
      icon: MessageSquare,
      link: '/ai-tools?tab=prompt'
    }
  ];

  const getButtonContent = () => {
    switch (variant) {
      case 'floating':
        return (
          <Button 
            size="lg" 
            className={`rounded-full shadow-lg gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 ${className}`}
          >
            <Sparkles className="h-5 w-5" />
            AI Tools
            <ChevronDown className="h-4 w-4" />
          </Button>
        );
      case 'header':
        return (
          <Button variant="ghost" className={`gap-2 ${className}`}>
            <Brain className="h-4 w-4" />
            AI Tools
            <ChevronDown className="h-4 w-4" />
          </Button>
        );
      default:
        return (
          <Button variant="outline" className={`gap-2 ${className}`}>
            <Zap className="h-4 w-4" />
            AI Tools
            <ChevronDown className="h-4 w-4" />
          </Button>
        );
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {getButtonContent()}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Brain className="h-4 w-4" />
          AI-Powered Tools
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Main AI Features */}
        {aiFeatures.map((feature) => {
          const Icon = feature.icon;
          return (
            <DropdownMenuItem key={feature.id} asChild>
              <Link to={feature.link} className="flex items-center gap-3 p-3 cursor-pointer">
                <Icon className={`h-5 w-5 ${feature.color}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{feature.title}</span>
                    <Badge variant="secondary" className="text-xs">
                      {feature.badge}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {feature.description}
                  </p>
                </div>
              </Link>
            </DropdownMenuItem>
          );
        })}

        <DropdownMenuSeparator />
        <DropdownMenuLabel>Quick Tools</DropdownMenuLabel>
        
        {/* Quick Access Tools */}
        <div className="grid grid-cols-2 gap-1 p-2">
          {quickTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <DropdownMenuItem key={tool.id} asChild>
                <Link 
                  to={tool.link} 
                  className="flex flex-col items-center gap-2 p-3 text-center cursor-pointer rounded-md hover:bg-accent"
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-xs font-medium">{tool.title}</span>
                </Link>
              </DropdownMenuItem>
            );
          })}
        </div>

        <DropdownMenuSeparator />
        
        {/* Chrome AI Status */}
        <div className="p-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Chrome AI Status</span>
            <Badge variant="outline" className="text-xs">
              Local Processing
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Chrome className="h-3 w-3" />
            <span>Privacy-first AI processing</span>
          </div>
        </div>

        <DropdownMenuSeparator />
        
        {/* External Links */}
        <DropdownMenuItem asChild>
          <a 
            href="chrome://flags" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 cursor-pointer"
          >
            <Chrome className="h-4 w-4" />
            Chrome AI Settings
            <ExternalLink className="h-3 w-3 ml-auto" />
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};