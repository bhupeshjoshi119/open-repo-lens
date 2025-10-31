import { useState } from "react";
import { SearchBar } from "@/components/SearchBar";
import { RepositoryGrid } from "@/components/RepositoryGrid";
import { FilterBar } from "@/components/FilterBar";
import { RepositoryDetailsDialog } from "@/components/RepositoryDetailsDialog";
import { AdvancedSearchDialog } from "@/components/AdvancedSearchDialog";
import { RepositoryComparison } from "@/components/RepositoryComparison";
import { Sidebar } from "@/components/Sidebar";
import { ImageAnalysisDialog } from "@/components/ImageAnalysisDialog";
import { PredictiveAnalysisDialog } from "@/components/PredictiveAnalysisDialog";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { NotificationCenter } from "@/components/NotificationCenter";
import GitHubLogin from "@/components/GitHubLogin";
import UserProfile from "@/components/UserProfile";
import { useAuth } from "@/contexts/AuthContext";
import { githubApi } from "@/services/githubApi";
import { githubAuth } from "@/services/githubAuth";
import { Bookmark, Code2, Menu, Loader2 } from "lucide-react";
import { TechHubLogo } from "@/components/TechHubLogo";
import { Button } from "@/components/ui/button";
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
  const { isAuthenticated, isLoading: authLoading } = useAuth();
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
  const [imageAnalysisOpen, setImageAnalysisOpen] = useState(false);
  const [predictiveAnalysisOpen, setPredictiveAnalysisOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  const { bookmarks, addBookmark, removeBookmark, isBookmarked } = useRepositoryBookmarks();
  const { enhanceSearch, enhancement } = useAISearch();
  const { addToHistory } = useSearchHistory();
  const { toast } = useToast();

  const handleSearch = async (
    query: string, 
    options?: { includeArchived?: boolean; useAI?: boolean; searchMyRepos?: boolean }
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
      if (shouldUseAI && !options?.searchMyRepos) {
        const enhanced = await enhanceSearch(query);
        if (enhanced) {
          searchQuery = enhanced.enhancedQuery;
        }
      }
      
      let results = [];
      
      if (options?.searchMyRepos && isAuthenticated) {
        // Search user's repositories using GitHub Auth service
        const { repositories: userRepos } = await import('@/hooks/useUserRepositories');
        // For now, we'll use a simple client-side filter
        // In a real app, you might want to implement server-side search
        const allUserRepos = await githubAuth.getUserRepositories({
          visibility: 'all',
          sort: 'updated',
          direction: 'desc',
          per_page: 100
        });
        
        results = allUserRepos.filter(repo => 
          repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (repo.description && repo.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (repo.topics && repo.topics.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase())))
        );
      } else {
        // Add archived filter if not included
        if (!options?.includeArchived && !searchQuery.includes("archived:")) {
          searchQuery += " archived:false";
        }

        const sortParam = sortBy === "stars" ? "stars" : sortBy === "updated" ? "updated" : "forks";
        
        // Use authenticated GitHub API service for public search
        const data = await githubApi.searchRepositories(searchQuery, {
          sort: sortParam as 'stars' | 'forks' | 'help-wanted-issues' | 'updated',
          order: 'desc',
          per_page: 50
        });
        
        results = data.items || [];
      }
      
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

  const handleSidebarSearchClick = (query: string) => {
    handleSearch(query);
  };

  const handleSidebarBookmarkClick = (repoId: number) => {
    const repo = bookmarks.find(r => r.id === repoId);
    if (repo) {
      handleAnalyzeRepository(repo);
    }
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

  // Show loading screen while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <GitHubLogin />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <Sidebar
        onSearchHistoryClick={handleSidebarSearchClick}
        onBookmarkClick={handleSidebarBookmarkClick}
        onImageAnalysisClick={() => setImageAnalysisOpen(true)}
        onPredictiveAnalysisClick={() => setPredictiveAnalysisOpen(true)}
        onRepositorySelect={(repo) => {
          setSelectedRepository(repo);
          setDialogOpen(true);
        }}
      />

      {/* Mobile Sidebar */}
      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="w-80 p-0">
          <div className="h-full">
            <Sidebar
              onSearchHistoryClick={(query) => {
                handleSidebarSearchClick(query);
                setMobileSidebarOpen(false);
              }}
              onBookmarkClick={(repoId) => {
                handleSidebarBookmarkClick(repoId);
                setMobileSidebarOpen(false);
              }}
              onImageAnalysisClick={() => {
                setImageAnalysisOpen(true);
                setMobileSidebarOpen(false);
              }}
              onPredictiveAnalysisClick={() => {
                setPredictiveAnalysisOpen(true);
                setMobileSidebarOpen(false);
              }}
              className="relative border-0"
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Dialogs */}
      <RepositoryDetailsDialog 
        repository={selectedRepository}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onImageAnalysisClick={() => setImageAnalysisOpen(true)}
        onPredictiveAnalysisClick={() => setPredictiveAnalysisOpen(true)}
      />
      <AdvancedSearchDialog
        open={advancedSearchOpen}
        onOpenChange={setAdvancedSearchOpen}
        onSearch={(query: string, useAIOverride: boolean) => {
          handleSearch(query, { useAI: useAIOverride });
        }}
      />
      <ImageAnalysisDialog
        open={imageAnalysisOpen}
        onOpenChange={setImageAnalysisOpen}
      />
      <PredictiveAnalysisDialog
        open={predictiveAnalysisOpen}
        onOpenChange={setPredictiveAnalysisOpen}
        repository={selectedRepository}
      />

      {/* Main Content */}
      <div className="lg:ml-80 transition-all duration-300">
        {/* Hero Section */}
        <div className="relative overflow-hidden border-b border-border bg-gradient-to-br from-background via-background to-secondary/20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsla(239,84%,67%,0.15),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,hsla(263,70%,60%,0.1),transparent_50%)]" />
          
          <div className="relative container mx-auto px-4 py-16 sm:py-24">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="fixed top-4 left-4 z-50 lg:hidden bg-background/80 backdrop-blur-sm border shadow-lg"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Notification Center */}
            <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
              <UserProfile />
              <NotificationCenter />
            </div>

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

        {/* Floating Action Button for Mobile */}
        <FloatingActionButton
          onImageAnalysisClick={() => setImageAnalysisOpen(true)}
          onPredictiveAnalysisClick={() => setPredictiveAnalysisOpen(true)}
        />
      </div>
    </div>
  );
};

export default Index;