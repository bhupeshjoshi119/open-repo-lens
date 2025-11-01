import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Filter, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FilterBarProps {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  availableLanguages: string[];
  minStars: number;
  maxStars: number;
  onMinStarsChange: (stars: number) => void;
  onMaxStarsChange: (stars: number) => void;
  starRange: string;
  onStarRangeChange: (range: string) => void;
}

export const FilterBar = ({
  selectedLanguage,
  onLanguageChange,
  sortBy,
  onSortChange,
  availableLanguages,
  minStars,
  maxStars,
  onMinStarsChange,
  onMaxStarsChange,
  starRange,
  onStarRangeChange,
}: FilterBarProps) => {
  const starRanges = [
    { value: "all", label: "All Stars", min: 0, max: Infinity },
    { value: "0-10", label: "0-10 ⭐", min: 0, max: 10 },
    { value: "10-100", label: "10-100 ⭐", min: 10, max: 100 },
    { value: "100-1000", label: "100-1K ⭐", min: 100, max: 1000 },
    { value: "1000+", label: "1K+ ⭐", min: 1000, max: Infinity },
  ];

  const handleStarRangeChange = (value: string) => {
    onStarRangeChange(value);
    const range = starRanges.find(r => r.value === value);
    if (range) {
      onMinStarsChange(range.min);
      onMaxStarsChange(range.max === Infinity ? 0 : range.max);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Filter className="w-4 h-4" />
        <span className="text-sm font-medium">Filters</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Language Filter */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Language</Label>
          <Select value={selectedLanguage} onValueChange={onLanguageChange}>
            <SelectTrigger>
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Languages</SelectItem>
              {availableLanguages.map((lang) => (
                <SelectItem key={lang} value={lang}>
                  {lang}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort By */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Sort By</Label>
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="stars">Most Stars</SelectItem>
              <SelectItem value="updated">Recently Updated</SelectItem>
              <SelectItem value="forks">Most Forks</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Star Range Quick Filter */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground flex items-center gap-1">
            <Star className="w-3 h-3" />
            Star Range
          </Label>
          <Select value={starRange} onValueChange={handleStarRangeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {starRanges.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Custom Star Range */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Custom Range</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={minStars || ""}
              onChange={(e) => {
                onMinStarsChange(parseInt(e.target.value) || 0);
                onStarRangeChange("custom");
              }}
              className="w-20"
            />
            <span className="text-muted-foreground flex items-center">-</span>
            <Input
              type="number"
              placeholder="Max"
              value={maxStars || ""}
              onChange={(e) => {
                onMaxStarsChange(parseInt(e.target.value) || 0);
                onStarRangeChange("custom");
              }}
              className="w-20"
            />
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {(selectedLanguage !== "all" || starRange !== "all" || sortBy !== "stars") && (
        <div className="flex flex-wrap gap-2">
          {selectedLanguage !== "all" && (
            <Badge variant="secondary" className="gap-1">
              Language: {selectedLanguage}
            </Badge>
          )}
          {starRange !== "all" && (
            <Badge variant="secondary" className="gap-1">
              <Star className="w-3 h-3" />
              {starRanges.find(r => r.value === starRange)?.label || "Custom"}
            </Badge>
          )}
          {sortBy !== "stars" && (
            <Badge variant="secondary">
              Sort: {sortBy === "updated" ? "Recent" : "Forks"}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};
