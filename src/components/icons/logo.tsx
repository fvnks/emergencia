import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 50"
      width="120"
      height="30"
      aria-label="Logo Gestor de Brigada"
      {...props}
    >
      <rect width="200" height="50" fill="transparent" />
      <path d="M10 10 L10 40 L25 25 Z" fill="hsl(var(--sidebar-foreground))" />
      <text
        x="35"
        y="32"
        fontFamily="'PT Sans', sans-serif"
        fontSize="24"
        fontWeight="bold"
        fill="hsl(var(--sidebar-foreground))"
      >
        Gestor de Brigada
      </text>
    </svg>
  );
}
