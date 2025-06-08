
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Image as ImageIcon, Type, Palette as PaletteIcon, Save, RotateCcw } from "lucide-react";
import Link from "next/link";

const LOCALSTORAGE_LOGO_URL_KEY = "customLogoUrl";
const LOCALSTORAGE_LOGO_TEXT_KEY = "customLogoText";
const DEFAULT_LOGO_TEXT = "Gestor Brigada";

export default function AppearanceSettingsPage() {
  const { toast } = useToast();

  const [logoUrl, setLogoUrl] = useState(""); 
  const [logoText, setLogoText] = useState(DEFAULT_LOGO_TEXT);
  const [primaryColor, setPrimaryColor] = useState("#3294F8");
  const [accentColor, setAccentColor] = useState("#40E0D0");
  const [backgroundColor, setBackgroundColor] = useState("#E8F4FD");

  useEffect(() => {
    const storedLogoUrl = localStorage.getItem(LOCALSTORAGE_LOGO_URL_KEY);
    const storedLogoText = localStorage.getItem(LOCALSTORAGE_LOGO_TEXT_KEY);
    if (storedLogoUrl) {
      setLogoUrl(storedLogoUrl);
    }
    if (storedLogoText) {
      setLogoText(storedLogoText);
    }
  }, []);

  const handleSaveLogo = () => {
    localStorage.setItem(LOCALSTORAGE_LOGO_URL_KEY, logoUrl);
    localStorage.setItem(LOCALSTORAGE_LOGO_TEXT_KEY, logoText);
    toast({ title: "Logo Actualizado", description: "Los cambios en el logo se han guardado en este navegador." });
    // For changes to reflect immediately in the layout, we might need a context or event emitter,
    // or simply rely on a page refresh/navigation. For now, localStorage is updated.
    // A manual refresh might be needed to see changes in the sidebar header immediately if not handled by context.
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
    toast({ title: "Funcionalidad Pendiente", description: "La personalización de colores se implementará en el futuro." });
  };

  const handleRestoreDefaultColors = () => {
    toast({ title: "Funcionalidad Pendiente", description: "La restauración de colores por defecto se implementará en el futuro." });
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
          Ajusta el logo y los colores del panel para que se adapten a tu organización.
        </p>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center"><ImageIcon className="mr-2 h-5 w-5 text-primary" /> Configuración del Logo</CardTitle>
          <CardDescription>Personaliza el logo y el texto que se muestra en la barra de navegación. Los cambios son locales a tu navegador.</CardDescription>
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
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button onClick={handleSaveLogo}><Save className="mr-2 h-4 w-4" /> Guardar Cambios de Logo</Button>
            <Button variant="outline" onClick={handleRestoreDefaultLogo}><RotateCcw className="mr-2 h-4 w-4" /> Restaurar Logo</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center"><PaletteIcon className="mr-2 h-5 w-5 text-primary" /> Colores del Tema</CardTitle>
          <CardDescription>
            Ajusta los colores principales de la interfaz.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div className="space-y-1">
              <Label htmlFor="primaryColor">Color Primario</Label>
              <Input 
                id="primaryColor" 
                type="color" 
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="h-10 p-1"
                disabled
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="accentColor">Color de Acento</Label>
              <Input 
                id="accentColor" 
                type="color" 
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="h-10 p-1"
                disabled
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="backgroundColor">Fondo Principal (Claro)</Label>
              <Input 
                id="backgroundColor" 
                type="color" 
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="h-10 p-1"
                disabled
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button onClick={handleApplyColors} disabled>Aplicar Colores (Próximamente)</Button>
            <Button variant="outline" onClick={handleRestoreDefaultColors} disabled>Restaurar Colores (Próximamente)</Button>
          </div>
            <p className="text-xs text-muted-foreground">
              Nota: La personalización completa y persistente de colores requiere ajustes en los archivos CSS base y/o un backend.
              Actualmente, esta funcionalidad está deshabilitada.
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
