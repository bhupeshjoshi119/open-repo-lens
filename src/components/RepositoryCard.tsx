import { useState } from "react";
import { Repository } from "@/pages/Index";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, GitFork, Eye, Calendar, ExternalLink, Bookmark, Copy, Check, Sparkles, GitCompare, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface RepositoryCardProps {
  repository: Repository;
  isBookmarked?: boolean;
  onBookmarkToggle?: (repo: Repository) => void;
  onAnalyze?: (repo: Repository) => void;
  onCompareToggle?: () => void;
  isInComparison?: boolean;
}

const languageColors: Record<string, string> = {
  JavaScript: "bg-yellow-500",
  TypeScript: "bg-blue-500",
  Python: "bg-blue-600",
  Java: "bg-orange-600",
  Go: "bg-cyan-500",
  Rust: "bg-orange-500",
  Ruby: "bg-red-500",
  PHP: "bg-purple-500",
  C: "bg-gray-500",
  "C++": "bg-pink-500",
  "C#": "bg-green-600",
  Swift: "bg-orange-400",
  Kotlin: "bg-purple-600",
};

// Calculate repository quality score based on multiple factors
function calculateQualityScore(repo: Repository): number {
  let score = 0;
  
  // Stars (max 3 points)
  if (repo.stargazers_count > 10000) score += 3;
  else if (repo.stargazers_count > 1000) score += 2;
  else if (repo.stargazers_count > 100) score += 1;
  
  // Recent activity (max 2 points)
  const daysSinceUpdate = (Date.now() - new Date(repo.updated_at).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceUpdate < 7) score += 2;
  else if (daysSinceUpdate < 30) score += 1;
  
  // Has description (1 point)
  if (repo.description) score += 1;
  
  // Has topics/tags (1 point)
  if (repo.topics && repo.topics.length > 0) score += 1;
  
  // Forks indicate usefulness (max 2 points)
  if (repo.forks_count > 1000) score += 2;
  else if (repo.forks_count > 100) score += 1;
  
  // Low open issues relative to size (1 point)
  if (repo.stargazers_count > 100 && repo.open_issues_count < 20) score += 1;
  
  return score; // Max score: 10
}

export const RepositoryCard = ({ 
  repository, 
  isBookmarked, 
  onBookmarkToggle, 
  onAnalyze,
  onCompareToggle,
  isInComparison 
}: RepositoryCardProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const qualityScore = calculateQualityScore(repository);

  const copyCloneCommand = () => {
    navigator.clipboard.writeText(`git clone ${repository.html_url}.git`);
    setCopied(true);
    toast({ description: "Clone command copied!" });
    setTimeout(() => setCopied(false), 2000);
  };

  const languageColor = repository.language 
    ? languageColors[repository.language] || "bg-gray-500"
    : "bg-gray-500";

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-border hover:border-primary/50 bg-card/50 backdrop-blur-sm relative">
      {/* Quality Score Badge */}
      {qualityScore >= 7 && (
        <div className="absolute top-2 right-2 z-10">
          <Badge variant="default" className="bg-gradient-to-r from-primary to-accent">
            ⭐ High Quality
          </Badge>
        </div>
      )}
      
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors truncate">
              <a 
                href={repository.html_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {repository.name}
              </a>
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              by {repository.owner.login}
            </p>
          </div>
          <img 
            src={repository.owner.avatar_url} 
            alt={repository.owner.login}
            className="w-10 h-10 rounded-full border-2 border-border"
          />
        </div>
        
        {repository.description && (
          <CardDescription className="line-clamp-2">
            {repository.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {repository.topics && repository.topics.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {repository.topics.slice(0, 4).map((topic) => (
              <Badge 
                key={topic} 
                variant="secondary" 
                className="text-xs"
              >
                {topic}
              </Badge>
            ))}
            {repository.topics.length > 4 && (
              <Badge variant="secondary" className="text-xs">
                +{repository.topics.length - 4}
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="font-medium">{repository.stargazers_count.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <GitFork className="w-4 h-4 text-blue-500" />
            <span>{repository.forks_count.toLocaleString()}</span>
          </div>
          {repository.open_issues_count > 0 && (
            <div className="flex items-center gap-1">
              <AlertCircle className="w-4 h-4 text-orange-500" />
              <span>{repository.open_issues_count}</span>
            </div>
          )}
        </div>

        {repository.language && (
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${languageColor}`} />
            <span className="text-sm font-medium">{repository.language}</span>
          </div>
        )}

        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>Updated {formatDistanceToNow(new Date(repository.updated_at), { addSuffix: true })}</span>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 pt-2 border-t border-border">
          {onAnalyze && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAnalyze(repository)}
              className="flex-1 gap-2 hover:bg-primary/10 hover:text-primary hover:border-primary"
            >
              <Sparkles className="w-4 h-4" />
              AI Analyze
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={copyCloneCommand}
            className="gap-2"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied!" : "Clone"}
          </Button>
          {onBookmarkToggle && (
            <Button
              variant={isBookmarked ? "default" : "outline"}
              size="sm"
              onClick={() => onBookmarkToggle(repository)}
              className="gap-2"
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`} />
              {isBookmarked ? "Saved" : "Save"}
            </Button>
          )}
          {onCompareToggle && (
            <Button
              variant={isInComparison ? "default" : "outline"}
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onCompareToggle();
              }}
              className="gap-2"
              title={isInComparison ? "Remove from comparison" : "Add to comparison"}
            >
              <GitCompare className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
