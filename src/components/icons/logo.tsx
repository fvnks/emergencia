
import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 50" // ViewBox kept same
      width="170" // Ancho ajustado
      height="30"
      aria-label="Logo Gestor de Brigada"
      {...props}
    >
      <rect width="200" height="50" fill="transparent" />
      {/* New Icon: Diamond with a cross inside */}
      <path
        d="M12 18 L19 25 L12 32 L5 25 Z" // Diamond shape
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="1.5" // Adjusted stroke width for a cleaner look
      />
      <path
        d="M12 27 L12 31 M10 29 L14 29" // Cross shape
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="1.5" // Adjusted stroke width
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
