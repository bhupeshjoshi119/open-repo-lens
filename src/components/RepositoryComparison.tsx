import { useState } from "react";
import { GitCompare, X, Star, GitFork, Eye, Calendar, AlertCircle } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Repository } from "@/pages/Index";
import { Card } from "@/components/ui/card";

interface RepositoryComparisonProps {
  selectedRepos: Repository[];
  onRemove: (id: number) => void;
  onClear: () => void;
}

export const RepositoryComparison = ({
  selectedRepos,
  onRemove,
  onClear,
}: RepositoryComparisonProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  };

  const calculateScore = (repo: Repository) => {
    const starScore = Math.min(repo.stargazers_count / 1000, 100);
    const forkScore = Math.min(repo.forks_count / 500, 50);
    const recentUpdate =
      Date.now() - new Date(repo.updated_at).getTime() < 90 * 24 * 60 * 60 * 1000
        ? 20
        : 0;
    return Math.round(starScore + forkScore + recentUpdate);
  };

  const getWinner = (metric: keyof Repository) => {
    if (selectedRepos.length < 2) return null;
    return selectedRepos.reduce((prev, current) =>
      (current[metric] as number) > (prev[metric] as number) ? current : prev
    );
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 relative"
          disabled={selectedRepos.length === 0}
        >
          <GitCompare className="w-4 h-4" />
          Compare ({selectedRepos.length})
          {selectedRepos.length > 0 && (
            <Badge variant="secondary" className="ml-1">
              {selectedRepos.length}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <GitCompare className="w-5 h-5" />
              Repository Comparison
            </span>
            {selectedRepos.length > 0 && (
              <Button variant="ghost" size="sm" onClick={onClear}>
                Clear All
              </Button>
            )}
          </SheetTitle>
          <SheetDescription>
            Compare up to 5 repositories side by side
          </SheetDescription>
        </SheetHeader>

        {selectedRepos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <GitCompare className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No repositories selected</h3>
            <p className="text-sm text-muted-foreground">
              Click the compare icon on repository cards to add them here
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-120px)] mt-6">
            <div className="space-y-6">
              {/* Quick Stats Comparison */}
              <Card className="p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Quick Comparison
                </h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Most Stars</p>
                    <p className="font-medium truncate">
                      {getWinner("stargazers_count")?.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Most Forks</p>
                    <p className="font-medium truncate">
                      {getWinner("forks_count")?.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Most Recent</p>
                    <p className="font-medium truncate">
                      {getWinner("updated_at")?.name}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Detailed Comparison */}
              {selectedRepos.map((repo) => (
                <Card key={repo.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{repo.name}</h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {repo.full_name}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemove(repo.id)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  {repo.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {repo.description}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="font-medium">
                        {repo.stargazers_count.toLocaleString()}
                      </span>
                      <span className="text-muted-foreground">stars</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <GitFork className="w-4 h-4 text-blue-500" />
                      <span className="font-medium">
                        {repo.forks_count.toLocaleString()}
                      </span>
                      <span className="text-muted-foreground">forks</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <AlertCircle className="w-4 h-4 text-orange-500" />
                      <span className="font-medium">{repo.open_issues_count}</span>
                      <span className="text-muted-foreground">issues</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-green-500" />
                      <span className="font-medium">{formatDate(repo.updated_at)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {repo.language && (
                      <Badge variant="secondary">{repo.language}</Badge>
                    )}
                    {repo.license && (
                      <Badge variant="outline">{repo.license.name}</Badge>
                    )}
                    <Badge className="ml-auto">
                      Score: {calculateScore(repo)}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </SheetContent>
    </Sheet>
  );
};
