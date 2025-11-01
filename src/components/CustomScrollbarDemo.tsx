import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomScrollArea } from '@/components/ui/custom-scrollbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Palette, Smartphone, Monitor } from 'lucide-react';

export const CustomScrollbarDemo = () => {
  const demoContent = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    title: `Demo Item ${i + 1}`,
    description: `This is a sample item to demonstrate the beautiful custom scrollbar with responsive design and smooth animations.`,
    type: ['Feature', 'Enhancement', 'Bug Fix', 'Documentation'][i % 4]
  }));

  return (
    <div className="space-y-6 p-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Sparkles className="h-8 w-8 text-blue-500" />
          Custom Scrollbar Demo
        </h1>
        <p className="text-muted-foreground">
          Beautiful, responsive scrollbars with blue gradients and smooth animations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Demo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Scrollable Content
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Scroll to see the beautiful custom scrollbar in action
            </p>
          </CardHeader>
          <CardContent>
            <CustomScrollArea className="h-[400px] w-full rounded-md border p-4">
              <div className="space-y-3">
                {demoContent.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                    <Badge variant="outline">{item.type}</Badge>
                  </div>
                ))}
              </div>
            </CustomScrollArea>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle>Scrollbar Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Beautiful blue gradient design</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Responsive sizing for all devices</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Smooth hover animations</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Touch-friendly on mobile</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Backdrop blur effects</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Subtle shadow and glow effects</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Automatic horizontal and vertical scrollbars</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Perfect for GitHub API reports and wide content</span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Responsive Design
              </h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Mobile: Thinner, touch-optimized</p>
                <p>• Tablet: Balanced size and usability</p>
                <p>• Desktop: Full-featured with hover effects</p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                Implementation
              </h4>
              <div className="text-sm text-muted-foreground">
                <p>Simply replace ScrollArea with CustomScrollArea in your components for instant beautiful scrollbars.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Horizontal Scroll Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Horizontal Scrolling</CardTitle>
          <p className="text-sm text-muted-foreground">
            The custom scrollbar now includes both vertical and horizontal scrollbars automatically
          </p>
        </CardHeader>
        <CardContent>
          <CustomScrollArea className="w-full rounded-md border" style={{ maxHeight: '300px' }}>
            <div className="flex w-max space-x-4 p-4">
              {Array.from({ length: 20 }, (_, i) => (
                <Card key={i} className="w-[200px] flex-shrink-0">
                  <CardContent className="p-4">
                    <h3 className="font-medium">Card {i + 1}</h3>
                    <p className="text-sm text-muted-foreground">
                      Horizontal scroll demo with beautiful blue scrollbars
                    </p>
                    <div className="mt-2 space-y-1">
                      <div className="text-xs text-muted-foreground">Feature {i + 1}</div>
                      <div className="text-xs text-muted-foreground">Status: Active</div>
                      <div className="text-xs text-muted-foreground">Version: 1.{i}.0</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CustomScrollArea>
        </CardContent>
      </Card>

      {/* Usage Example */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Example</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted rounded-lg p-4">
            <pre className="text-sm">
{`import { CustomScrollArea } from '@/components/ui/custom-scrollbar';
import { HorizontalScrollArea } from '@/components/ui/horizontal-scroll-area';
import { GitHubReportViewer } from '@/components/GitHubReportViewer';

// Basic usage with both scrollbars
<CustomScrollArea className="h-[400px]">
  <div className="min-w-max space-y-4">
    {/* Your scrollable content */}
  </div>
</CustomScrollArea>

// Specialized horizontal scrolling
<HorizontalScrollArea maxHeight="300px">
  <div className="min-w-max">
    {/* Wide content like tables or reports */}
  </div>
</HorizontalScrollArea>

// GitHub API reports with horizontal scrolling
<GitHubReportViewer 
  analysis={analysisText}
  repository={repositoryData}
/>`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};