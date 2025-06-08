
"use client";

import { useEffect } from 'react';

const LOCALSTORAGE_PRIMARY_COLOR_KEY = "customPrimaryColorHSL";
const LOCALSTORAGE_ACCENT_COLOR_KEY = "customAccentColorHSL";

// Default values from globals.css (ensure these match your CSS)
const DEFAULT_PRIMARY_H = "210";
const DEFAULT_PRIMARY_S = "92%";
const DEFAULT_PRIMARY_L = "59%";

const DEFAULT_ACCENT_H = "174";
const DEFAULT_ACCENT_S = "72%";
const DEFAULT_ACCENT_L = "56%";


function parseAndApplyHSL(key: string, cssVarPrefix: string, defaultH: string, defaultS: string, defaultL: string) {
  const root = document.documentElement;
  const storedValue = localStorage.getItem(key);

  if (storedValue) {
    const parts = storedValue.split(" ");
    if (parts.length === 3) {
      const h = parseFloat(parts[0]);
      const s = parseFloat(parts[1].replace('%', ''));
      const l = parseFloat(parts[2].replace('%', ''));

      if (!isNaN(h) && !isNaN(s) && !isNaN(l) &&
          h >= 0 && h <= 360 &&
          s >= 0 && s <= 100 &&
          l >= 0 && l <= 100)
      {
        root.style.setProperty(`--${cssVarPrefix}-h`, String(h));
        root.style.setProperty(`--${cssVarPrefix}-s`, `${s}%`);
        root.style.setProperty(`--${cssVarPrefix}-l`, `${l}%`);
        root.style.setProperty(`--${cssVarPrefix}`, `hsl(${h} ${s}% ${l}%)`);
        return; // Successfully applied
      } else {
        console.warn(`Invalid HSL string in localStorage for ${key}: "${storedValue}". Removing and using defaults.`);
        localStorage.removeItem(key);
      }
    } else {
        console.warn(`Malformed HSL string in localStorage for ${key}: "${storedValue}". Removing and using defaults.`);
        localStorage.removeItem(key);
    }
  }
  
  // Apply defaults if no valid stored value
  root.style.setProperty(`--${cssVarPrefix}-h`, defaultH);
  root.style.setProperty(`--${cssVarPrefix}-s`, defaultS);
  root.style.setProperty(`--${cssVarPrefix}-l`, defaultL);
  root.style.setProperty(`--${cssVarPrefix}`, `hsl(${defaultH} ${defaultS} ${defaultL})`);
}


export function ClientThemeInitializer() {
  useEffect(() => {
    parseAndApplyHSL(LOCALSTORAGE_PRIMARY_COLOR_KEY, "primary", DEFAULT_PRIMARY_H, DEFAULT_PRIMARY_S, DEFAULT_PRIMARY_L);
    parseAndApplyHSL(LOCALSTORAGE_ACCENT_COLOR_KEY, "accent", DEFAULT_ACCENT_H, DEFAULT_ACCENT_S, DEFAULT_ACCENT_L);

    const handleThemeChange = () => {
        parseAndApplyHSL(LOCALSTORAGE_PRIMARY_COLOR_KEY, "primary", DEFAULT_PRIMARY_H, DEFAULT_PRIMARY_S, DEFAULT_PRIMARY_L);
        parseAndApplyHSL(LOCALSTORAGE_ACCENT_COLOR_KEY, "accent", DEFAULT_ACCENT_H, DEFAULT_ACCENT_S, DEFAULT_ACCENT_L);
    };
    window.addEventListener('themeColorsChanged', handleThemeChange);
    // Also re-apply if the main theme (dark/light) changes via next-themes
    // This is a bit of a workaround, ideally next-themes could provide a more direct hook.
    const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class' && mutation.target === document.documentElement) {
                handleThemeChange();
            }
        }
    });
    observer.observe(document.documentElement, { attributes: true });

    return () => {
        window.removeEventListener('themeColorsChanged', handleThemeChange);
        observer.disconnect();
    };
  }, []);

  return null;
}

    