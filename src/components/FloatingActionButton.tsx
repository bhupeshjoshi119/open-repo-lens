import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Image, 
  Brain, 
  FileText, 
  X,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingActionButtonProps {
  onImageAnalysisClick: () => void;
  onPredictiveAnalysisClick: () => void;
  className?: string;
}

export const FloatingActionButton = ({
  onImageAnalysisClick,
  onPredictiveAnalysisClick,
  className
}: FloatingActionButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      icon: Image,
      label: "Image Analysis",
      action: () => {
        onImageAnalysisClick();
        setIsOpen(false);
      },
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      icon: Brain,
      label: "Predictive Analysis", 
      action: () => {
        onPredictiveAnalysisClick();
        setIsOpen(false);
      },
      color: "bg-purple-500 hover:bg-purple-600"
    },
    {
      icon: FileText,
      label: "Generate Report",
      action: () => {
        // This will be handled by the repository dialog
        setIsOpen(false);
      },
      color: "bg-green-500 hover:bg-green-600"
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
              className={cn(
                "h-12 w-12 rounded-full shadow-lg transition-all duration-200",
                action.color
              )}
              onClick={action.action}
            >
              <action.icon className="h-5 w-5 text-white" />
            </Button>
          </div>
        ))}
      </div>

      {/* Main FAB */}
      <Button
        size="icon"
        className={cn(
          "h-14 w-14 rounded-full shadow-lg transition-all duration-300 ease-in-out",
          "bg-gradient-to-r from-primary to-accent hover:shadow-xl hover:scale-105",
          isOpen && "rotate-45"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <Sparkles className="h-6 w-6 text-white" />
        )}
      </Button>
    </div>
  );
};