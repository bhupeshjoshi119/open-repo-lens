import { useState, useEffect, useCallback } from "react";
import { Search, Loader2, Zap, Archive, Sparkles, GitBranch, Lightbulb } from "lucide-react";
import ChromeAiService from "../services/chromeAiService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface SearchBarProps {
  onSearch: (query: string, options?: { includeArchived?: boolean; useAI?: boolean; searchMyRepos?: boolean }) => void;
  loading?: boolean;
  useAI?: boolean;
  onAIToggle?: () => void;
  enhancement?: { filters: string[]; explanation: string } | null;
}

export const SearchBar = ({ onSearch, loading, useAI = true, onAIToggle, enhancement }: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const [includeArchived, setIncludeArchived] = useState(false);
  const [searchMyRepos, setSearchMyRepos] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [aiCapabilities, setAiCapabilities] = useState<any>(null);
  const { isAuthenticated } = useAuth();

  // Check AI capabilities on mount
  useEffect(() => {
    const checkCapabilities = async () => {
      try {
        const caps = await ChromeAiService.checkAiAvailability();
        setAiCapabilities(caps);
      } catch (err) {
        console.error('Failed to check AI capabilities:', err);
      }
    };
    checkCapabilities();
  }, []);

  // Generate AI suggestions when query changes
  const generateSuggestions = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || !aiCapabilities?.promptApi) return;
    
    try {
      const aiSuggestions = await ChromeAiService.generateSearchSuggestions(searchQuery);
      setSuggestions(aiSuggestions);
      setShowSuggestions(aiSuggestions.length > 0);
    } catch (err) {
      console.error('Failed to generate suggestions:', err);
      setSuggestions([]);
    }
  }, [aiCapabilities]);

  // Debounced suggestion generation
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length > 2 && useAI) {
        generateSuggestions(query);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query, useAI, generateSuggestions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    onSearch(query, { includeArchived, useAI, searchMyRepos });
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    onSearch(suggestion, { includeArchived, useAI, searchMyRepos });
  };

  return (
    <form onSubmit={handleSubmit} className="relative space-y-3">
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300" />
        <div className="relative flex items-center gap-2 bg-card rounded-xl border border-border p-2 backdrop-blur-sm">
          <Search className="w-5 h-5 text-muted-foreground ml-2" />
          <Input
            type="text"
            placeholder="Search repositories, users, topics, or use natural language..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
          />
          
          <Popover open={showOptions} onOpenChange={setShowOptions}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Zap className="w-4 h-4" />
                Options
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Search Options</h4>
                  <p className="text-xs text-muted-foreground">
                    Customize your search behavior
                  </p>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="ai-toggle" className="text-sm font-medium flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      AI Enhancement
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Intelligently enhance your query
                    </p>
                  </div>
                  <Switch
                    id="ai-toggle"
                    checked={useAI}
                    onCheckedChange={onAIToggle}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="archived-toggle" className="text-sm font-medium flex items-center gap-2">
                      <Archive className="w-4 h-4" />
                      Include Archived
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Search archived repositories
                    </p>
                  </div>
                  <Switch
                    id="archived-toggle"
                    checked={includeArchived}
                    onCheckedChange={setIncludeArchived}
                  />
                </div>

                {isAuthenticated && (
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="my-repos-toggle" className="text-sm font-medium flex items-center gap-2">
                        <GitBranch className="w-4 h-4" />
                        Search My Repositories
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Search only your repositories (including private)
                      </p>
                    </div>
                    <Switch
                      id="my-repos-toggle"
                      checked={searchMyRepos}
                      onCheckedChange={setSearchMyRepos}
                    />
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
          
          <Button 
            type="submit" 
            disabled={loading || !query.trim()}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Search"
            )}
          </Button>
        </div>
      </div>

      {/* AI Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="relative">
          <div className="absolute top-2 left-0 right-0 z-50 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
            <div className="p-2 border-b border-border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Lightbulb className="w-4 h-4" />
                AI Suggestions
              </div>
            </div>
            <div className="p-1">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded-md transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Status badges */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {useAI && (
          <Badge variant="secondary" className="gap-1.5">
            <Sparkles className="w-3 h-3" />
            AI Enhanced
          </Badge>
        )}
        {includeArchived && (
          <Badge variant="secondary" className="gap-1.5">
            <Archive className="w-3 h-3" />
            Including Archived
          </Badge>
        )}
        {searchMyRepos && isAuthenticated && (
          <Badge variant="secondary" className="gap-1.5">
            <GitBranch className="w-3 h-3" />
            My Repositories
          </Badge>
        )}
        {enhancement && useAI && enhancement.filters.length > 0 && (
          <Badge variant="outline" className="max-w-md truncate text-xs">
            {enhancement.explanation}
          </Badge>
        )}
      </div>
    </form>
  );
};
