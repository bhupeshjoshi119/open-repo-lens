import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"
import { cn } from "@/lib/utils"

const CustomScrollArea = React.forwardRef<
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
    <CustomScrollBar orientation="vertical" />
    <CustomScrollBar orientation="horizontal" />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
))
CustomScrollArea.displayName = ScrollAreaPrimitive.Root.displayName

const CustomScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar> & {
    orientation?: "vertical" | "horizontal"
  }
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none transition-all duration-300 ease-out",
      // Responsive sizing for different screen sizes
      orientation === "vertical" && [
        "h-full border-l border-l-transparent p-[1px]",
        // Mobile: thinner scrollbar
        "w-2 sm:w-3 md:w-3 lg:w-3",
        // Hover effects - more prominent on larger screens
        "hover:w-3 sm:hover:w-4 md:hover:w-4 lg:hover:w-5",
        // Touch devices: slightly larger for better usability
        "touch:w-4 touch:hover:w-5"
      ],
      orientation === "horizontal" && [
        "flex-col border-t border-t-transparent p-[1px]",
        "h-2 sm:h-3 md:h-3 lg:h-3",
        "hover:h-3 sm:hover:h-4 md:hover:h-4 lg:hover:h-5",
        "touch:h-4 touch:hover:h-5"
      ],
      // Beautiful blue gradient scrollbar track - responsive opacity
      orientation === "vertical" && [
        "bg-gradient-to-b from-blue-500/10 via-blue-600/15 to-blue-700/10",
        "hover:from-blue-500/20 hover:via-blue-600/25 hover:to-blue-700/20",
        "sm:from-blue-500/15 sm:via-blue-600/20 sm:to-blue-700/15"
      ],
      orientation === "horizontal" && [
        "bg-gradient-to-r from-blue-500/10 via-blue-600/15 to-blue-700/10",
        "hover:from-blue-500/20 hover:via-blue-600/25 hover:to-blue-700/20",
        "sm:from-blue-500/15 sm:via-blue-600/20 sm:to-blue-700/15"
      ],
      "backdrop-blur-sm",
      className
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb 
      className={cn(
        "relative flex-1 rounded-full transition-all duration-300 ease-out",
        // Beautiful blue gradient thumb with responsive sizing
        orientation === "vertical" && [
          "bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600",
          "hover:from-blue-300 hover:via-blue-400 hover:to-blue-500",
          "min-h-[20px] sm:min-h-[16px]"
        ],
        orientation === "horizontal" && [
          "bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600", 
          "hover:from-blue-300 hover:via-blue-400 hover:to-blue-500",
          "min-w-[20px] sm:min-w-[16px]"
        ],
        // Responsive shadows
        "shadow-sm sm:shadow-lg hover:shadow-xl",
        "shadow-blue-500/20 sm:shadow-blue-500/30 hover:shadow-blue-400/50",
        // Responsive borders
        "border border-blue-300/20 sm:border-blue-300/30 hover:border-blue-200/50",
        // Gradient overlay effect
        "before:absolute before:inset-0 before:rounded-full",
        orientation === "vertical" && "before:bg-gradient-to-b before:from-white/10 sm:before:from-white/20 before:to-transparent",
        orientation === "horizontal" && "before:bg-gradient-to-r before:from-white/10 sm:before:from-white/20 before:to-transparent",
        "before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300",
        // Responsive scaling - less aggressive on mobile
        "hover:scale-105 sm:hover:scale-110 transform-gpu",
        // Responsive animations
        "animate-pulse hover:animate-none"
      )}
    />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
))
CustomScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName

export { CustomScrollArea, CustomScrollBar }