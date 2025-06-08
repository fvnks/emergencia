
import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 50"
      width="170"
      height="30"
      aria-label="Logo Gestor de Brigada"
      {...props}
    >
      <rect width="200" height="50" fill="transparent" />
      {/* New Icon: Shield with a plus sign */}
      <path
        d="M 8 15 L 22 15 L 22 25 L 15 32 L 8 25 Z" // Shield shape
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="1.5"
      />
      <path
        d="M 12 23.5 H 18 M 15 20.5 V 26.5" // Plus sign shape
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="1.5"
      />
      <text
        fontFamily="'PT Sans', sans-serif"
        fontSize="18"
        fontWeight="bold"
        fill="hsl(var(--foreground))"
        x="30"
        y="33"
        className="group-data-[collapsible=icon]:hidden"
      >
        Gestor Brigada
      </text>
    </svg>
  );
}
