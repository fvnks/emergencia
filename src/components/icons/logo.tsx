
import type { SVGProps } from "react";
import { useState, useEffect } from "react";

const LOCALSTORAGE_LOGO_TEXT_KEY = "customLogoText";
const DEFAULT_LOGO_TEXT = "Gestor Brigada";

export function Logo(props: SVGProps<SVGSVGElement> & { showText?: boolean }) {
  const { showText = true, ...svgProps } = props;
  const [displayText, setDisplayText] = useState(DEFAULT_LOGO_TEXT);

  useEffect(() => {
    const storedLogoText = localStorage.getItem(LOCALSTORAGE_LOGO_TEXT_KEY);
    if (storedLogoText) {
      setDisplayText(storedLogoText);
    } else {
      setDisplayText(DEFAULT_LOGO_TEXT);
    }

    const handleStorageChange = () => {
      const updatedStoredLogoText = localStorage.getItem(LOCALSTORAGE_LOGO_TEXT_KEY);
      setDisplayText(updatedStoredLogoText || DEFAULT_LOGO_TEXT);
    };
    
    window.addEventListener('customLogoChanged', handleStorageChange); // Listen for our custom event
    window.addEventListener('storage', handleStorageChange); // Standard storage event (might not fire for same-tab changes)

    return () => {
      window.removeEventListener('customLogoChanged', handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);


  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 50"
      width="170"
      height="30"
      aria-label="Logo Gestor de Brigada"
      {...svgProps}
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
      {showText && (
        <text
          fontFamily="'PT Sans', sans-serif"
          fontSize="18"
          fontWeight="bold"
          fill="hsl(var(--foreground))"
          x="30"
          y="33"
          className="group-data-[collapsible=icon]:hidden"
        >
          {displayText}
        </text>
      )}
    </svg>
  );
}
