import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  Chrome, 
  CheckCircle, 
  ExternalLink, 
  X,
  Info
} from 'lucide-react';

interface ChromeAiCompatibilityBannerProps {
  className?: string;
}

export const ChromeAiCompatibilityBanner: React.FC<ChromeAiCompatibilityBannerProps> = ({ 
  className = "" 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [chromeAiStatus, setChromeAiStatus] = useState<'checking' | 'available' | 'unavailable' | 'demo'>('checking');

  useEffect(() => {
    checkChromeAiAvailability();
  }, []);

  const checkChromeAiAvailability = async () => {
    try {
      // Check if Chrome AI is available
      if (window.ai) {
        // Try to create a session to verify it's working
        try {
          if (window.ai.promptApi) {
            await window.ai.promptApi.create();
            setChromeAiStatus('available');
            return;
          }
        } catch (error) {
          console.warn('Chrome AI APIs not fully available:', error);
        }
      }

      // Check if we're in a demo environment
      const isDemo = window.location.hostname.includes('vercel.app') ||
                    window.location.hostname.includes('netlify.app') ||
                    window.location.hostname.includes('github.io') ||
                    window.location.hostname === 'localhost';

      if (isDemo) {
        setChromeAiStatus('demo');
      } else {
        setChromeAiStatus('unavailable');
      }
    } catch (error) {
      console.error('Error checking Chrome AI availability:', error);
      setChromeAiStatus('unavailable');
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('chrome-ai-banner-dismissed', 'true');
  };

  const openChromeFlags = () => {
    window.open('chrome://flags/#prompt-api-for-gemini-nano', '_blank');
  };

  // Don't show if dismissed or if Chrome AI is available
  if (!isVisible || chromeAiStatus === 'available') {
    return null;
  }

  // Check if banner was previously dismissed
  useEffect(() => {
    const dismissed = localStorage.getItem('chrome-ai-banner-dismissed');
    if (dismissed === 'true' && chromeAiStatus !== 'checking') {
      setIsVisible(false);
    }
  }, [chromeAiStatus]);

  const getBannerContent = () => {
    switch (chromeAiStatus) {
      case 'checking':
        return {
          variant: 'default' as const,
          icon: <Info className="h-4 w-4" />,
          title: 'Checking Chrome AI Availability...',
          description: 'Please wait while we check if Chrome AI features are available.',
          actions: null
        };

      case 'demo':
        return {
          variant: 'default' as const,
          icon: <Info className="h-4 w-4 text-blue-500" />,
          title: 'Demo Mode Active',
          description: 'Chrome AI is not available, but you can still explore all features with realistic mock data. For full functionality, use Chrome with AI flags enabled.',
          actions: (
            <div className="flex gap-2 mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={openChromeFlags}
                className="gap-1"
              >
                <Chrome className="h-3 w-3" />
                Enable Chrome AI
                <ExternalLink className="h-3 w-3" />
              </Button>
              <Badge variant="secondary">Demo Mode</Badge>
            </div>
          )
        };

      case 'unavailable':
        return {
          variant: 'destructive' as const,
          icon: <AlertTriangle className="h-4 w-4" />,
          title: 'Chrome AI Not Available',
          description: 'To experience the full AI-powered features, please use Chrome browser with experimental AI flags enabled.',
          actions: (
            <div className="flex gap-2 mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={openChromeFlags}
                className="gap-1"
              >
                <Chrome className="h-3 w-3" />
                Enable Chrome AI
                <ExternalLink className="h-3 w-3" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => window.open('https://developer.chrome.com/docs/ai', '_blank')}
                className="gap-1"
              >
                Learn More
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          )
        };

      default:
        return null;
    }
  };

  const content = getBannerContent();
  if (!content) return null;

  return (
    <Alert variant={content.variant} className={`relative ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-2 flex-1">
          {content.icon}
          <div className="flex-1">
            <div className="font-medium">{content.title}</div>
            <AlertDescription className="mt-1">
              {content.description}
            </AlertDescription>
            {content.actions}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="h-6 w-6 p-0 hover:bg-transparent"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Alert>
  );
};

// Chrome AI Setup Instructions Component
export const ChromeAiSetupInstructions: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="space-y-4">
      <Button
        variant="outline"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full justify-between"
      >
        <span className="flex items-center gap-2">
          <Chrome className="h-4 w-4" />
          Chrome AI Setup Instructions
        </span>
        <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </Button>

      {isExpanded && (
        <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
          <div className="space-y-3">
            <h3 className="font-semibold">Required Chrome Flags:</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between p-2 bg-background rounded border">
                <code className="text-xs">chrome://flags/#prompt-api-for-gemini-nano</code>
                <Badge variant="outline">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-background rounded border">
                <code className="text-xs">chrome://flags/#summarization-api-for-gemini-nano</code>
                <Badge variant="outline">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-background rounded border">
                <code className="text-xs">chrome://flags/#writer-api-for-gemini-nano</code>
                <Badge variant="outline">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-background rounded border">
                <code className="text-xs">chrome://flags/#proofreader-api-for-gemini-nano</code>
                <Badge variant="outline">Enabled</Badge>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Setup Steps:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Open Chrome browser (version 118+)</li>
              <li>Navigate to <code>chrome://flags</code></li>
              <li>Search for "Gemini Nano" flags</li>
              <li>Enable all four flags listed above</li>
              <li>Restart Chrome browser</li>
              <li>Wait for Gemini Nano model to download (automatic)</li>
              <li>Refresh this page to use AI features</li>
            </ol>
          </div>

          <div className="flex gap-2">
            <Button 
              size="sm" 
              onClick={() => window.open('chrome://flags', '_blank')}
              className="gap-1"
            >
              <Chrome className="h-3 w-3" />
              Open Chrome Flags
              <ExternalLink className="h-3 w-3" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open('https://developer.chrome.com/docs/ai', '_blank')}
              className="gap-1"
            >
              Documentation
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};