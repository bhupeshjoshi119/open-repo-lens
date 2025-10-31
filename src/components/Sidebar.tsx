import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SettingsPanel } from "./SettingsPanel";
import MyRepositories from "./MyRepositories";
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Bookmark, 
  FileText, 
  Image, 
  TrendingUp, 
  GitCompare,
  History,
  Settings,
  Upload,
  Brain,
  GitBranch
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchHistory } from "@/hooks/useSearchHistory";
import { useRepositoryBookmarks } from "@/hooks/useRepositoryBookmarks";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarProps {
  onSearchHistoryClick: (query: string) => void;
  onBookmarkClick: (repoId: number) => void;
  onImageAnalysisClick: () => void;
  onPredictiveAnalysisClick: () => void;
  onRepositorySelect?: (repo: any) => void;
  className?: string;
}

export const Sidebar = ({ 
  onSearchHistoryClick, 
  onBookmarkClick, 
  onImageAnalysisClick,
  onPredictiveAnalysisClick,
  onRepositorySelect,
  className 
}: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showMyRepos, setShowMyRepos] = useState(false);
  const { history } = useSearchHistory();
  const { bookmarks } = useRepositoryBookmarks();
  const { isAuthenticated } = useAuth();

  const recentHistory = history.slice(0, 5);
  const recentBookmarks = bookmarks.slice(0, 5);

  const sidebarItems = [
    {
      title: "Quick Actions",
      items: [
        { icon: Search, label: "New Search", action: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
        ...(isAuthenticated ? [{ icon: GitBranch, label: "My Repositories", action: () => setShowMyRepos(true) }] : []),
        { icon: Upload, label: "Image Analysis", action: onImageAnalysisClick },
        { icon: Brain, label: "Predictive Analysis", action: onPredictiveAnalysisClick },
        { icon: FileText, label: "Generate PDF Report", action: () => {} },
      ]
    },
    {
      title: "Recent Searches",
      items: recentHistory.map(item => ({
        icon: History,
        label: item.query,
        sublabel: `${item.resultsCount} results`,
        action: () => onSearchHistoryClick(item.query)
      }))
    },
    {
      title: "Bookmarks",
      items: recentBookmarks.map(repo => ({
        icon: Bookmark,
        label: repo.name,
        sublabel: repo.language || "Unknown",
        action: () => onBookmarkClick(repo.id)
      }))
    }
  ];

  return (
    <div 
      className={cn(
        "fixed left-0 top-0 z-40 h-full bg-background/95 backdrop-blur-sm border-r border-border transition-all duration-300 ease-in-out",
        "hidden lg:block", // Hide on mobile, show on large screens
        isCollapsed ? "w-16" : "w-80",
        className
      )}
    >
      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-4 top-6 z-50 h-8 w-8 rounded-full border bg-background shadow-md hover:shadow-lg transition-all duration-200"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>

      {/* Sidebar Content */}
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-border">
          {!isCollapsed ? (
            <div className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              <h2 className="font-semibold text-lg">TechHub</h2>
            </div>
          ) : (
            <div className="flex justify-center">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
          )}
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-2 py-4">
          <div className="space-y-6">
            {sidebarItems.map((section, sectionIdx) => (
              <div key={sectionIdx}>
                {!isCollapsed && (
                  <h3 className="px-2 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {section.title}
                  </h3>
                )}
                
                <div className="space-y-1">
                  {section.items.map((item, itemIdx) => (
                    <Button
                      key={itemIdx}
                      variant="ghost"
                      className={cn(
                        "w-full justify-start h-auto p-2 hover:bg-accent/50 transition-colors duration-200",
                        isCollapsed && "justify-center px-2"
                      )}
                      onClick={item.action}
                    >
                      <item.icon className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
                      {!isCollapsed && (
                        <div className="flex-1 text-left min-w-0">
                          <div className="truncate text-sm font-medium">
                            {item.label}
                          </div>
                          {item.sublabel && (
                            <div className="truncate text-xs text-muted-foreground">
                              {item.sublabel}
                            </div>
                          )}
                        </div>
                      )}
                    </Button>
                  ))}
                </div>
                
                {sectionIdx < sidebarItems.length - 1 && !isCollapsed && (
                  <Separator className="my-4" />
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start",
              isCollapsed && "justify-center px-2"
            )}
            onClick={() => setSettingsOpen(true)}
          >
            <Settings className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
            {!isCollapsed && "Settings"}
          </Button>
        </div>

        {/* Settings Dialog */}
        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                TechHub Settings
              </DialogTitle>
            </DialogHeader>
            <SettingsPanel className="mt-4" />
          </DialogContent>
        </Dialog>

        {/* My Repositories Dialog */}
        <Dialog open={showMyRepos} onOpenChange={setShowMyRepos}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <GitBranch className="w-5 h-5" />
                My Repositories
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="mt-4 max-h-[70vh]">
              <MyRepositories onRepositorySelect={(repo) => {
                if (onRepositorySelect) {
                  onRepositorySelect(repo);
                }
                setShowMyRepos(false);
              }} />
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};