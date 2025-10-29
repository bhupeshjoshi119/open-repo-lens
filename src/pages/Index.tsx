import { useState } from "react";
import { SearchBar } from "@/components/SearchBar";
import { RepositoryGrid } from "@/components/RepositoryGrid";
import { FilterBar } from "@/components/FilterBar";
import { RepositoryDetailsDialog } from "@/components/RepositoryDetailsDialog";
import { AdvancedSearchDialog } from "@/components/AdvancedSearchDialog";
import { RepositoryComparison } from "@/components/RepositoryComparison";
import { Github, Sparkles, Bookmark, GitCompare, Code2 } from "lucide-react";
import { TechHubLogo } from "@/components/TechHubLogo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRepositoryBookmarks } from "@/hooks/useRepositoryBookmarks";
import { useAISearch } from "@/hooks/useAISearch";
import { useSearchHistory } from "@/hooks/useSearchHistory";
import { useToast } from "@/hooks/use-toast";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics: string[];
  updated_at: string;
  created_at: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  open_issues_count: number;
  license?: { name: string } | null;
}

const Index = () => {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("stars");
  const [minStars, setMinStars] = useState<number>(0);
  const [maxStars, setMaxStars] = useState<number>(0);
  const [starRange, setStarRange] = useState<string>("all");
  const [useAI, setUseAI] = useState<boolean>(true);
  const [selectedRepository, setSelectedRepository] = useState<Repository | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [advancedSearchOpen, setAdvancedSearchOpen] = useState(false);
  const [compareRepos, setCompareRepos] = useState<Repository[]>([]);
  
  const { bookmarks, addBookmark, removeBookmark, isBookmarked } = useRepositoryBookmarks();
  const { enhanceSearch, enhancement } = useAISearch();
  const { addToHistory } = useSearchHistory();
  const { toast } = useToast();

  const handleSearch = async (
    query: string, 
    options?: { includeArchived?: boolean; useAI?: boolean }
  ) => {
    if (!query.trim()) {
      setRepositories([]);
      return;
    }

    setLoading(true);
    try {
      let searchQuery = query;
      const shouldUseAI = options?.useAI !== undefined ? options.useAI : useAI;
      
      // Use AI to enhance search if enabled
      if (shouldUseAI) {
        const enhanced = await enhanceSearch(query);
        if (enhanced) {
          searchQuery = enhanced.enhancedQuery;
        }
      }
      
      // Add archived filter if not included
      if (!options?.includeArchived && !searchQuery.includes("archived:")) {
        searchQuery += " archived:false";
      }

      const sortParam = sortBy === "stars" ? "stars" : sortBy === "updated" ? "updated" : "forks";
      const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(searchQuery)}&sort=${sortParam}&order=desc&per_page=50`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      const results = data.items || [];
      setRepositories(results);
      
      // Add to search history
      addToHistory(query, results.length);
    } catch (error) {
      console.error("Error fetching repositories:", error);
      toast({
        title: "Search Error",
        description: "Failed to search repositories. Please try again.",
        variant: "destructive",
      });
      setRepositories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBookmarkToggle = (repo: Repository) => {
    if (isBookmarked(repo.id)) {
      removeBookmark(repo.id);
      toast({ description: "Removed from bookmarks" });
    } else {
      addBookmark(repo);
      toast({ description: "Added to bookmarks" });
    }
  };

  const handleAnalyzeRepository = (repo: Repository) => {
    setSelectedRepository(repo);
    setDialogOpen(true);
  };

  const handleCompareToggle = (repo: Repository) => {
    setCompareRepos((prev) => {
      const exists = prev.find((r) => r.id === repo.id);
      if (exists) {
        return prev.filter((r) => r.id !== repo.id);
      }
      if (prev.length >= 5) {
        toast({
          title: "Limit Reached",
          description: "You can compare up to 5 repositories at once",
          variant: "destructive",
        });
        return prev;
      }
      return [...prev, repo];
    });
  };

  // Apply all filters
  const filteredRepositories = repositories.filter(repo => {
    // Language filter
    if (selectedLanguage !== "all" && repo.language !== selectedLanguage) {
      return false;
    }
    
    // Star range filter
    if (minStars > 0 && repo.stargazers_count < minStars) {
      return false;
    }
    if (maxStars > 0 && repo.stargazers_count > maxStars) {
      return false;
    }
    
    return true;
  });

  const availableLanguages = Array.from(
    new Set(repositories.map(repo => repo.language).filter(Boolean))
  ) as string[];

  return (
    <div className="min-h-screen bg-background">
      <RepositoryDetailsDialog 
        repository={selectedRepository}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
      <AdvancedSearchDialog
        open={advancedSearchOpen}
        onOpenChange={setAdvancedSearchOpen}
        onSearch={(query: string, useAIOverride: boolean) => {
          handleSearch(query, { useAI: useAIOverride });
        }}
      />
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-border bg-gradient-to-br from-background via-background to-secondary/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsla(239,84%,67%,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,hsla(263,70%,60%,0.1),transparent_50%)]" />
        
        <div className="relative container mx-auto px-4 py-16 sm:py-24">
          <div className="flex flex-col items-center text-center space-y-8">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-secondary/50 backdrop-blur-sm border border-border shadow-lg">
              <TechHubLogo size={20} className="animate-pulse" />
              <span className="text-sm font-medium">
                <span className="text-foreground font-semibold">TechHub</span>
                <span className="text-muted-foreground mx-1.5">•</span>
                <span className="text-muted-foreground">Powered by Open Source</span>
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Discover
              </span>
              <br />
              Open Source Projects
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl">
              Search, explore, and find amazing public repositories from the GitHub community.
              Filter by language, stars, and more.
            </p>

            <div className="w-full max-w-3xl mt-8">
              <SearchBar 
                onSearch={handleSearch} 
                loading={loading}
                useAI={useAI}
                onAIToggle={() => setUseAI(!useAI)}
                enhancement={enhancement}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {repositories.length > 0 && (
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <div className="text-sm text-muted-foreground">
              Found {filteredRepositories.length} repositories
            </div>
            
            <div className="flex items-center gap-2">
              {/* Comparison */}
              <RepositoryComparison
                selectedRepos={compareRepos}
                onRemove={(id) => setCompareRepos((prev) => prev.filter((r) => r.id !== id))}
                onClear={() => setCompareRepos([])}
              />
              
              {/* Bookmarks Sheet */}
              <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Bookmark className="w-4 h-4" />
                  Bookmarks ({bookmarks.length})
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Your Bookmarks</SheetTitle>
                  <SheetDescription>
                    Repositories you've saved for later
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  {bookmarks.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No bookmarks yet. Save repositories to view them here.
                    </p>
                  ) : (
                    <RepositoryGrid 
                      repositories={bookmarks} 
                      bookmarkedIds={new Set(bookmarks.map(r => r.id))}
                      onBookmarkToggle={handleBookmarkToggle}
                      onAnalyze={handleAnalyzeRepository}
                      onCompareToggle={handleCompareToggle}
                      compareIds={new Set(compareRepos.map(r => r.id))}
                    />
                  )}
                </div>
              </SheetContent>
            </Sheet>
            </div>
          </div>

          <FilterBar
            selectedLanguage={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
            sortBy={sortBy}
            onSortChange={setSortBy}
            availableLanguages={availableLanguages}
            minStars={minStars}
            maxStars={maxStars}
            onMinStarsChange={setMinStars}
            onMaxStarsChange={setMaxStars}
            starRange={starRange}
            onStarRangeChange={setStarRange}
          />
          
          <div className="mt-8">
            <RepositoryGrid 
              repositories={filteredRepositories} 
              loading={loading}
              bookmarkedIds={new Set(bookmarks.map(r => r.id))}
              onBookmarkToggle={handleBookmarkToggle}
              onAnalyze={handleAnalyzeRepository}
              onCompareToggle={handleCompareToggle}
              compareIds={new Set(compareRepos.map(r => r.id))}
            />
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && repositories.length === 0 && (
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-secondary/50 flex items-center justify-center">
              <Code2 className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold">Start Your Search</h3>
            <p className="text-muted-foreground">
              Enter a keyword to discover repositories, or search by username to find user projects
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
