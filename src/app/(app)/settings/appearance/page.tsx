
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter, // Importar CardFooter
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Image as ImageIcon, Palette as PaletteIcon, Save, RotateCcw } from "lucide-react";
import Link from "next/link";

const LOCALSTORAGE_LOGO_URL_KEY = "customLogoUrl";
const LOCALSTORAGE_LOGO_TEXT_KEY = "customLogoText";
const DEFAULT_LOGO_TEXT = "Gestor Brigada";

const LOCALSTORAGE_THEME_PRIMARY_HSL = "customThemePrimaryHsl";
const LOCALSTORAGE_THEME_ACCENT_HSL = "customThemeAccentHsl";

// Colores HSL por defecto (los mismos que en globals.css)
const DEFAULT_PRIMARY_HSL_STRING = "210 92% 59%"; // #3294F8
const DEFAULT_ACCENT_HSL_STRING = "174 72% 56%";  // #40E0D0

// --- Funciones de Ayuda para Colores ---
function hexToHsl(hex: string): [number, number, number] | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
      default: h = 0; // Should not happen
    }
    h /= 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (val: number) => Math.round(val * 255).toString(16).padStart(2, '0');
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}
// --- Fin Funciones de Ayuda para Colores ---

export default function AppearanceSettingsPage() {
  const { toast } = useToast();

  const [logoUrl, setLogoUrl] = useState("");
  const [logoText, setLogoText] = useState(DEFAULT_LOGO_TEXT);

  const [primaryColorHex, setPrimaryColorHex] = useState("#3294F8");
  const [accentColorHex, setAccentColorHex] = useState("#40E0D0");
  const [backgroundColorHex, setBackgroundColorHex] = useState("#E8F4FD");

  const applyCustomColorsToDOM = (primaryHslStr: string | null, accentHslStr: string | null) => {
    const root = document.documentElement;
    if (primaryHslStr) {
        const [h, s, l] = primaryHslStr.split(" ").map(v => parseFloat(v.replace('%','')));
        if(!isNaN(h) && !isNaN(s) && !isNaN(l)) {
            root.style.setProperty('--primary-h', `${h}`);
            root.style.setProperty('--primary-s', `${s}%`);
            root.style.setProperty('--primary-l', `${l}%`);
            root.style.setProperty('--primary', `hsl(${h} ${s}% ${l}%)`);
        } else {
             console.warn("Valores HSL primarios inválidos al aplicar al DOM:", primaryHslStr);
        }
    }
    if (accentHslStr) {
        const [h, s, l] = accentHslStr.split(" ").map(v => parseFloat(v.replace('%','')));
         if(!isNaN(h) && !isNaN(s) && !isNaN(l)) {
            root.style.setProperty('--accent-h', `${h}`);
            root.style.setProperty('--accent-s', `${s}%`);
            root.style.setProperty('--accent-l', `${l}%`);
            root.style.setProperty('--accent', `hsl(${h} ${s}% ${l}%)`);
        } else {
            console.warn("Valores HSL de acento inválidos al aplicar al DOM:", accentHslStr);
        }
    }
  };

  useEffect(() => {
    // Logo
    const storedLogoUrl = localStorage.getItem(LOCALSTORAGE_LOGO_URL_KEY);
    const storedLogoText = localStorage.getItem(LOCALSTORAGE_LOGO_TEXT_KEY);
    if (storedLogoUrl) setLogoUrl(storedLogoUrl);
    if (storedLogoText) setLogoText(storedLogoText);

    // Colors
    const storedPrimaryHsl = localStorage.getItem(LOCALSTORAGE_THEME_PRIMARY_HSL);
    const storedAccentHsl = localStorage.getItem(LOCALSTORAGE_THEME_ACCENT_HSL);

    let initialPrimaryHsl = DEFAULT_PRIMARY_HSL_STRING;
    let initialAccentHsl = DEFAULT_ACCENT_HSL_STRING;

    if (storedPrimaryHsl) {
      const [h,s,l] = storedPrimaryHsl.split(" ").map(v => parseFloat(v.replace('%','')));
      if(!isNaN(h) && !isNaN(s) && !isNaN(l)) {
        setPrimaryColorHex(hslToHex(h,s,l));
        initialPrimaryHsl = storedPrimaryHsl;
      } else {
         localStorage.removeItem(LOCALSTORAGE_THEME_PRIMARY_HSL); // Remove invalid stored value
      }
    } else {
      const [h,s,l] = DEFAULT_PRIMARY_HSL_STRING.split(" ").map(v => parseFloat(v.replace('%','')));
       if(!isNaN(h) && !isNaN(s) && !isNaN(l)) setPrimaryColorHex(hslToHex(h,s,l));
    }

    if (storedAccentHsl) {
      const [h,s,l] = storedAccentHsl.split(" ").map(v => parseFloat(v.replace('%','')));
      if(!isNaN(h) && !isNaN(s) && !isNaN(l)) {
        setAccentColorHex(hslToHex(h,s,l));
        initialAccentHsl = storedAccentHsl;
      } else {
         localStorage.removeItem(LOCALSTORAGE_THEME_ACCENT_HSL); // Remove invalid stored value
      }
    } else {
       const [h,s,l] = DEFAULT_ACCENT_HSL_STRING.split(" ").map(v => parseFloat(v.replace('%','')));
       if(!isNaN(h) && !isNaN(s) && !isNaN(l)) setAccentColorHex(hslToHex(h,s,l));
    }
    
    // La aplicación inicial al DOM ahora está en ClientThemeInitializer, pero podemos llamarla aquí
    // también para asegurar que la vista previa en esta página sea correcta si ClientThemeInitializer fallara o se retrasara.
    applyCustomColorsToDOM(initialPrimaryHsl, initialAccentHsl);

  }, []);

  const handleSaveLogo = () => {
    localStorage.setItem(LOCALSTORAGE_LOGO_URL_KEY, logoUrl);
    localStorage.setItem(LOCALSTORAGE_LOGO_TEXT_KEY, logoText);
    toast({ title: "Logo Actualizado", description: "Los cambios en el logo se han guardado en este navegador." });
    window.dispatchEvent(new Event('customLogoChanged'));
  };

  const handleRestoreDefaultLogo = () => {
    setLogoUrl("");
    setLogoText(DEFAULT_LOGO_TEXT);
    localStorage.removeItem(LOCALSTORAGE_LOGO_URL_KEY);
    localStorage.removeItem(LOCALSTORAGE_LOGO_TEXT_KEY);
    toast({ title: "Logo Restaurado", description: "El logo ha sido restaurado a los valores por defecto." });
    window.dispatchEvent(new Event('customLogoChanged'));
  };
  
  const handleApplyColors = () => {
    const primaryHslArr = hexToHsl(primaryColorHex);
    const accentHslArr = hexToHsl(accentColorHex);

    if (primaryHslArr && accentHslArr) {
      const primaryHslStr = `${primaryHslArr[0]} ${primaryHslArr[1]}% ${primaryHslArr[2]}%`;
      const accentHslStr = `${accentHslArr[0]} ${accentHslArr[1]}% ${accentHslArr[2]}%`;
      
      localStorage.setItem(LOCALSTORAGE_THEME_PRIMARY_HSL, primaryHslStr);
      localStorage.setItem(LOCALSTORAGE_THEME_ACCENT_HSL, accentHslStr);
      
      applyCustomColorsToDOM(primaryHslStr, accentHslStr);
      
      toast({ title: "Colores Aplicados", description: "Los colores del tema han sido actualizados en este navegador." });
    } else {
      toast({ title: "Error de Color", description: "Uno de los códigos HEX no es válido.", variant: "destructive" });
    }
  };

  const handleRestoreDefaultColors = () => {
    localStorage.removeItem(LOCALSTORAGE_THEME_PRIMARY_HSL);
    localStorage.removeItem(LOCALSTORAGE_THEME_ACCENT_HSL);

    applyCustomColorsToDOM(DEFAULT_PRIMARY_HSL_STRING, DEFAULT_ACCENT_HSL_STRING);
    
    const [defPH, defPS, defPL] = DEFAULT_PRIMARY_HSL_STRING.split(" ").map(v => parseFloat(v.replace('%','')));
    setPrimaryColorHex(hslToHex(defPH, defPS, defPL));
    const [defAH, defAS, defAL] = DEFAULT_ACCENT_HSL_STRING.split(" ").map(v => parseFloat(v.replace('%','')));
    setAccentColorHex(hslToHex(defAH, defAS, defAL));

    toast({ title: "Colores Restaurados", description: "Los colores del tema han sido restaurados a los valores por defecto." });
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <Button variant="outline" asChild className="mb-6">
        <Link href="/settings"><ArrowLeft className="mr-2 h-4 w-4" /> Volver a Configuración</Link>
      </Button>

      <div>
        <h1 className="text-3xl font-headline font-bold flex items-center">
          <PaletteIcon className="mr-3 h-7 w-7 text-primary" />
          Personalización de Apariencia
        </h1>
        <p className="text-muted-foreground mt-1">
          Ajusta el logo y los colores del panel para que se adapten a tu organización. Los cambios son locales a tu navegador.
        </p>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center"><ImageIcon className="mr-2 h-5 w-5 text-primary" /> Configuración del Logo</CardTitle>
          <CardDescription>Personaliza el logo y el texto que se muestra en la barra de navegación.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="logoUrl">URL de la Imagen del Logo (Opcional)</Label>
            <Input 
              id="logoUrl" 
              placeholder="https://ejemplo.com/logo.png" 
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Pega la URL de una imagen alojada externamente. La subida de archivos no está soportada.</p>
          </div>
          <div className="space-y-1">
            <Label htmlFor="logoText">Texto del Logo</Label>
            <Input 
              id="logoText" 
              placeholder="Nombre de tu Brigada" 
              value={logoText}
              onChange={(e) => setLogoText(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
            <Button onClick={handleSaveLogo}><Save className="mr-2 h-4 w-4" /> Guardar Cambios de Logo</Button>
            <Button variant="outline" onClick={handleRestoreDefaultLogo}><RotateCcw className="mr-2 h-4 w-4" /> Restaurar Logo</Button>
        </CardFooter>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center"><PaletteIcon className="mr-2 h-5 w-5 text-primary" /> Colores del Tema</CardTitle>
          <CardDescription>
            Ajusta los colores primario y de acento de la interfaz.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div className="space-y-1">
              <Label htmlFor="primaryColor">Color Primario</Label>
              <Input 
                id="primaryColor" 
                type="color" 
                value={primaryColorHex}
                onChange={(e) => setPrimaryColorHex(e.target.value)}
                className="h-10 p-1"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="accentColor">Color de Acento</Label>
              <Input 
                id="accentColor" 
                type="color" 
                value={accentColorHex}
                onChange={(e) => setAccentColorHex(e.target.value)}
                className="h-10 p-1"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="backgroundColor">Fondo Principal (Claro)</Label>
              <Input 
                id="backgroundColor" 
                type="color" 
                value={backgroundColorHex}
                onChange={(e) => setBackgroundColorHex(e.target.value)}
                className="h-10 p-1"
                disabled
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Nota: La personalización del fondo y la integración completa con el modo oscuro requieren ajustes más profundos.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
            <Button onClick={handleApplyColors}>Aplicar Colores</Button>
            <Button variant="outline" onClick={handleRestoreDefaultColors}>Restaurar Colores</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
    
