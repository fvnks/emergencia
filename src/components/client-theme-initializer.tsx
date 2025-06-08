
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
        const [h, s, l] = primaryHslStr.split(" ").map(Number);
        if(!isNaN(h) && !isNaN(s) && !isNaN(l)) {
          root.style.setProperty('--primary-h', `${h}`);
          root.style.setProperty('--primary-s', `${s}%`);
          root.style.setProperty('--primary-l', `${l}%`);
          root.style.setProperty('--primary', `hsl(${h} ${s}% ${l}%)`);
        }
    }
    if (accentHslStr) {
        const [h, s, l] = accentHslStr.split(" ").map(Number);
         if(!isNaN(h) && !isNaN(s) && !isNaN(l)) {
          root.style.setProperty('--accent-h', `${h}`);
          root.style.setProperty('--accent-s', `${s}%`);
          root.style.setProperty('--accent-l', `${l}%`);
          root.style.setProperty('--accent', `hsl(${h} ${s}% ${l}%)`);
        }
    }
  }, []);

  return null; // Este componente no renderiza nada visible
}

    