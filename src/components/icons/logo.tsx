
import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 50"
      width="130" // Adjusted width for "Admin Panel"
      height="30"
      aria-label="Logo Admin Panel"
      {...props}
    >
      <rect width="200" height="50" fill="transparent" />
      {/* Simple icon, can be replaced with a more TailAdmin-like one if needed */}
      <path d="M10 15 L10 35 L22 25 Z" fill="hsl(var(--primary))" /> 
      <text
        fontFamily="'PT Sans', sans-serif" // Consider changing to Inter or similar for TailAdmin feel
        fontSize="22" // Adjusted font size
        fontWeight="bold"
        fill="hsl(var(--foreground))" // Use main foreground color
        x="30" // Adjusted x position
        y="33" // Adjusted y for vertical centering
      >
        Admin Panel
      </text>
    </svg>
  );
}
