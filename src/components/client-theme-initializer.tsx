
"use client";

import { useEffect } from 'react';

const LOCALSTORAGE_THEME_PRIMARY_HSL = "customThemePrimaryHsl";
const LOCALSTORAGE_THEME_ACCENT_HSL = "customThemeAccentHsl";

export function ClientThemeInitializer() {
  useEffect(() => {
    const root = document.documentElement;
    const primaryHslStr = localStorage.getItem(LOCALSTORAGE_THEME_PRIMARY_HSL);
    const accentHslStr = localStorage.getItem(LOCALSTORAGE_THEME_ACCENT_HSL);

    if (primaryHslStr) {
        const [h, s, l] = primaryHslStr.split(" ").map(v => parseFloat(v.replace('%','')));
        if(!isNaN(h) && !isNaN(s) && !isNaN(l)) {
          root.style.setProperty('--primary-h', `${h}`);
          root.style.setProperty('--primary-s', `${s}%`);
          root.style.setProperty('--primary-l', `${l}%`);
          // Also set the composite --primary variable for direct use by some components
          root.style.setProperty('--primary', `hsl(${h} ${s}% ${l}%)`);
        } else {
          console.warn("Invalid primary HSL string in localStorage:", primaryHslStr);
          localStorage.removeItem(LOCALSTORAGE_THEME_PRIMARY_HSL); // Clean up invalid
        }
    }
    if (accentHslStr) {
        const [h, s, l] = accentHslStr.split(" ").map(v => parseFloat(v.replace('%','')));
         if(!isNaN(h) && !isNaN(s) && !isNaN(l)) {
          root.style.setProperty('--accent-h', `${h}`);
          root.style.setProperty('--accent-s', `${s}%`);
          root.style.setProperty('--accent-l', `${l}%`);
          // Also set the composite --accent variable
          root.style.setProperty('--accent', `hsl(${h} ${s}% ${l}%)`);
        } else {
          console.warn("Invalid accent HSL string in localStorage:", accentHslStr);
          localStorage.removeItem(LOCALSTORAGE_THEME_ACCENT_HSL); // Clean up invalid
        }
    }
  }, []); // Empty dependency array ensures this runs once on client mount

  return null; // This component does not render anything visible
}

    