import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Image, 
  Brain, 
  FileText, 
  X,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getChromeButtonClasses, getChromeButtonStyle } from "@/utils/browserUtils";

interface FloatingActionButtonProps {
  onImageAnalysisClick: () => void;
  onPredictiveAnalysisClick: () => void;
  onResearchSimplifierClick?: () => void;
  className?: string;
}

export const FloatingActionButton = ({
  onImageAnalysisClick,
  onPredictiveAnalysisClick,
  onResearchSimplifierClick,
  className
}: FloatingActionButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      icon: Sparkles,
      label: "AI Repository Analysis",
      action: () => {
        // Trigger repository analysis for the most recent repo
        if (onResearchSimplifierClick) {
          onResearchSimplifierClick();
        }
        setIsOpen(false);
      },
      color: "bg-gradient-to-r from-primary to-accent hover:opacity-90"
    },
    {
      icon: Image,
      label: "Image Analysis",
      action: () => {
        onImageAnalysisClick();
        setIsOpen(false);
      },
      color: "bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90"
    },
    {
      icon: Brain,
      label: "Predictive Insights", 
      action: () => {
        onPredictiveAnalysisClick();
        setIsOpen(false);
      },
      color: "bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
    },
    {
      icon: FileText,
      label: "Quick PDF Report",
      action: () => {
        // Dispatch event for quick PDF generation
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('quick-pdf-request', {
            detail: { source: 'floating-action-button' }
          }));
        }
        setIsOpen(false);
      },
      color: "bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90"
    }
  ];

  return (
    <div className={cn("fixed bottom-6 right-6 z-50 lg:hidden", className)}>
      {/* Action Buttons */}
      <div className={cn(
        "flex flex-col-reverse gap-3 mb-3 transition-all duration-300 ease-in-out",
        isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      )}>
        {actions.map((action, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full border shadow-lg">
              <span className="text-sm font-medium whitespace-nowrap">
                {action.label}
              </span>
            </div>
            <Button
              size="icon"
              className={getChromeButtonClasses(cn(
                "h-10 w-10 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 focus:ring-4 focus:ring-white/20 focus:ring-offset-2",
                action.color
              ))}
              onClick={action.action}
              aria-label={action.label}
              style={getChromeButtonStyle('icon')}
            >
              <action.icon className="h-4 w-4 text-white" aria-hidden="true" />
            </Button>
          </div>
        ))}
      </div>

      {/* Main FAB */}
      <Button
        size="icon"
        className={getChromeButtonClasses(cn(
          "h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105 focus:ring-4 focus:ring-primary/20 focus:ring-offset-2",
          "bg-gradient-to-r from-primary to-accent",
          isOpen && "rotate-45"
        ))}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close quick actions menu" : "Open quick actions menu"}
        aria-expanded={isOpen}
        style={{
          ...getChromeButtonStyle('icon'),
          height: '3rem',
          width: '3rem',
          minHeight: '3rem',
          maxHeight: '3rem',
          minWidth: '3rem',
          maxWidth: '3rem'
        }}
      >
        {isOpen ? (
          <X className="h-5 w-5 text-white" aria-hidden="true" />
        ) : (
          <Sparkles className="h-5 w-5 text-white" aria-hidden="true" />
        )}
      </Button>
    </div>
  );
};