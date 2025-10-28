import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, TrendingUp, CheckCircle2, Target, Sparkles } from "lucide-react";

interface IssueAnalysisDisplayProps {
  analysis: string;
}

export const IssueAnalysisDisplay = ({ analysis }: IssueAnalysisDisplayProps) => {
  // Extract health score from analysis
  const healthScoreMatch = analysis.match(/health score[:\s]+(\d+)/i);
  const healthScore = healthScoreMatch ? parseInt(healthScoreMatch[1]) : null;
  
  // Split analysis into sections
  const sections = analysis.split(/##\s+/).filter(Boolean);
  
  const getHealthColor = (score: number) => {
    if (score >= 80) return "text-[hsl(var(--github-green))]";
    if (score >= 60) return "text-[hsl(var(--github-blue))]";
    if (score >= 40) return "text-[hsl(var(--github-orange))]";
    return "text-destructive";
  };
  
  const getHealthBg = (score: number) => {
    if (score >= 80) return "bg-[hsl(var(--github-green))]/10";
    if (score >= 60) return "bg-[hsl(var(--github-blue))]/10";
    if (score >= 40) return "bg-[hsl(var(--github-orange))]/10";
    return "bg-destructive/10";
  };

  return (
    <div className="space-y-4">
      {/* Health Score Card */}
      {healthScore !== null && (
        <Card className={`p-6 border-2 ${getHealthBg(healthScore)} backdrop-blur-sm`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-full ${getHealthBg(healthScore)}`}>
                <TrendingUp className={`w-6 h-6 ${getHealthColor(healthScore)}`} />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Repository Health Score</h3>
                <p className="text-sm text-muted-foreground">Based on comprehensive issue analysis</p>
              </div>
            </div>
            <div className={`text-4xl font-bold ${getHealthColor(healthScore)}`}>
              {healthScore}
            </div>
          </div>
          <Progress value={healthScore} className="h-3" />
        </Card>
      )}

      {/* Analysis Sections */}
      <div className="grid gap-4">
        {sections.map((section, idx) => {
          const [title, ...content] = section.split('\n');
          const sectionContent = content.join('\n').trim();
          
          if (!sectionContent) return null;
          
          // Determine section icon and color
          let icon = <Sparkles className="w-5 h-5" />;
          let colorClass = "border-primary/30 bg-primary/5";
          
          if (title.includes('Priority') || title.includes('CRITICAL')) {
            icon = <AlertCircle className="w-5 h-5 text-destructive" />;
            colorClass = "border-destructive/30 bg-destructive/5";
          } else if (title.includes('Recommendations') || title.includes('Actionable')) {
            icon = <Target className="w-5 h-5 text-[hsl(var(--github-green))]" />;
            colorClass = "border-[hsl(var(--github-green))]/30 bg-[hsl(var(--github-green))]/5";
          } else if (title.includes('Overview')) {
            icon = <CheckCircle2 className="w-5 h-5 text-[hsl(var(--github-blue))]" />;
            colorClass = "border-[hsl(var(--github-blue))]/30 bg-[hsl(var(--github-blue))]/5";
          }
          
          return (
            <Card 
              key={idx} 
              className={`p-5 ${colorClass} border-2 transition-all duration-300 hover:shadow-lg`}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="mt-1">{icon}</div>
                <h4 className="font-semibold text-base flex-1">{title.trim()}</h4>
              </div>
              <ScrollArea className="max-h-[300px]">
                <div className="prose prose-sm dark:prose-invert max-w-none pr-4">
                  <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans bg-transparent p-0 border-0">
                    {sectionContent}
                  </pre>
                </div>
              </ScrollArea>
            </Card>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "🐛 Bugs", pattern: /bug/gi },
          { label: "✨ Features", pattern: /feature|enhancement/gi },
          { label: "📚 Docs", pattern: /documentation|doc/gi },
          { label: "🔒 Security", pattern: /security|vulnerability/gi },
        ].map((stat) => {
          const matches = analysis.match(stat.pattern);
          const count = matches ? matches.length : 0;
          
          return (
            <Card key={stat.label} className="p-4 text-center bg-muted/50">
              <div className="text-2xl font-bold text-primary">{count}</div>
              <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
