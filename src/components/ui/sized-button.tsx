import * as React from "react";
import { Button, ButtonProps } from "./button";
import { cn } from "@/lib/utils";

interface SizedButtonProps extends ButtonProps {
  responsive?: boolean;
}

const SizedButton = React.forwardRef<HTMLButtonElement, SizedButtonProps>(
  ({ className, size = "default", responsive = true, ...props }, ref) => {
    const responsiveClasses = responsive 
      ? "h-9 sm:h-10 text-sm px-3 sm:px-4" 
      : "";
    
    return (
      <Button
        ref={ref}
        size={size}
        className={cn(
          // Ensure consistent sizing
          size === "default" && "h-10 px-4",
          size === "sm" && "h-9 px-3",
          size === "lg" && "h-11 px-8",
          size === "icon" && "h-10 w-10",
          // Add responsive classes if enabled
          responsive && responsiveClasses,
          className
        )}
        {...props}
      />
    );
  }
);

SizedButton.displayName = "SizedButton";

export { SizedButton };