
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Image as ImageIcon, Type, Palette as PaletteIcon, Save, RotateCcw } from "lucide-react";
import Link from "next/link";

export default function AppearanceSettingsPage() {
  const { toast } = useToast();

  // Estados para los campos (simulados)
  const [logoUrl, setLogoUrl] = useState("https://placehold.co/150x40/3294F8/FFFFFF.png?text=Mi+Logo"); // URL de placeholder
  const [logoText, setLogoText] = useState("Gestor de Brigada");
  const [primaryColor, setPrimaryColor] = useState("#3294F8"); // Deep sky blue
  const [accentColor, setAccentColor] = useState("#40E0D0"); // Turquoise
  const [backgroundColor, setBackgroundColor] = useState("#E8F4FD"); // Light grayish blue

  const handleSaveLogo = () => {
    // Lógica de guardado (simulada, ej. localStorage)
    localStorage.setItem("customLogoUrl", logoUrl);
    localStorage.setItem("customLogoText", logoText);
    toast({ title: "Logo Actualizado", description: "Los cambios en el logo se han guardado (simulado)." });
  };

  const handleRestoreDefaultLogo = () => {
    const defaultText = "Gestor Brigada";
    setLogoUrl(""); // O una URL de logo por defecto si la tuvieras
    setLogoText(defaultText);
    localStorage.removeItem("customLogoUrl");
    localStorage.setItem("customLogoText", defaultText); // Guardar el texto por defecto
    toast({ title: "Logo Restaurado", description: "El logo ha sido restaurado a los valores por defecto." });
  };
  
  const handleApplyColors = () => {
    // Lógica para aplicar colores dinámicamente (ej. CSS variables) y guardar en localStorage
    document.documentElement.style.setProperty('--primary-temp', primaryColor); // Ejemplo, necesitarías HSL
    document.documentElement.style.setProperty('--accent-temp', accentColor);
    document.documentElement.style.setProperty('--background-temp', backgroundColor);
    toast({ title: "Colores Aplicados (Vista Previa)", description: "Los colores se han aplicado para esta sesión (simulado)." });
    // Aquí normalmente se guardarían en localStorage y se aplicarían al cargar la app.
  };

  const handleRestoreDefaultColors = () => {
    // Lógica para restaurar colores por defecto
    // Eliminar de localStorage y resetear CSS variables si se modificaron.
    setPrimaryColor("#3294F8");
    setAccentColor("#40E0D0");
    setBackgroundColor("#E8F4FD");
    // Aquí se revertirían las CSS variables a las de globals.css
    document.documentElement.style.removeProperty('--primary-temp');
    document.documentElement.style.removeProperty('--accent-temp');
    document.documentElement.style.removeProperty('--background-temp');
    toast({ title: "Colores Restaurados", description: "Los colores han sido restaurados a los valores por defecto." });
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
            <p className="text-xs text-muted-foreground">Pega la URL de una imagen alojada externamente. La subida de archivos no está soportada en esta versión.</p>
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
            Ajusta los colores principales de la interfaz. Los cambios son locales a tu navegador.
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
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button onClick={handleApplyColors} disabled>Aplicar Colores (Próximamente)</Button>
            <Button variant="outline" onClick={handleRestoreDefaultColors} disabled>Restaurar Colores (Próximamente)</Button>
          </div>
            <p className="text-xs text-muted-foreground">
              Nota: La personalización completa y persistente de colores requiere ajustes en los archivos CSS base y/o un backend.
              Actualmente, los cambios aplicados son temporales para demostración.
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
