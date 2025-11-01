import React, { useState, useEffect } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Info,
  Chrome,
  Loader2
} from 'lucide-react';
import ChromeAiService from '../services/chromeAiService';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';

interface ChromeAiStatusProps {
  className?: string;
  showDetails?: boolean;
}

export const ChromeAiStatus: React.FC<ChromeAiStatusProps> = ({
  className = '',
  showDetails = false
}) => {
  const [capabilities, setCapabilities] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkCapabilities = async () => {
      try {
        setLoading(true);
        const caps = await ChromeAiService.checkAiAvailability();
        setCapabilities(caps);
        setError(null);
      } catch (err) {
        console.error('Failed to check AI capabilities:', err);
        setError('Failed to check AI capabilities');
      } finally {
        setLoading(false);
      }
    };

    checkCapabilities();
  }, []);

  const getOverallStatus = () => {
    if (!capabilities) return 'unknown';
    
    const hasAnyAi = capabilities.promptApi || capabilities.summarizer || 
                     capabilities.translator || capabilities.writer;
    
    if (hasAnyAi) return 'available';
    return 'unavailable';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'unavailable':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'default';
      case 'unavailable':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Chrome AI Available';
      case 'unavailable':
        return 'Chrome AI Unavailable';
      default:
        return 'Checking AI Status';
    }
  };

  if (loading) {
    return (
      <Badge variant="secondary" className={className}>
        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
        Checking AI...
      </Badge>
    );
  }

  if (error) {
    return (
      <Badge variant="destructive" className={className}>
        <AlertCircle className="h-3 w-3 mr-1" />
        AI Error
      </Badge>
    );
  }

  const status = getOverallStatus();

  if (!showDetails) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className={`gap-2 ${className}`}>
            {getStatusIcon(status)}
            <span className="text-xs">{getStatusText(status)}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <ChromeAiStatusDetails capabilities={capabilities} />
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Chrome className="h-5 w-5" />
          Chrome AI Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChromeAiStatusDetails capabilities={capabilities} />
      </CardContent>
    </Card>
  );
};

const ChromeAiStatusDetails: React.FC<{ capabilities: any }> = ({ capabilities }) => {
  if (!capabilities) return null;

  const features = [
    {
      name: 'Prompt API',
      available: capabilities.promptApi,
      description: 'General AI text processing'
    },
    {
      name: 'Summarizer',
      available: capabilities.summarizer,
      description: 'Text summarization'
    },
    {
      name: 'Writer',
      available: capabilities.writer,
      description: 'Text writing assistance'
    },
    {
      name: 'Rewriter',
      available: capabilities.rewriter,
      description: 'Text rewriting and improvement'
    },
    {
      name: 'Proofreader',
      available: capabilities.proofreader,
      description: 'Grammar and writing quality checks'
    }
  ];

  const availableCount = features.filter(f => f.available).length;
  const totalCount = features.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">AI Features</span>
        <Badge variant={availableCount > 0 ? "default" : "secondary"}>
          {availableCount}/{totalCount} Available
        </Badge>
      </div>

      <div className="space-y-2">
        {features.map((feature) => (
          <div key={feature.name} className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {feature.available ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm font-medium">{feature.name}</span>
              </div>
              <p className="text-xs text-muted-foreground ml-6">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {availableCount === 0 && (
        <div className="p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-yellow-600 mt-0.5" />
            <div className="text-xs text-yellow-800 dark:text-yellow-200">
              <p className="font-medium mb-1">Chrome AI Not Available</p>
              <p>
                To use AI features, please ensure you're using Chrome with AI capabilities enabled. 
                Some features may require Chrome Canary or specific flags.
              </p>
            </div>
          </div>
        </div>
      )}

      {capabilities.supportedLanguages && capabilities.supportedLanguages.length > 0 && (
        <div>
          <span className="text-sm font-medium">Supported Languages</span>
          <div className="flex flex-wrap gap-1 mt-2">
            {capabilities.supportedLanguages.slice(0, 6).map((lang: string) => (
              <Badge key={lang} variant="outline" className="text-xs">
                {lang.toUpperCase()}
              </Badge>
            ))}
            {capabilities.supportedLanguages.length > 6 && (
              <Badge variant="outline" className="text-xs">
                +{capabilities.supportedLanguages.length - 6} more
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
};