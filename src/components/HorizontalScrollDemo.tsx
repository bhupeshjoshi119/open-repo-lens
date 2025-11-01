import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HorizontalScrollArea } from '@/components/ui/horizontal-scroll-area';
import { CustomScrollArea } from '@/components/ui/custom-scrollbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GitHubReportViewer } from './GitHubReportViewer';
import { 
  ArrowRight, 
  Code, 
  Database, 
  Globe, 
  Smartphone,
  Monitor,
  Tablet
} from 'lucide-react';

export const HorizontalScrollDemo = () => {
  const sampleAnalysis = `**Main Purpose and Functionality:**
• **Purpose Unclear:** The name "open-repo-lens-94701-64255-39758-60815-37764" combined with a long string of numbers suggests it might be related to a system for analyzing or cataloging repositories. However, with no description and minimal activity, its concrete purpose is undefined.
• **Functionality:** None discernible from the provided data.

**Technology Stack and Quality Indicators:**
• **Technology Stack:** Primarily **TypeScript**. This indicates a modern JavaScript-based development environment.
• **Quality Indicators:** Very low.
  - No description, stars, forks, or issues.
  - Absence of a license suggests it's not intended for public consumption or contribution.

**Activity and Maintenance Status:**
• **Last Updated:** 2 days ago
• **Repository Age:** 2 days
• **Language:** TypeScript
• **License:** None

**Recommendations:**
1. Add a comprehensive README.md file
2. Include proper documentation
3. Add a license if intended for public use
4. Consider adding meaningful commit messages
5. Implement proper project structure`;

  const sampleRepository = {
    name: "open-repo-lens-94701-64255-39758-60815-37764",
    stargazers_count: 0,
    forks_count: 0,
    open_issues_count: 0,
    language: "TypeScript",
    updated_at: "2024-10-29T00:00:00Z",
    html_url: "https://github.com/example/repo"
  };

  const wideTableData = [
    { id: 1, name: "Component A", type: "React", status: "Active", version: "1.2.3", dependencies: 15, size: "45KB", lastUpdate: "2 days ago" },
    { id: 2, name: "Component B", type: "Vue", status: "Deprecated", version: "0.9.1", dependencies: 8, size: "32KB", lastUpdate: "1 week ago" },
    { id: 3, name: "Component C", type: "Angular", status: "Active", version: "2.1.0", dependencies: 22, size: "67KB", lastUpdate: "1 day ago" },
    { id: 4, name: "Component D", type: "Svelte", status: "Beta", version: "1.0.0-beta.2", dependencies: 5, size: "18KB", lastUpdate: "3 days ago" },
    { id: 5, name: "Component E", type: "React", status: "Active", version: "3.4.1", dependencies: 31, size: "89KB", lastUpdate: "5 hours ago" }
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <ArrowRight className="h-8 w-8 text-blue-500" />
          Horizontal Scrolling Demo
        </h1>
        <p className="text-muted-foreground">
          Beautiful horizontal and vertical scrollbars for wide content
        </p>
      </div>

      {/* GitHub Report Viewer Demo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            GitHub API Report Viewer
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Comprehensive analysis with horizontal scrolling for wide content
          </p>
        </CardHeader>
        <CardContent>
          <GitHubReportViewer 
            analysis={sampleAnalysis}
            repository={sampleRepository}
          />
        </CardContent>
      </Card>

      {/* Wide Table Demo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Wide Data Table
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Horizontal scrolling for tables with many columns
          </p>
        </CardHeader>
        <CardContent>
          <HorizontalScrollArea maxHeight="300px">
            <table className="min-w-max w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium min-w-[120px]">Component Name</th>
                  <th className="text-left p-3 font-medium min-w-[100px]">Framework</th>
                  <th className="text-left p-3 font-medium min-w-[100px]">Status</th>
                  <th className="text-left p-3 font-medium min-w-[120px]">Version</th>
                  <th className="text-left p-3 font-medium min-w-[120px]">Dependencies</th>
                  <th className="text-left p-3 font-medium min-w-[100px]">Bundle Size</th>
                  <th className="text-left p-3 font-medium min-w-[120px]">Last Updated</th>
                  <th className="text-left p-3 font-medium min-w-[100px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {wideTableData.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-muted/50">
                    <td className="p-3 font-medium">{item.name}</td>
                    <td className="p-3">
                      <Badge variant="outline">{item.type}</Badge>
                    </td>
                    <td className="p-3">
                      <Badge 
                        variant={
                          item.status === 'Active' ? 'default' : 
                          item.status === 'Beta' ? 'secondary' : 'destructive'
                        }
                      >
                        {item.status}
                      </Badge>
                    </td>
                    <td className="p-3 font-mono text-sm">{item.version}</td>
                    <td className="p-3">{item.dependencies} packages</td>
                    <td className="p-3">{item.size}</td>
                    <td className="p-3 text-sm text-muted-foreground">{item.lastUpdate}</td>
                    <td className="p-3">
                      <Button variant="ghost" size="sm">View</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </HorizontalScrollArea>
        </CardContent>
      </Card>

      {/* Responsive Cards Demo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Responsive Card Layout
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Horizontal scrolling for card layouts on different screen sizes
          </p>
        </CardHeader>
        <CardContent>
          <HorizontalScrollArea maxHeight="250px" enableVerticalScroll={false}>
            <div className="flex gap-4 min-w-max pb-4">
              {[
                { icon: Smartphone, title: "Mobile First", desc: "Optimized for mobile devices", color: "bg-green-500" },
                { icon: Tablet, title: "Tablet Ready", desc: "Perfect for tablet interfaces", color: "bg-blue-500" },
                { icon: Monitor, title: "Desktop Enhanced", desc: "Full desktop experience", color: "bg-purple-500" },
                { icon: Globe, title: "Web Optimized", desc: "Cross-browser compatibility", color: "bg-orange-500" },
                { icon: Code, title: "Developer Friendly", desc: "Easy to implement and customize", color: "bg-red-500" }
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <Card key={index} className="w-[280px] flex-shrink-0">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 rounded-lg ${item.color}`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="font-semibold">{item.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                      <Button variant="outline" size="sm" className="mt-4 w-full">
                        Learn More
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </HorizontalScrollArea>
        </CardContent>
      </Card>

      {/* Code Block Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Wide Code Block</CardTitle>
          <p className="text-sm text-muted-foreground">
            Horizontal scrolling for code that extends beyond the container width
          </p>
        </CardHeader>
        <CardContent>
          <HorizontalScrollArea maxHeight="200px">
            <pre className="bg-muted p-4 rounded-lg text-sm font-mono min-w-max">
{`// Example of wide code that needs horizontal scrolling
const veryLongFunctionNameThatExceedsNormalWidth = (parameterOne, parameterTwo, parameterThree, parameterFour) => {
  return someVeryLongCalculationThatRequiresHorizontalScrollingToViewProperly(parameterOne, parameterTwo, parameterThree, parameterFour);
};

// Another example with a long object
const configurationObject = {
  veryLongPropertyNameThatExceedsNormalWidth: "some very long value that also exceeds normal width",
  anotherLongPropertyName: "another long value that requires horizontal scrolling to view completely",
  yetAnotherProperty: "this is getting quite wide and demonstrates the need for horizontal scrolling"
};`}
            </pre>
          </HorizontalScrollArea>
        </CardContent>
      </Card>

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted rounded-lg p-4">
            <h4 className="font-medium mb-2">Basic Usage:</h4>
            <pre className="text-sm">
{`import { HorizontalScrollArea } from '@/components/ui/horizontal-scroll-area';

<HorizontalScrollArea maxHeight="400px">
  <div className="min-w-max">
    {/* Your wide content here */}
  </div>
</HorizontalScrollArea>`}
            </pre>
          </div>
          
          <div className="bg-muted rounded-lg p-4">
            <h4 className="font-medium mb-2">GitHub Report Viewer:</h4>
            <pre className="text-sm">
{`import { GitHubReportViewer } from '@/components/GitHubReportViewer';

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