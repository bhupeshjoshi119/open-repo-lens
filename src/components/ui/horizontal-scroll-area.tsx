import * as React from "react"
import { CustomScrollArea } from "./custom-scrollbar"
import { cn } from "@/lib/utils"

interface HorizontalScrollAreaProps {
  children: React.ReactNode
  maxHeight?: string
  enableVerticalScroll?: boolean
  className?: string
}

const HorizontalScrollArea = React.forwardRef<
  HTMLDivElement,
  HorizontalScrollAreaProps
>(({ className, children, maxHeight = "400px", enableVerticalScroll = true }, ref) => (
  <CustomScrollArea 
    className={cn("w-full", className)}
    style={{ maxHeight }}
  >
    <div className={cn(
      "min-w-max",
      enableVerticalScroll ? "min-h-fit" : "h-full"
    )}>
      {children}
    </div>
  </CustomScrollArea>
))

HorizontalScrollArea.displayName = "HorizontalScrollArea"

export { HorizontalScrollArea }