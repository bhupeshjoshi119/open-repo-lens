import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HorizontalScrollArea } from '@/components/ui/horizontal-scroll-area';
import { CustomScrollArea } from '@/components/ui/custom-scrollbar';
import { 
  FileText, 
  GitBranch, 
  Star, 
  Bug, 
  Users, 
  Calendar,
  ExternalLink,
  Copy,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface GitHubReportViewerProps {
  analysis: string;
  repository?: any;
  className?: string;
}

export const GitHubReportViewer: React.FC<GitHubReportViewerProps> = ({
  analysis,
  repository,
  className
}) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(analysis);
  };

  const downloadReport = () => {
    const blob = new Blob([analysis], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${repository?.name || 'repository'}-analysis.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Parse analysis sections for better display
  const parseAnalysisSections = (text: string) => {
    const sections = text.split(/\*\*([^*]+)\*\*/g);
    const parsed = [];
    
    for (let i = 0; i < sections.length; i += 2) {
      if (sections[i + 1]) {
        parsed.push({
          title: sections[i + 1].trim(),
          content: sections[i + 2]?.trim() || ''
        });
      }
    }
    
    return parsed.length > 0 ? parsed : [{ title: 'Analysis', content: text }];
  };

  const sections = parseAnalysisSections(analysis);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold">Comprehensive Issue Analysis</h3>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={copyToClipboard}>
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </Button>
          <Button variant="outline" size="sm" onClick={downloadReport}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      {/* Repository Info Bar */}
      {repository && (
        <Card>
          <CardContent className="p-4">
            <HorizontalScrollArea maxHeight="120px" enableVerticalScroll={false}>
              <div className="flex items-center gap-6 min-w-max">
                <div className="flex items-center gap-2">
                  <GitBranch className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">{repository.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>{repository.stargazers_count || 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-green-500" />
                  <span>{repository.forks_count || 0} forks</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bug className="h-4 w-4 text-red-500" />
                  <span>{repository.open_issues_count || 0} issues</span>
                </div>
                {repository.language && (
                  <Badge variant="outline">{repository.language}</Badge>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-muted-foreground">
                    Updated {new Date(repository.updated_at).toLocaleDateString()}
                  </span>
                </div>
                {repository.html_url && (
                  <Button variant="ghost" size="sm" asChild>
                    <a href={repository.html_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
            </HorizontalScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Analysis Content with Horizontal Scrolling */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Analysis Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <HorizontalScrollArea maxHeight="500px">
            <div className="space-y-6 min-w-max pr-4">
              {sections.map((section, index) => (
                <div key={index} className="space-y-3">
                  {section.title !== 'Analysis' && (
                    <h4 className="text-base font-semibold text-blue-600 dark:text-blue-400 border-b border-blue-200 dark:border-blue-800 pb-2">
                      {section.title}
                    </h4>
                  )}
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed font-mono bg-muted/30 p-4 rounded-lg border">
                      {section.content}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </HorizontalScrollArea>
        </CardContent>
      </Card>

      {/* Analysis Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <HorizontalScrollArea maxHeight="200px" enableVerticalScroll={false}>
            <div className="flex gap-6 min-w-max">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{analysis.split('\n').length}</div>
                <div className="text-sm text-muted-foreground">Lines</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{analysis.split(' ').length}</div>
                <div className="text-sm text-muted-foreground">Words</div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{analysis.length}</div>
                <div className="text-sm text-muted-foreground">Characters</div>
              </div>
              <div className="text-center p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{sections.length}</div>
                <div className="text-sm text-muted-foreground">Sections</div>
              </div>
            </div>
          </HorizontalScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};