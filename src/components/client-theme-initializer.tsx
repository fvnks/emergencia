
"use client";

import { useEffect } from 'react';

const LOCALSTORAGE_THEME_PRIMARY_HSL = "customThemePrimaryHsl";
const LOCALSTORAGE_THEME_ACCENT_HSL = "customThemeAccentHsl";

// Valores por defecto HSL definidos en globals.css (solo para fallback robusto aquí)
const DEFAULT_PRIMARY_H = "210";
const DEFAULT_PRIMARY_S = "92%";
const DEFAULT_PRIMARY_L = "59%";

const DEFAULT_ACCENT_H = "174";
const DEFAULT_ACCENT_S = "72%";
const DEFAULT_ACCENT_L = "56%";


export function ClientThemeInitializer() {
  useEffect(() => {
    const root = document.documentElement;
    const primaryHslStr = localStorage.getItem(LOCALSTORAGE_THEME_PRIMARY_HSL);
    const accentHslStr = localStorage.getItem(LOCALSTORAGE_THEME_ACCENT_HSL);

    if (primaryHslStr) {
        const parts = primaryHslStr.split(" ");
        if (parts.length === 3) {
            const h = parseFloat(parts[0]);
            const s = parseFloat(parts[1].replace('%',''));
            const l = parseFloat(parts[2].replace('%',''));

            if(!isNaN(h) && !isNaN(s) && !isNaN(l)) {
              root.style.setProperty('--primary-h', `${h}`);
              root.style.setProperty('--primary-s', `${s}%`);
              root.style.setProperty('--primary-l', `${l}%`);
              root.style.setProperty('--primary', `hsl(${h} ${s}% ${l}%)`);
            } else {
              console.warn("Invalid primary HSL string in localStorage:", primaryHslStr, "- Applying CSS defaults by removing inline styles.");
              localStorage.removeItem(LOCALSTORAGE_THEME_PRIMARY_HSL);
              root.style.removeProperty('--primary-h');
              root.style.removeProperty('--primary-s');
              root.style.removeProperty('--primary-l');
              root.style.removeProperty('--primary');
            }
        } else {
             console.warn("Malformed primary HSL string in localStorage:", primaryHslStr, "- Applying CSS defaults by removing inline styles.");
             localStorage.removeItem(LOCALSTORAGE_THEME_PRIMARY_HSL);
             root.style.removeProperty('--primary-h');
             root.style.removeProperty('--primary-s');
             root.style.removeProperty('--primary-l');
             root.style.removeProperty('--primary');
        }
    } else {
        // No custom primary in LS, ensure no inline styles override globals.css
        root.style.removeProperty('--primary-h');
        root.style.removeProperty('--primary-s');
        root.style.removeProperty('--primary-l');
        root.style.removeProperty('--primary');
    }

    if (accentHslStr) {
        const parts = accentHslStr.split(" ");
        if (parts.length === 3) {
            const h = parseFloat(parts[0]);
            const s = parseFloat(parts[1].replace('%',''));
            const l = parseFloat(parts[2].replace('%',''));
            
             if(!isNaN(h) && !isNaN(s) && !isNaN(l)) {
              root.style.setProperty('--accent-h', `${h}`);
              root.style.setProperty('--accent-s', `${s}%`);
              root.style.setProperty('--accent-l', `${l}%`);
              root.style.setProperty('--accent', `hsl(${h} ${s}% ${l}%)`);
            } else {
              console.warn("Invalid accent HSL string in localStorage:", accentHslStr, "- Applying CSS defaults by removing inline styles.");
              localStorage.removeItem(LOCALSTORAGE_THEME_ACCENT_HSL);
              root.style.removeProperty('--accent-h');
              root.style.removeProperty('--accent-s');
              root.style.removeProperty('--accent-l');
              root.style.removeProperty('--accent');
            }
        } else {
            console.warn("Malformed accent HSL string in localStorage:", accentHslStr, "- Applying CSS defaults by removing inline styles.");
            localStorage.removeItem(LOCALSTORAGE_THEME_ACCENT_HSL);
            root.style.removeProperty('--accent-h');
            root.style.removeProperty('--accent-s');
            root.style.removeProperty('--accent-l');
            root.style.removeProperty('--accent');
        }
    } else {
        // No custom accent in LS, ensure no inline styles override globals.css
        root.style.removeProperty('--accent-h');
        root.style.removeProperty('--accent-s');
        root.style.removeProperty('--accent-l');
        root.style.removeProperty('--accent');
    }
  }, []); 

  return null;
}
    
    
    