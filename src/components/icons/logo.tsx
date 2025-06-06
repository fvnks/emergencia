
import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 50" // Ancho aumentado para "Gestor de Brigada"
      width="170" // Ancho ajustado
      height="30"
      aria-label="Logo Gestor de Brigada"
      {...props}
    >
      <rect width="200" height="50" fill="transparent" />
      {/* Icono simple tipo escudo o estrella de la vida (simplificado) */}
      <path d="M12 10 L20 18 L12 26 L4 18 Z M12 25 L12 37 M7 31 L17 31" 
        fill="none" stroke="hsl(var(--primary))" strokeWidth="2" 
      />
      <text
        fontFamily="'PT Sans', sans-serif"
        fontSize="18" // Ajustado para el nuevo texto
        fontWeight="bold"
        fill="hsl(var(--foreground))"
        x="30" // Ajustado para el icono más ancho
        y="33"
        className="group-data-[collapsible=icon]:hidden"
      >
        Gestor Brigada
      </text>
    </svg>
  );
}
