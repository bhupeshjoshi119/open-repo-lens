import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"
import { cn } from "@/lib/utils"

const ResearchScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn("relative overflow-hidden", className)}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ResearchScrollBar />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
))
ResearchScrollArea.displayName = ScrollAreaPrimitive.Root.displayName

const ResearchScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" &&
        "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" &&
        "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      // Enhanced styling for research components
      "bg-gradient-to-b from-primary/10 to-secondary/10 hover:from-primary/20 hover:to-secondary/20",
      className
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb 
      className={cn(
        "relative flex-1 rounded-full transition-colors",
        // Custom research-themed scrollbar thumb
        "bg-gradient-to-b from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70",
        "shadow-sm hover:shadow-md",
        // Add subtle animation
        "transition-all duration-200 ease-in-out"
      )}
    />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
))
ResearchScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName

export { ResearchScrollArea, ResearchScrollBar }