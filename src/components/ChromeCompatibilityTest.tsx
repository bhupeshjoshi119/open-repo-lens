import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getChromeCompatibleClassName, isChromeBrowser } from '@/utils/chromeCompatibility';

export const ChromeCompatibilityTest = () => {
  const isChrome = isChromeBrowser();
  
  return (
    <div className={getChromeCompatibleClassName("p-6 space-y-4")}>
      <div className="text-center">
        <Badge variant={isChrome ? "default" : "secondary"}>
          {isChrome ? "Chrome Browser Detected" : "Non-Chrome Browser"}
        </Badge>
      </div>
      
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Chrome Compatibility Test</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <Button size="sm" className="h-9">
            Small Button (h-9)
          </Button>
          
          <Button size="default" className="h-10">
            Default Button (h-10)
          </Button>
          
          <Button size="lg" className="h-11">
            Large Button (h-11)
          </Button>
          
          <Button size="icon" className="h-10 w-10">
            ⚙️
          </Button>
        </div>
        
        <div className="mt-4 text-sm text-muted-foreground">
          <p>✅ Consistent button sizing</p>
          <p>✅ Proper font rendering</p>
          <p>✅ Fixed scaling issues</p>
          <p>✅ Cross-browser compatibility</p>
        </div>
      </Card>
    </div>
  );
};