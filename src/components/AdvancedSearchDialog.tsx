import { useState } from "react";
import { Search, Sparkles, Zap, History, X, TrendingUp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useSearchHistory } from "@/hooks/useSearchHistory";

interface AdvancedSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSearch: (query: string, useAI: boolean) => void;
}

const TRENDING_SEARCHES = [
  "react hooks typescript",
  "machine learning python",
  "three.js games",
  "vue3 composition api",
  "rust webassembly",
  "go microservices",
];

const SEARCH_TEMPLATES = [
  { label: "High Quality", template: "{{query}} stars:>1000 archived:false" },
  { label: "Recent & Active", template: "{{query}} pushed:>2024-01-01" },
  { label: "Beginner Friendly", template: "{{query}} good-first-issues:>5" },
  { label: "Well Documented", template: "{{query}} in:readme,description" },
];

export const AdvancedSearchDialog = ({
  open,
  onOpenChange,
  onSearch,
}: AdvancedSearchDialogProps) => {
  const [query, setQuery] = useState("");
  const [useAI, setUseAI] = useState(true);
  const { history, removeFromHistory } = useSearchHistory();

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      onSearch(searchQuery, useAI);
      onOpenChange(false);
      setQuery("");
    }
  };

  const handleTemplateClick = (template: string) => {
    const filled = template.replace("{{query}}", query || "awesome");
    setQuery(filled);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Advanced Repository Search
          </DialogTitle>
          <DialogDescription>
            Use natural language or GitHub search syntax to find repositories
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Main Search Input */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="e.g., 'reddit typescript games' or 'scalable backend framework'"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch(query)}
                  className="pl-10"
                />
              </div>
              <Button
                onClick={() => handleSearch(query)}
                disabled={!query.trim()}
                className="gap-2"
              >
                <Search className="w-4 h-4" />
                Search
              </Button>
            </div>

            {/* AI Toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant={useAI ? "default" : "outline"}
                size="sm"
                onClick={() => setUseAI(!useAI)}
                className="gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {useAI ? "AI Enhanced" : "Raw Search"}
              </Button>
              <span className="text-xs text-muted-foreground">
                {useAI
                  ? "AI will intelligently enhance your search"
                  : "Search exactly as typed"}
              </span>
            </div>
          </div>

          <Separator />

          {/* Search Templates */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">Quick Filters</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {SEARCH_TEMPLATES.map((template) => (
                <Button
                  key={template.label}
                  variant="outline"
                  size="sm"
                  onClick={() => handleTemplateClick(template.template)}
                  className="text-xs"
                >
                  {template.label}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            {/* Search History */}
            {history.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium">Recent Searches</h3>
                </div>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {history.slice(0, 10).map((item) => (
                      <div
                        key={item.timestamp}
                        className="group flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors"
                        onClick={() => handleSearch(item.query)}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{item.query}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.resultsCount} results
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromHistory(item.query);
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Trending Searches */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-medium">Trending Topics</h3>
              </div>
              <div className="space-y-2">
                {TRENDING_SEARCHES.map((trend) => (
                  <Badge
                    key={trend}
                    variant="secondary"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors w-full justify-start"
                    onClick={() => handleSearch(trend)}
                  >
                    {trend}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Search Tips */}
          <div className="bg-secondary/30 rounded-lg p-4 space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Pro Tips
            </h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Use natural language: "scalable backend framework"</li>
              <li>• Be specific: "reddit typescript games" vs just "games"</li>
              <li>• Combine terms: "react native maps geolocation"</li>
              <li>
                • Use GitHub syntax: {`stars:>1000 language:python archived:false`}
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
