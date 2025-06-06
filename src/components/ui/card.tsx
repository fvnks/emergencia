
import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-md", // Changed default shadow to shadow-md
      "transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1", // Added hover effects
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-4 md:p-5", className)} // TailAdmin often uses p-4 or p-5 for card headers
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement, // Corrected from HTMLParagraphElement to HTMLDivElement for flexibility
  React.HTMLAttributes<HTMLDivElement> // Use HTMLDivElement attributes
>(({ className, children, ...props }, ref) => ( // Added children to be explicitly passed
  <div // Changed from h3 to div for more generic use, styling will dictate hierarchy
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight md:text-xl", // Slightly larger and bolder for titles
      className
    )}
    {...props}
  >
    {children}
  </div>
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement, // Corrected to HTMLDivElement
  React.HTMLAttributes<HTMLDivElement> // Use HTMLDivElement attributes
>(({ className, children, ...props }, ref) => ( // Added children
  <div // Changed from p to div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  >
    {children}
  </div>
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-4 md:p-5 pt-0", className)} {...props} /> // Adjusted padding
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-4 md:p-5 pt-0", className)} // Adjusted padding
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
